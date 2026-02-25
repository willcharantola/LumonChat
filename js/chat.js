import {fazerLogout} from './auth.js';
import { database, auth } from './config.js';
import { ref, push, set, onValue } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";

const sendButton = document.getElementById("sendButton");
const chat = document.getElementById("mainChat");
const deleteBtn = document.getElementById("delBtn");
const switchBtn = document.getElementById("switchThemeBtn");

const delUserBtn = document.getElementById("delUserBtn");
const switchStatusBtn = document.getElementById("userDetails");
const logoutBtn = document.getElementById("logoutButton");
const profileBtn = document.getElementById("profileBtn");


sendButton.addEventListener("click", createMessage);
//enviado mensagem 
async function createMessage(event) {

    event.preventDefault();
    const input = document.getElementById("newMsg");
    const msg = input.value.trim();
    const usuario = auth.currentUser;

    if (!msg || !usuario) return;

    try {
        const mensagensRef = ref(database, 'messages');
        const novaMsgRef = push(mensagensRef);

      
    await set(novaMsgRef, {
         message_id: String(novaMsgRef.key), 
         timestamp: String(new Date().toLocaleString('pt-BR')), 
         sender_id: String(usuario.uid),               
         sender_name: String(usuario.displayName),     
         sender_image: String(usuario.photoURL || ""), 
         receiver_id: "",      
         receiver_name: "",    
         visibility: true,                     
         message_text: String(msg),                
         color: "#000000"                      
    });

        input.value = "";
        input.focus();

    } catch (error) {

        console.error("Erro ao salvar no Firebase:", error);
    }
}

//carregando mensagens enviadas para o servidor 

const carregarMensagens = () => {

    const mensagensRef = ref(database, 'messages');
    
    onValue(mensagensRef, (snapshot) => {
       
        chat.innerHTML = '<button id="delBtn">🗑</button>'; 

        snapshot.forEach((childSnapshot) => {
            const dados = childSnapshot.val();
            const idMensagem = childSnapshot.key;
            renderizarMensagem(dados, idMensagem);
        });

        chat.scrollTop = chat.scrollHeight;
    });
};

// Iniciando a função para carregar mensagens
carregarMensagens();


function renderizarMensagem(dados, id) {
    const usuarioAtual = auth.currentUser;
    const msgBox = document.createElement("div");
    msgBox.classList.add("msgBox");
    msgBox.dataset.id = id; 

    const isMine = dados.sender_id === usuarioAtual?.uid;
    msgBox.classList.add(isMine ? "sent" : "received");

    const bubble = document.createElement("div");
    bubble.classList.add("msgBoxMessage");
    
    const user = document.createElement("div");
    user.classList.add("msgBoxUser");
    user.textContent = isMine ? "Você" : dados.sender_name;

    const text = document.createElement("div");
    text.classList.add("msgBoxText");
    text.textContent = dados.message_text; 

   const timeContainer = document.createElement("div");
    timeContainer.classList.add("msgBoxTimeContainer"); // Container para alinhar ambos

    // Extrai a Data
    const datePart = dados.timestamp ? dados.timestamp.split(' ')[0] : "";
    // Formata para o padrão brasileiro
    const dateFormatted = datePart.split('-').reverse().join('/');

    // Extrai a Hora 
    const hourFormatted = dados.timestamp ? dados.timestamp.split(' ')[1].slice(0, 5) : "--:--";

    const dateSpan = document.createElement("span");
    dateSpan.classList.add("msgBoxDate");
    dateSpan.textContent = dateFormatted;

    const hourSpan = document.createElement("span");
    hourSpan.classList.add("msgBoxHour");
    hourSpan.textContent = hourFormatted;

    // Adiciona ambos ao container (ou direto na bubble)
    timeContainer.append(dateSpan, " ", hourSpan);

    bubble.append(user, text, timeContainer);
    msgBox.append(bubble);

    // CORREÇÃO DO ARIA-LABEL: Usando dados.message_text em vez de msg
    msgBox.setAttribute("role", "article");
    msgBox.setAttribute("aria-label", `Nova mensagem de ${user.textContent}: ${dados.message_text}`);

    chat.appendChild(msgBox);
    chat.scrollTop = chat.scrollHeight;

    const audio = document.getElementById("beep");
    audio.play().catch(e => console.log("Autoplay bloqueado pelo browser"));
    

    
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

deleteBtn.addEventListener("click", () => 
{
    document.querySelectorAll(".msgBox.selected")
    .forEach(el => el.remove());

    deleteBtn.style.display = "none";
})



switchBtn.addEventListener("click", () => {
   
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
        
        // Se o seu switchBtn for um checkbox, adicione esta linha:
        // switchBtn.checked = true; 
    }
});





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


delUserBtn.addEventListener("click", () => 
{
    const container = document.getElementById("userList");

    document.querySelectorAll(".userBox.selected")
    .forEach(el => el.remove());

    delUserBtn.classList.remove("selected");

    const counter = document.getElementById("counter");
    counter.textContent = container.children.length;
})


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