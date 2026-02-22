import {fazerLogout} from './auth.js';
import { database, auth } from './config.js';
import { ref, push, set, onValue, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";

const sendButton = document.getElementById("sendButton");
const chat = document.getElementById("mainChat");
const deleteBtn = document.getElementById("delBtn");
const switchBtn = document.getElementById("switchThemeBtn");
const addUserBtn = document.getElementById("addUserButton");
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

        //FIZ ALGUMAS ALTERAÇÕES EM RELAÇÃO AO QUE O PROF PEDIU, MAS ESTÁ FUNCIONANDO,
        //  LEMBRAR DE CONVERSAR COM ELE NA REUNIÃO DE SEGUNDA FEIRA
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

    // Comparação correta usando sender_id conforme o novo padrão
    const isMine = dados.sender_id === usuarioAtual?.uid;
    msgBox.classList.add(isMine ? "sent" : "received");

    const bubble = document.createElement("div");
    bubble.classList.add("msgBoxMessage");
    
    const user = document.createElement("div");
    user.classList.add("msgBoxUser");
    user.textContent = isMine ? "Você" : dados.sender_name;

    const text = document.createElement("div");
    text.classList.add("msgBoxText");
    text.textContent = dados.message_text; // Campo correto: message_text

    const hour = document.createElement("div");
    hour.classList.add("msgBoxHour");
    hour.textContent = dados.timestamp ? dados.timestamp.split(' ')[1].slice(0, 5) : "--:--";

    bubble.append(user, text, hour);
    msgBox.append(bubble);
    chat.appendChild(msgBox);
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



switchBtn.addEventListener("click", () => 
{
    document.body.classList.toggle("dark");
})


addUserBtn.addEventListener("click", addUser);
function addUser(event)
{
    const container = document.getElementById("userList");

    const newBox = document.createElement("div");
    //newBox.classList.add("userBox", "new");
    newBox.classList.add("userBox");

    const photo = document.createElement("div");
    photo.classList.add("userBoxPhoto");
    const img = document.createElement("img");
    img.src = "../assets/user.png";
    photo.appendChild(img);

    const name = document.createElement("div");
    name.classList.add("userBoxName");
    name.textContent = "User";

    const status = document.createElement("div");
    status.classList.add("userBoxStatus");
    const dot = document.createElement("div");
    dot.classList.add("statusDot", "online");
    status.appendChild(dot);

    newBox.append(photo, name, status);
    container.appendChild(newBox);

    /*
    requestAnimationFrame(() => {
        newBox.classList.remove("new");
    });
    */

    const counter = document.getElementById("counter");
    counter.textContent = container.children.length;

}



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




const alertBox = document.getElementById("alertBox");
logoutBtn.addEventListener("click", () => {

    [...document.body.children].forEach(child => {
        if (child.id !== "alertBox") {
            child.classList.add("blur");
        }
    });

    alertBox.style.display = "flex";

});

const cancelLogout = document.getElementById("cancelLogout");
cancelLogout.addEventListener("click", closeModal);
function closeModal() {
    alertBox.style.display = "none";

    [...document.body.children].forEach(child => {
        child.classList.remove("blur");
    });
}

alertBox.addEventListener("click", (e) => {
    if (e.target === alertBox) {
        closeModal();
    }
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




