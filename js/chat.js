import {fazerLogout} from './auth.js';
import { database, auth } from './config.js';
import { ref, query, orderByChild, limitToLast, onChildAdded } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { enviarMensagem } from './messages.js';


const sendButton = document.getElementById("sendButton");
const chat = document.getElementById("mainChat");


const logoutBtn = document.getElementById("logoutButton");
const statusDot = document.getElementById("statusDot");
const switchStatusBtn = document.getElementById("userDetails");
const mensagensRenderizadas = new Set();

/**
 * Monitora o estado da autenticação. 
 * Garante que as mensagens só sejam carregadas após o login do usuário.
 */

onAuthStateChanged(auth, (user) => {
    if (user) {
        carregarMensagens();
    }
});





/* ==================================Mensagens===================================*/

/**
 * Realiza a busca inicial no Firebase.
 * Implementa a paginação carregando apenas as últimas 50 mensagens para otimizar a performance.
 */
const carregarMensagens = () => {
    const mensagensRef = ref(database, 'messages');

    // REQUISITO: Implementar paginação (50 mensagens iniciais) e ordenação eficiente
    const consultaPaginada = query(
        mensagensRef,
        orderByChild('timestamp'),
        limitToLast(50) 
    );

    onChildAdded(consultaPaginada, (snapshot) => {
        const idMensagem = snapshot.key;

        if (mensagensRenderizadas.has(idMensagem)) return;

        const dados = snapshot.val();
        const usuarioAtual = auth.currentUser;
        if (!usuarioAtual) return;
        const meuUid = usuarioAtual.uid;

        const podeVer = 
            dados.visibility === true || 
            dados.receiver_id === meuUid || 
            dados.sender_id === meuUid;

        if (podeVer) {
            renderizarMensagem(dados, idMensagem);
            mensagensRenderizadas.add(idMensagem);
            
            chat.scrollTop = chat.scrollHeight;
        }
    });
};


sendButton.addEventListener("click", (e) => {
    e.preventDefault();
    const input = document.getElementById("newMsg");
    enviarMensagem(input.value);
});



/**
 * Valida a visibilidade da mensagem.
 * Filtra para que o usuário veja apenas mensagens públicas ou privadas onde ele é o remetente ou destinatário.
 */

function deveExibir(dados) {
    const usuarioAtual = auth.currentUser;
    if (!usuarioAtual) return false;
    const meuUid = usuarioAtual.uid;

    // Filtra privadas corretamente (sender ou receiver)
    return dados.visibility === true || 
           dados.receiver_id === meuUid || 
           dados.sender_id === meuUid;
}


/**
 * Filtro de busca por texto.
 * Realiza a filtragem diretamente nos elementos do DOM para evitar novas requisições ao servidor.
 */const filtrarBuscaTexto = (termo) => {
    const termoBaixo = termo.toLowerCase();
    document.querySelectorAll('.msgBox').forEach(msg => {
        const conteudo = msg.querySelector('.msgBoxText').textContent.toLowerCase();
        msg.style.display = conteudo.includes(termoBaixo) ? "flex" : "none";
    });
};




/* ===============================Renderização e Construção de Interface================================== */


/**
 * Constrói dinamicamente o HTML de cada mensagem.
 * Define estilos para mensagens enviadas/recebidas e insere atributos de acessibilidade e metadados.
 */

function renderizarMensagem(dados, id) {
    const usuarioAtual = auth.currentUser;
    const msgBox = document.createElement("div");
    msgBox.classList.add("msgBox");
    msgBox.dataset.id = id; 

    const isMine = dados.sender_id === usuarioAtual?.uid;
    
    
    msgBox.classList.add(isMine ? "sent" : "received");
    msgBox.classList.add(isMine ? "myMsg" : "otherMsg"); 

    let bubbleIcon = "assets/publicmsg.svg";
    if (dados.visibility === false) {
        bubbleIcon = "assets/privatemsg.svg";
        msgBox.classList.add("private"); 
    }

    const bubble = document.createElement("div");
    bubble.classList.add("msgBoxMessage");
    bubble.style.position = "relative"; 
    
    const icone = document.createElement("img");
    icone.src = bubbleIcon;
    icone.classList.add("bubble-corner-icon");
    
    const user = document.createElement("div");
    user.classList.add("msgBoxUser");
    
    //INDICADOR DE "PARA:"
    let textoDirecionamento = "";
    if (dados.receiver_id) {
        if (isMine) {
            textoDirecionamento = ` (para ${dados.receiver_name})`;
        } else if (dados.receiver_id === usuarioAtual?.uid) {
            textoDirecionamento = ` (para você)`;
        } else {
            textoDirecionamento = ` (para ${dados.receiver_name})`;
        }
    }
    user.textContent = (isMine ? "Você" : dados.sender_name) + textoDirecionamento;

    const text = document.createElement("div");
    text.classList.add("msgBoxText");
    text.textContent = dados.message_text; 

    const hour = document.createElement("div");
    hour.classList.add("msgBoxHour");
    
    hour.style.display = "flex";
    hour.style.alignItems = "center";
    hour.style.gap = "4px";
    hour.style.justifyContent = "flex-end";

   const timeText = document.createElement("span");
    timeText.textContent = dados.timestamp ? dados.timestamp.split(' ')[1].slice(0, 5) : "--:--";

    
    icone.className = ""; 
    icone.style.width = "15px";
    icone.style.height = "15px";

   
    hour.append(icone, timeText);

    
    bubble.append(user, text, hour);
    msgBox.append(bubble);
    
    msgBox.setAttribute('data-visibility', dados.visibility ? 'publica' : 'privada');
    msgBox.setAttribute("role", "article");
    msgBox.setAttribute("aria-label", `Nova mensagem de ${user.textContent}: ${dados.message_text}`);

    chat.appendChild(msgBox);
    chat.scrollTop = chat.scrollHeight;

    const audio = document.getElementById("beep");
    if(audio) audio.play().catch(e => console.log("Autoplay bloqueado pelo browser"));
}











const userListContainer = document.getElementById("userList");
userListContainer.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    selectUser(event);
});
userListContainer.addEventListener("click", selectUser);
function selectUser(event) {
    const user = event.target.closest(".userBox");

    if (!user) {
        clearSelection();
        return;
    }

    const selected = user.classList.contains("selected");
    clearSelection();

    if (!selected) {
        user.classList.add("selected");

        const rect = user.getBoundingClientRect();
        delUserBtn.setAttribute("tabindex", "0");
        delUserBtn.classList.add("selected");
        delUserBtn.hidden = false;
        delUserBtn.style.position = "absolute";
        delUserBtn.style.top = rect.top + window.scrollY + rect.height / 5 + "px";
        delUserBtn.style.left = rect.right + 15 + "px";
        user.appendChild(delUserBtn);
    }
}

function clearSelection() {
    document.querySelectorAll(".userBox.selected")
        .forEach(el => el.classList.remove("selected"));

    delUserBtn.classList.remove("selected");
    delUserBtn.hidden = true;
    delUserBtn.setAttribute("tabindex", "-1");
    document.body.appendChild(delUserBtn);
}

document.addEventListener("focusin", (event) => {
    const selected = document.querySelector(".userBox.selected");
    if (!selected) return;

    if (!selected.contains(event.target) &&
        !delUserBtn.contains(event.target)) {
        clearSelection();
    }
});




const dialog = document.getElementById("alertBox");
const cancelBtn = document.getElementById("cancelLogout");
const confirmBtn = document.getElementById("confirmLogout");

logoutBtn.addEventListener("click", () => {
    
    [...document.body.children].forEach(child => {
        if (child.id !== "alertBox") {
            child.classList.add("blur");
        }
    });

    dialog.showModal();
});

cancelBtn.addEventListener("click", () => {
    
    [...document.body.children].forEach(child => {
        child.classList.remove("blur");
    });
    
    dialog.close();
});

dialog.addEventListener("click", (e) => {

        
    [...document.body.children].forEach(child => {
        child.classList.remove("blur");
    });

    if (e.target === dialog) {
        dialog.close();
    }

});

dialog.addEventListener("close", () => {
    [...document.body.children].forEach(child => {
        child.classList.remove("blur");
    });
});


const confirmLogout = document.getElementById("confirmLogout");
confirmLogout.addEventListener("click", () => {
    fazerLogout();
});


fetch("assets/logo.svg")
  .then(res => res.text())
  .then(svg => {
    document.querySelector(".logo").innerHTML = svg;
});



document.querySelectorAll('input[name="category"]').forEach(input => {
    input.addEventListener('change', (e) => {
        document.getElementById('selected-value').innerText = e.target.nextElementSibling.innerText;
        document.getElementById('options-view-button').checked = false; // Fecha o menu
    });
});

// Seleciona todos os inputs de rádio
document.querySelectorAll('input[name="category"]').forEach(input => {

    input.addEventListener('change', function() {
        const iconInLi = this.parentElement.querySelector('i');
        const mainIcon = document.getElementById('main-icon');
        
        if (iconInLi && mainIcon) {
            mainIcon.className = iconInLi.className; 
            mainIcon.classList.remove('me-2'); 
        }

        const textLabel = this.getAttribute('data-label');
        document.getElementById('selected-value').textContent = textLabel;

        document.getElementById('options-view-button').checked = false;
    });
});




const radiosFiltro = document.querySelectorAll('input[name="category"]');

radiosFiltro.forEach(radio => {
    radio.addEventListener('change', function() {
        const filtroSelecionado = this.value;
        const mensagens = document.querySelectorAll(".msgBox");

        // PERFORMANCE: Filtragem visual direta no DOM
        mensagens.forEach(msg => {
            const visibilidadeMsg = msg.getAttribute('data-visibility');

            if (filtroSelecionado === "todas") {
                msg.style.display = "flex";
            } else {
                msg.style.display = (visibilidadeMsg === filtroSelecionado) ? "flex" : "none";
            }
        });

        const textLabel = this.nextElementSibling.textContent;
        document.getElementById('selected-value').textContent = textLabel;
        
        document.getElementById('options-view-button').checked = false;
        
        const chat = document.getElementById("mainChat");
        if(chat) chat.scrollTop = chat.scrollHeight;
    });
});



function inicializarTema() {
    const switchBtn = document.getElementById("switchThemeBtn");
    const temaSalvo = localStorage.getItem("tema");

    if (temaSalvo === "dark") {
        document.body.classList.add("dark");
        if (switchBtn) switchBtn.checked = true;
    }

    if (switchBtn) {
        switchBtn.addEventListener("change", () => {
            document.body.classList.toggle("dark");
            if (document.body.classList.contains("dark")) {
                localStorage.setItem("tema", "dark");
            } else {
                localStorage.setItem("tema", "light");
            }
        });
    }
}

inicializarTema();



switchStatusBtn.addEventListener("click", toggleStatus);
function toggleStatus() {
    const statusDesc = document.getElementById("statusDesc");
    if (statusDot.classList.contains('online')) {
        statusDot.classList.remove('online');
        statusDot.classList.add('away');
        statusDesc.textContent = "Away";
    } else if (statusDot.classList.contains('away')) {
        statusDot.classList.remove('away');
        statusDot.classList.add('online');
        statusDesc.textContent = "Online";
    }
}




const toggleBtn = document.getElementById("toggleAside");
const aside = document.querySelector("aside");
toggleBtn.addEventListener("click", () => {
    aside.classList.toggle("active");
})