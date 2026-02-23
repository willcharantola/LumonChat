import { auth, googleProvider } from './config.js';
import { 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { exibirDadosUsuario } from './ui.js';
import { iniciarSistemaPresenca, marcarComoOffline } from './presence.js';

// Função para iniciar o login
export const loginComGoogle = async () => {
    try {
        // Implementar tela de carregamento aqui
        console.log("Iniciando login...");
        
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        console.log("Usuário logado:", user.displayName);
       
    } catch (error) {
       
        console.error("Erro na autenticação:", error.code, error.message);
        alert("Falha ao entrar: " + error.message);
    }
};

// Função para Logout 
export const fazerLogout = async () => {
    try {
        const user = auth.currentUser;
        
        // se existe um usuário logado, avisa o Firebase que ele está offline
        if (user) {
            await marcarComoOffline(user);
        }

        await signOut(auth);
        localStorage.clear(); // limpa dados locais
        window.location.href = 'login.html';
    } catch (error) {
        console.error("Erro ao sair:", error);
    }
};

// observador de estado
onAuthStateChanged(auth, (user) => {
    const paginaAtual = window.location.pathname;

    if (user) {
        // usuário está autenticado
        console.log("Sessão ativa para:", user.email);

        
        // se estiver na tela de login, manda para o chat
        if (paginaAtual.includes('login.html')) {
            window.location.href = 'chat.html';
        }

        exibirDadosUsuario(user);

        const telaDeChat = document.querySelector(".userBoxContainer");
        if (telaDeChat) {
            iniciarSistemaPresenca(user);
        }

    } else {
        // usuário não está autenticado
        // se tentar acessar o chat sem login, redireciona para login.html
        if (paginaAtual.includes('index.html') || paginaAtual.includes('chat.html') || paginaAtual === '/') {
            window.location.href = 'login.html';
        }
    }
});