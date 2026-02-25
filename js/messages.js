import { database, auth } from './config.js';
import { ref, push, set, onValue, query, limitToLast } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";

const chatContainer = document.getElementById("mainChat");
const directedIndicator = document.getElementById("directedIndicator");
const directedUserName = document.getElementById("directedUserName");
const cancelDirectedBtn = document.getElementById("cancelDirectedBtn");
const inputMsg = document.getElementById("newMsg");
const togglePrivateBtn = document.getElementById("togglePrivateBtn");
const btnLockIcon = document.getElementById("btnLockIcon");

let destinatarioAtual = null; 
let isPrivateMode = false;    

export const selecionarDestinatario = (uid, nome) => {
    if (!auth.currentUser || uid === auth.currentUser.uid) return; 

    destinatarioAtual = { uid, nome };
    directedUserName.textContent = nome;
    directedIndicator.classList.remove("hidden");
    inputMsg.focus(); 
};

if (cancelDirectedBtn) {
    cancelDirectedBtn.addEventListener("click", () => {
        destinatarioAtual = null;
        isPrivateMode = false;
        directedIndicator.classList.add("hidden");
        
        togglePrivateBtn.classList.remove("active");
        btnLockIcon.src = "assets/openlock.svg"; 
    });
}

if (togglePrivateBtn) {
    togglePrivateBtn.addEventListener("click", () => {
        if (!destinatarioAtual && !isPrivateMode) {
            alert("Selecione um usuário para direcionar a mensagem privada!");
            return;
        }

        isPrivateMode = !isPrivateMode;
        
        if (isPrivateMode) {
            togglePrivateBtn.classList.add("active");
            btnLockIcon.src = "assets/closedlock.svg"; 
        } else {
            togglePrivateBtn.classList.remove("active");
            btnLockIcon.src = "assets/openlock.svg"; 
        }
    });
}


export const enviarMensagem = async (texto) => {
    const usuario = auth.currentUser;
    if (!usuario || !texto.trim() || texto.length > 500) return;

    if (isPrivateMode && !destinatarioAtual) {
        alert("Selecione um usuário para direcionar a mensagem privada!");
        return;
    }

    const mensagensRef = ref(database, 'messages');
    const novaMsgRef = push(mensagensRef);

    const dataAtual = new Date();
    const timestamp = dataAtual.toLocaleString('pt-BR');

    const msgData = {
        message_id: novaMsgRef.key,
        timestamp: timestamp,
        sender_id: usuario.uid,
        sender_name: usuario.displayName || "Usuário",
        sender_image: usuario.photoURL || "assets/user.png",
        receiver_id: destinatarioAtual ? destinatarioAtual.uid : null,
        receiver_name: destinatarioAtual ? destinatarioAtual.nome : null,
        visibility: !isPrivateMode, 
        message_text: texto.trim(),
        color: "#17407a" 
    };

    try {
        await set(novaMsgRef, msgData);
        inputMsg.value = ""; 
    } catch (error) {
        console.error("Erro ao enviar:", error);
    }
};



