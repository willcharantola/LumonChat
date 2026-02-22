import { auth, googleProvider } from './config.js';
import { 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { exibirDadosUsuario } from './ui.js';

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
        await signOut(auth);
        localStorage.clear(); // Limpa dados locais conforme o requisito
        window.location.href = 'login.html';
    } catch (error) {
        console.error("Erro ao sair:", error);
    }
};

// Observador de Estado (Persistência de Sessão e Controle de Acesso)
onAuthStateChanged(auth, (user) => {
    const paginaAtual = window.location.pathname;

    if (user) {
        // Usuário está autenticado
        console.log("Sessão ativa para:", user.email);

        
        // Se estiver na tela de login, manda para o chat
        if (paginaAtual.includes('login.html')) {
            window.location.href = 'chat.html';
        }

        exibirDadosUsuario(user);
    } else {
        // Usuário NÃO autenticado
        // Se tentar acessar o chat sem login, redireciona para login.html
        if (paginaAtual.includes('index.html') || paginaAtual.includes('chat.html') || paginaAtual === '/') {
            window.location.href = 'login.html';
        }
    }
});