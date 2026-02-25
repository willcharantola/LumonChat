import {fazerLogout} from './auth.js';
import { database, auth } from './config.js';
import { ref, onValue, query, orderByChild, limitToLast, onChildAdded, endBefore, get } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";
import { enviarMensagem } from './messages.js';

const sendButton = document.getElementById("sendButton");
const chat = document.getElementById("mainChat");
const deleteBtn = document.getElementById("delBtn");


const delUserBtn = document.getElementById("delUserBtn");
const switchStatusBtn = document.getElementById("userDetails");
const logoutBtn = document.getElementById("logoutButton");
const profileBtn = document.getElementById("profileBtn");

const mensagensRenderizadas = new Set();


sendButton.addEventListener("click", (e) => {
    e.preventDefault();
    const input = document.getElementById("newMsg");
    enviarMensagem(input.value);
});


//carregando mensagens enviadas para o servidor 



const carregarMensagens = () => {
    const mensagensRef = ref(database, 'messages');

    // REQUISITO: Implementar paginação (50 mensagens iniciais) e ordenação eficiente
    const consultaPaginada = query(
        mensagensRef,
        orderByChild('timestamp'),
        limitToLast(50) 
    );

    // REQUISITO: Manter performance com 500+ mensagens usando onChildAdded
    onChildAdded(consultaPaginada, (snapshot) => {
        const idMensagem = snapshot.key;

        // Evita duplicatas se a função for chamada novamente
        if (mensagensRenderizadas.has(idMensagem)) return;

        const dados = snapshot.val();
        const usuarioAtual = auth.currentUser;
        if (!usuarioAtual) return;
        const meuUid = usuarioAtual.uid;

        // REQUISITO: Filtrar mensagens privadas corretamente (sender ou receiver)
        const podeVer = 
            dados.visibility === true || 
            dados.receiver_id === meuUid || 
            dados.sender_id === meuUid;

        if (podeVer) {
            renderizarMensagem(dados, idMensagem);
            mensagensRenderizadas.add(idMensagem);
            
            // Garante que o scroll desça apenas para novas mensagens
            chat.scrollTop = chat.scrollHeight;
        }
    });
};

// Lógica para filtrar mensagens visualmente sem nova consulta ao banco
const filtrarBuscaTexto = (termo) => {
    const termoBaixo = termo.toLowerCase();
    document.querySelectorAll('.msgBox').forEach(msg => {
        const conteudo = msg.querySelector('.msgBoxText').textContent.toLowerCase();
        msg.style.display = conteudo.includes(termoBaixo) ? "flex" : "none";
    });
};


import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
onAuthStateChanged(auth, (user) => {
    if (user) {
        carregarMensagens();
    }
});


carregarMensagens();


function renderizarMensagem(dados, id) {
    const usuarioAtual = auth.currentUser;
    const msgBox = document.createElement("div");
    msgBox.classList.add("msgBox");
    msgBox.dataset.id = id; 

    const isMine = dados.sender_id === usuarioAtual?.uid;
    
    
    msgBox.classList.add(isMine ? "sent" : "received");
    msgBox.classList.add(isMine ? "myMsg" : "otherMsg"); 

    //ÍCONE E COR PRIVADA ---
    let bubbleIcon = "assets/publicmsg.svg";
    if (dados.visibility === false) {
        bubbleIcon = "assets/privatemsg.svg";
        msgBox.classList.add("private"); 
    }

    const bubble = document.createElement("div");
    bubble.classList.add("msgBoxMessage");
    // Adiciona position relative para que o ícone fique preso no canto da bolha
    bubble.style.position = "relative"; 
    
    //CRIAÇÃO DO ÍCONE SVG ---
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


chat.addEventListener("click", selectMessage);
function selectMessage(event)
{

    const box = event.target.closest(".msgBox");

    if (!box) 
    {
        document.querySelectorAll(".msgBox.selected")
        .forEach(el => el.classList.remove("selected"));
        deleteBtn.style.display = "none";
        return;
    }

    if (box.classList.contains("selected"))
    {
        box.classList.remove("selected");
        deleteBtn.style.display = "none";
    } else {
        document.querySelectorAll(".msgBox.selected")
        .forEach(el => el.classList.remove("selected"));
        box.classList.add("selected");

        const rect = box.getBoundingClientRect();
        deleteBtn.style.display = "block";
        deleteBtn.style.transform = "translateY(-50%)";
        deleteBtn.style.top = rect.top + window.scrollY + rect.height / 2 + "px";

        if (box.classList.contains("sent")) {
            deleteBtn.style.left = rect.left + window.scrollX - 40 + "px";
        } else {
            deleteBtn.style.left = rect.right + window.scrollX + 10 + "px";
        }
    }
}
/*
deleteBtn.addEventListener("click", () => 
{
    document.querySelectorAll(".msgBox.selected")
    .forEach(el => el.remove());

    deleteBtn.style.display = "none";
})



switchBtn.addEventListener("change", () => {
   
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
        localStorage.setItem("tema", "dark");
    } else {
        localStorage.setItem("tema", "light");
    }
});

// Função que checa o tema salvo ao iniciar
window.addEventListener("DOMContentLoaded", () => {
    const temaSalvo = localStorage.getItem("tema");

    
    if (temaSalvo === "dark") {
        document.body.classList.add("dark");
        
       if (switchBtn) switchBtn.checked = true;
    }
});

*/



const userListCont = document.getElementById("userList");
userListCont.addEventListener("click", selectUser);
function selectUser(event)
{
    const user = event.target.closest(".userBox");

    if (!user) {
        document.querySelectorAll(".userBox.selected")
            .forEach(el => el.classList.remove("selected"));
        delUserBtn.classList.remove("selected");
        return;
    }

    const selected = user.classList.contains("selected");

    document.querySelectorAll(".userBox.selected")
        .forEach(el => el.classList.remove("selected"));

    user.classList.toggle("selected", !selected);

    if (!selected) {
        delUserBtn.classList.add("selected");
        const rect = user.getBoundingClientRect();
        delUserBtn.style.position = "absolute";
        delUserBtn.style.top = rect.top + window.scrollY + rect.height / 5 + "px";
        delUserBtn.style.left = rect.right + 15 + "px";
    } else {
        delUserBtn.classList.remove("selected");
    }
}

/*
delUserBtn.addEventListener("click", () => 
{
    const container = document.getElementById("userList");

    document.querySelectorAll(".userBox.selected")
    .forEach(el => el.remove());

    delUserBtn.classList.remove("selected");

    const counter = document.getElementById("counter");
    counter.textContent = container.children.length;
})*/


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
        // 1. Pega o ícone da lista (li)
        const iconInLi = this.parentElement.querySelector('i');
        const mainIcon = document.getElementById('main-icon');
        
        // 2. Atualiza o ícone sem apagar o resto
        if (iconInLi && mainIcon) {
            mainIcon.className = iconInLi.className; // Copia as classes do ícone
            mainIcon.classList.remove('me-2'); // Remove a margem lateral se necessário
        }

        // 3. Atualiza APENAS o texto do span
        const textLabel = this.getAttribute('data-label');
        document.getElementById('selected-value').textContent = textLabel;

        // 4. Fecha o menu
        document.getElementById('options-view-button').checked = false;
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

        // Atualiza o visual do botão principal
        const textLabel = this.nextElementSibling.textContent;
        document.getElementById('selected-value').textContent = textLabel;
        
        // DESAFIO TÉCNICO: Fecha o menu desmarcando o checkbox
        document.getElementById('options-view-button').checked = false;
        
        // Garante o scroll no final
        const chat = document.getElementById("mainChat");
        if(chat) chat.scrollTop = chat.scrollHeight;
    });
});



// Resolve: "Como combinar múltiplos filtros?"
function deveExibir(dados) {
    const usuarioAtual = auth.currentUser;
    if (!usuarioAtual) return false;
    const meuUid = usuarioAtual.uid;

    // Filtra privadas corretamente (sender ou receiver)
    return dados.visibility === true || 
           dados.receiver_id === meuUid || 
           dados.sender_id === meuUid;
}

