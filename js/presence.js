import { database } from './config.js';
import { ref, set, onValue, onDisconnect, serverTimestamp, update } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";
import { selecionarDestinatario } from './messages.js';
import { auth } from './config.js'; 

const userListContainer = document.querySelector(".userBoxContainer");
const userCounter = document.querySelector(".userCount");


 //Função para gerenciar a PRÓPRIA presença
export const iniciarSistemaPresenca = (usuario) => {

    const connectedRef = ref(database, '.info/connected');
    
    const myPresenceRef = ref(database, `presence/${usuario.uid}`);

    // objeto base com os dados estáticos do usuário
    const dadosBase = {
        name: usuario.displayName || "Usuário",
        email: usuario.email || "sem-email",
        image: usuario.photoURL || "assets/user.png",
        color: "#17407a" // Cor padrão provisória
    };

    onValue(connectedRef, (snap) => {
        if (snap.val() === true) {
            
            
            const dadosOffline = {
                ...dadosBase,
                status: 'offline',
                lastChanged: serverTimestamp(),
                lastSeen: serverTimestamp()
            };

            
            const dadosOnline = {
                ...dadosBase,
                status: 'online',
                lastChanged: serverTimestamp(),
                lastSeen: serverTimestamp()
            };

            // registra o evento de desconexão usando .set() com os 7 campos
            onDisconnect(myPresenceRef).set(dadosOffline).then(() => {
                set(myPresenceRef, dadosOnline);
            }).catch((erro) => {
                console.error("Falha na regra de segurança do onDisconnect:", erro);
            });
        }
    });

    // escuta para desenhar a lista na tela
    escutarUsuariosAtivos();
};


 //Função para ouvir todos os usuários e renderizar na tela
const escutarUsuariosAtivos = () => {
    const presenceRef = ref(database, 'presence');

    onValue(presenceRef, (snapshot) => {
        userListContainer.innerHTML = ''; // limpa a lista atual
        let contadorOnline = 0;

        snapshot.forEach((childSnapshot) => {
            const uid = childSnapshot.key;
            const dados = childSnapshot.val();

            // mostrar na lista quem não estiver 'offline'
            if (dados.status !== 'offline') {
                contadorOnline++;
                renderizarUsuarioNaLista(uid, dados);
            }
        });

        // atualiza o contador no HTML
        userCounter.innerHTML = `<span>Usuários conectados: ${contadorOnline}</span>`;
    });
};


 //Função auxiliar para desenhar a caixinha do usuário 
const renderizarUsuarioNaLista = (uid, dados) => {
    const newBox = document.createElement("div");
    newBox.classList.add("userBox");
    newBox.tabIndex = "0";
    newBox.dataset.uid = uid; 
    newBox.dataset.name = dados.name;

    // Foto, Nome e Status
    const photo = document.createElement("div");
    photo.classList.add("userBoxPhoto");
    const img = document.createElement("img");
    img.src = dados.image;
    photo.appendChild(img);

    const name = document.createElement("div");
    name.classList.add("userBoxName");
    name.textContent = dados.name.split(' ')[0]; 

    const status = document.createElement("div");
    status.classList.add("userBoxStatus");
    const dot = document.createElement("div");
    dot.classList.add("statusDot", dados.status);
    status.appendChild(dot);

    // APENAS o botão de Direcionar (sem botão de remover)
    const btnPrivado = document.createElement("button");
    btnPrivado.textContent = "Direcionar mensagem"; 
    btnPrivado.classList.add("btn-privado", "hidden");
    
    // Mostra o botão ao clicar na caixinha do usuário
    newBox.addEventListener("click", () => {
        document.querySelectorAll(".btn-privado").forEach(btn => btn.classList.add("hidden"));
        btnPrivado.classList.remove("hidden");
    });

    // Quando clica em "Direcionar mensagem"
    btnPrivado.addEventListener("click", (e) => {
        e.stopPropagation(); // Impede que o clique feche o botão
        
        // Verifica se o usuário não está tentando mandar mensagem para ele mesmo
        
        if (auth.currentUser && uid === auth.currentUser.uid) {
            alert("Você não pode direcionar uma mensagem para si mesmo!");
            return;
        }

        selecionarDestinatario(uid, dados.name); // Marca o usuário lá no HTML!
    }); 

    // Adiciona os elementos na caixa (note que não há botão de delUserBtn aqui)
    newBox.append(photo, name, status, btnPrivado); 
    userListContainer.appendChild(newBox);
};



//Função para forçar o status offline antes do logout
export const marcarComoOffline = async (usuario) => {
    if (!usuario) return;
    
    const myPresenceRef = ref(database, `presence/${usuario.uid}`);
    
    const dadosOffline = {
        name: usuario.displayName || "Usuário",
        email: usuario.email || "sem-email",
        image: usuario.photoURL || "assets/user.png",
        color: "#17407a",
        status: 'offline',
        lastChanged: serverTimestamp(),
        lastSeen: serverTimestamp()
    };

    await set(myPresenceRef, dadosOffline);
};