# Lumon Chat 

Um aplicativo de chat em tempo real construído com JavaScript e Firebase. O projeto foca em performance, acessibilidade e uma interface de usuário fluida e moderna.

## Funcionalidades
* **Autenticação:** Login utilizando a conta do Google via Firebase Auth.
* **Mensagens em Tempo Real:** Sincronização instantânea usando Firebase Realtime Database.
* **Mensagens Privadas e Públicas:** Sistema de direcionamento de mensagens com interface em formato de "tags".
* **Sistema de Presença Automático:** Indicadores visuais de status (Online e Offline) em tempo real.
* **Acessibilidade:** Suporte à navegação por teclado e leitores de tela (ARIA labels).
* **Temas Personalizáveis:** Suporte nativo para Light Mode e Dark Mode.

## Tecnologias Utilizadas
* **Frontend:** HTML5 Semântico, CSS3 (Flexbox, Variáveis CSS) e JavaScript.
* **Backend:** Firebase (Authentication e Realtime Database).
* **Arquitetura:** Em Módulos (`auth.js`, `chat.js`, `messages.js`, `presence.js`, `ui.js`).

## Como Executar o Projeto Localmente
1. Clone este repositório.
2. Abra a pasta do repositório utilizando o VSCode.
3. Instale a extensão "Live Server" no VSCode.
4. Abra o módulo 'index.html'.
5. Clique com o botão direito em qualquer lugar do arquivo e selecione "Abrir com Live Server".
6. Uma janela do seu navegador de preferência abrirá com a tela de login do chat.
7. Clique em "Logar com Google" e realize o login.