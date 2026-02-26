// LUMON CHAT //

# Desafios de Implementação e Soluções Técnicas

Este documento detalha as abordagens arquiteturais e algoritmos utilizados para resolver os desafios propostos no desenvolvimento do Lumon Chat.

---

## Desafio 1: Sistema de Presença Automático

**Abordagem escolhida e justificativa:**
* Sistema escuta a rota `".info/connected"` do Firebase e quando detecta a conexão, cria um pacote de dados (nome, foto, etc.) e marca o status como `online`.

* `onDisconnect()` verifica se houve queda na internet ou se o browser foi fechado e marca status como `offline`, porém não funcionava com o botão de logout. Por isso, foi implementada a função `marcarComoOffline` que muda o status para offline manualmente antes do fechamento do browser, evitando que o usuário fique como "online" permanentemente.

* Para criar a lista de usuários conectados, foi criada a função listener `escutarUsuariosAtivos`, que é executada ao identificar a ação de entrar ou sair através do `onValue`. Quando identificado que o usuário se conectou ele é renderizado na lista, e quando é identificado que ele ficou offline ele é removido.


**Dificuldades encontradas e soluções:**
* *Como marcar offline manualmente através do botão de Sign Out*: este processo foi o mais complicado pois inicialmente pensamos que o onDisconnect() faria isso automaticamente, porém descobrimos que teríamos que inserir uma função manual para definir o status do usuário como Offline antes do mesmo fechar o broswer, caso contrário ele ficaria online como "usuário fantasma".

---

## Desafio 2: Filtragem Inteligente de Mensagens

**Abordagem escolhida e justificativa:**
* Implementamos um sistema de direcionamento de mensagens, onde um usuário seleciona outro da lista de usuários e clica em "Direcionar Mensagem", ao clicar neste botão a função `selecionarDestinatario` guarda o ID e o nome da pessoa na variável `destinatarioAtual`. Após selecionar o usuário, é possível clicar no botão de cadeado que alternará o valor da variável `isPrivate` entre verdadeiro (cadeado fechado) ou falso (cadeado aberto), que definirá se a mensagem será pública ou privada. Para limitar a visibilidade das mensagens privadas, foi criada uma função chamada `deveExibir` que analisa três condições: se a mensagem é pública, se ela é privada e foi enviada PARA mim, se ela é privada e foi enviada POR mim. Nos três casos a visibilidade é verdadeira, caso contrário ela é falsa.

* Foi implementado também um filtro visual para mostrar todas as mensagens, apenas mensagens públicas ou apenas mensagens privadas. Para isso cada bolha de mensagem recebe uma etiqueta que marca seu tipo de visibilidade. Ao selecionar o filtro, o JavaScript percorre as bolhas e compara a etiqueta de visibilidade, mostrando apenas aquelas que coincidem com a condição do filtro.

**Algoritmos/técnicas utilizadas:**
* Paginação inicial utilizando `query(ref, orderByChild('timestamp'), limitToLast(50))`.
* Funções que atuam como listeners.
* Comparação de flags.
* Ativação por eventos.

**Dificuldades encontradas e soluções:**
* A maior dificuldade foi entender a *lógica da comparação das flags e a alternância de visibilidade das mensagens*, bem como aplicar a lógica utilizando a semântica do JavaScript. Com pesquisas no StackOverflow, Reddit e documentação da linguagem conseguimos resolver.

---

## Desafio 4: Acessibilidade WCAG 2.2

**Abordagem escolhida e justificativa:**
* Buscamos garantir que a aplicação seja inclusiva. Focamos na navegação sem mouse e na legibilidade por leitores de tela (Screen Readers), buscando o nível de conformidade AA.
* Implementamos responsividade mobile para que a interface seja adaptada a diferentes resoluções.
* Incluímos um botão que alterna entre modo claro e modo escuro, para visibilidade.

**Algoritmos/técnicas utilizadas:**
* Tags HTML Semânticas (`<header>`, `<aside>`, `<main>`, `<form>`).
* Atributos ARIA: Uso de `aria-live="polite"`, `aria-label` em botões apenas com ícones.
* Sistema de cores via variáveis CSS (`--bg`, `--c1`) que foram testadas para manter uma taxa de contraste acima de 4.5:1, além de um botão nativo para Alto Contraste (Dark Mode).

**Dificuldades encontradas e soluções:**
* A dificuldade foi garantir que a grande maioria da aplicação estava dentro dos padrões da WCAG 2.2, considerando que utilizamos muitos elementos no HTML. Tornar cada elemento acessível foi um pouco trabalhoso, porém conseguimos solucionar identificando os componentes faltantes através do MAUVE++ e incluindo-os.

---

## Desafio 5: Seleção Inteligente de Cores

**Abordagem escolhida e justificativa:**
* Para diferenciar mensagens no chat, geramos cores de identificação. 
* Implementamos seletor de Dark Mode (Alto Contraste).
* Incluímos a persistência do modo selecionado após Log Out e Log in.

**Algoritmos/técnicas utilizadas:**
* *Cálculo de Luminosidade Relativa:* Utilizamos a fórmula para checar o contraste em relação à cor de fundo (claro/escuro) e verificar se estão de acordo.
* Utilização de sistemas medidores de nível de contraste/cor.

**Dificuldades encontradas e soluções:**
* Identificar se as cores escolhidas atendiam aos requisitos de constraste. Em muitos casos entendíamos que as cores atenderiam aos requisitos, porém com a utilização dos sistemas medidores verificamos que algumas cores deveriam ser alteradas.