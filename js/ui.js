
export const exibirDadosUsuario = (user) => {

    const nome = document.getElementById('userName');
    const email = document.getElementById('user-email');
    const foto = document.getElementById('imgUser');

    if (nome) nome.innerText = user.displayName.toLowerCase();
    if (email) email.innerText = user.email;
    if (foto) foto.src = user.photoURL;
};
