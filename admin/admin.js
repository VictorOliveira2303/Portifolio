
const API_URL = "https://portfolio-github-api.victor-oliveira23-dev.workers.dev";

const PROJETOS_INICIAIS = [
    "appPrevisao",
    "buscaCep",
    "musica",
    "Forms",
    "toDo",
    "comi",
    "BookSphere",
    "lampada"
];

const estadoLogin = document.getElementById("estado-login");
const areaProjetos = document.getElementById("area-projetos");
const listaRepositorios = document.getElementById("lista-repositorios");
const usuarioLogado = document.getElementById("usuario-logado");
const contador = document.getElementById("contador");
const mensagem = document.getElementById("mensagem");

const btnLogin = document.getElementById("btn-login");
const btnSair = document.getElementById("btn-sair");
const btnSalvar = document.getElementById("btn-salvar");

async function requisicao(endpoint, opcoes = {}) {
    const resposta = await fetch(API_URL + endpoint, {
        ...opcoes,
        credentials: "include",
        headers: {
            ...(opcoes.body ? {
                "Content-Type": "application/json"
            } : {}),
            ...opcoes.headers
        }
    });

    const dados = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
        throw new Error(
            dados.details ||
            dados.error ||
            `Erro HTTP ${resposta.status}`
        );
    }

    return dados;
}

function mostrarMensagem(texto, tipo = "") {
    mensagem.textContent = texto;
    mensagem.dataset.tipo = tipo;
}

function atualizarContador() {
    const selecionados = listaRepositorios.querySelectorAll(
        'input[type="checkbox"]:checked'
    ).length;

    contador.textContent = `${selecionados} selecionados`;
}

async function verificarLogin() {
    try {
        const sessao = await requisicao("/api/session");

        if (!sessao.authenticated) {
            estadoLogin.hidden = false;
            areaProjetos.hidden = true;
            return;
        }

        estadoLogin.hidden = true;
        areaProjetos.hidden = false;

        usuarioLogado.textContent = `Conectado como ${sessao.login}`;

        await carregarRepositorios();

    } catch (erro) {
        estadoLogin.hidden = false;
        areaProjetos.hidden = true;

        mostrarMensagem(
            `Não foi possível verificar o login: ${erro.message}`,
            "erro"
        );
    }
}

async function carregarRepositorios() {
    listaRepositorios.innerHTML = "<p>Carregando repositórios...</p>";
    mostrarMensagem("");

    try {
        const dados = await requisicao("/api/repos");

        if (!dados.repositories || dados.repositories.length === 0) {
            listaRepositorios.innerHTML =
                "<p>Nenhum repositório encontrado.</p>";
            return;
        }

        listaRepositorios.innerHTML = "";

        dados.repositories.forEach(repo => {
            const label = document.createElement("label");
            label.className = "repositorio";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = repo.name;
            checkbox.checked = PROJETOS_INICIAIS.includes(repo.name);

            const conteudo = document.createElement("span");

            const nome = document.createElement("strong");
            nome.textContent = repo.name;

            const descricao = document.createElement("small");
            descricao.textContent =
                repo.description || "Sem descrição cadastrada.";

            conteudo.append(nome, descricao);
            label.append(checkbox, conteudo);

            listaRepositorios.appendChild(label);
        });

        atualizarContador();

    } catch (erro) {
        listaRepositorios.innerHTML =
            "<p>Não foi possível carregar os repositórios.</p>";

        mostrarMensagem(erro.message, "erro");
    }
}

btnLogin.addEventListener("click", () => {
    window.location.href = API_URL + "/auth/login";
});

btnSair.addEventListener("click", async () => {
    btnSair.disabled = true;

    try {
        await requisicao("/auth/logout", {
            method: "POST"
        });

        window.location.reload();

    } catch (erro) {
        mostrarMensagem(erro.message, "erro");
        btnSair.disabled = false;
    }
});

btnSalvar.addEventListener("click", async () => {
    const selecionados = Array.from(
        listaRepositorios.querySelectorAll(
            'input[type="checkbox"]:checked'
        )
    ).map(checkbox => checkbox.value);

    if (selecionados.length === 0) {
        mostrarMensagem(
            "Selecione pelo menos um repositório.",
            "erro"
        );
        return;
    }

    btnSalvar.disabled = true;
    btnSalvar.textContent = "Salvando...";

    mostrarMensagem("Atualizando os projetos...");

    try {
        const resultado = await requisicao("/api/projects", {
            method: "POST",
            body: JSON.stringify({
                repositories: selecionados
            })
        });

        mostrarMensagem(
            `${resultado.count} projetos atualizados com sucesso!`,
            "sucesso"
        );

    } catch (erro) {
        mostrarMensagem(erro.message, "erro");

    } finally {
        btnSalvar.disabled = false;
        btnSalvar.textContent = "Salvar projetos selecionados";
    }
});

listaRepositorios.addEventListener("change", atualizarContador);

verificarLogin();