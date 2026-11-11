// ============================================================
// TEMA CLARO E ESCURO
// ============================================================

const botaoTema = document.getElementById('btn-tema');
const elementoTema = document.documentElement;
const metaThemeColor = document.querySelector('meta[name="theme-color"]');

const CHAVE_TEMA = 'portfolio-tema';

function obterTemaSalvo() {
    try {
        return localStorage.getItem(CHAVE_TEMA) === 'claro'
            ? 'claro'
            : 'escuro';
    } catch (erro) {
        console.warn('Não foi possível recuperar o tema salvo:', erro);
        return 'escuro';
    }
}

function atualizarTema(tema) {
    const temaValido = tema === 'claro' ? 'claro' : 'escuro';

    elementoTema.dataset.theme = temaValido;

    if (botaoTema) {
        const icone = botaoTema.querySelector('span');

        const proximoTema = temaValido === 'escuro'
            ? 'claro'
            : 'escuro';

        const rotulo = proximoTema === 'claro'
            ? 'Ativar tema claro'
            : 'Ativar tema escuro';

        botaoTema.setAttribute('aria-label', rotulo);
        botaoTema.setAttribute('title', rotulo);

        if (icone) {
            icone.textContent = temaValido === 'escuro' ? '☀' : '☾';
        }
    }

    if (metaThemeColor) {
        metaThemeColor.setAttribute(
            'content',
            temaValido === 'claro' ? '#f4f6fa' : '#121212'
        );
    }
}

// Aplica o tema salvo.
atualizarTema(obterTemaSalvo());

// Alterna o tema e salva a preferência.
if (botaoTema) {
    botaoTema.addEventListener('click', () => {
        const novoTema = elementoTema.dataset.theme === 'escuro'
            ? 'claro'
            : 'escuro';

        atualizarTema(novoTema);

        try {
            localStorage.setItem(CHAVE_TEMA, novoTema);
        } catch (erro) {
            console.warn('Não foi possível salvar o tema:', erro);
        }
    });
}
// ============================================================
// MENU MOBILE (acessibilidade e gerenciamento de foco)
// ============================================================

const botaoAbrir = document.getElementById('btn-menu');
const botaoFechar = document.getElementById('close');
const menu = document.getElementById('menu-mobile');
const fundoEscuro = document.getElementById('overlay-menu');
const linksDoMenu = document.getElementById('list');

const elementosDeFundo = [
    document.querySelector('main'),
    document.querySelector('footer'),
    document.querySelector('header .logo'),
    document.querySelector('header .menu-desktop'),
    botaoAbrir,
    botaoTema
].filter(Boolean);

let estadoOriginalFundo = [];

function salvarEstadoFundo() {
    estadoOriginalFundo = elementosDeFundo.map(elemento => ({
        elemento,
        inert: elemento.inert,
        ariaHidden: elemento.getAttribute('aria-hidden')
    }));
}

function bloquearFundo() {
    salvarEstadoFundo();

    elementosDeFundo.forEach(elemento => {
        elemento.inert = true;
        elemento.setAttribute('aria-hidden', 'true');
    });
}

function liberarFundo() {
    estadoOriginalFundo.forEach(({ elemento, inert, ariaHidden }) => {
        elemento.inert = inert;

        if (ariaHidden === null) {
            elemento.removeAttribute('aria-hidden');
        } else {
            elemento.setAttribute('aria-hidden', ariaHidden);
        }
    });

    estadoOriginalFundo = [];
}

function obterElementosFocaveis() {
    return Array.from(
        menu.querySelectorAll(
            'a[href], button:not([disabled]), input:not([disabled]), ' +
            'select:not([disabled]), textarea:not([disabled]), ' +
            '[tabindex]:not([tabindex="-1"])'
        )
    ).filter(elemento => {
        return (
            !elemento.hidden &&
            !elemento.closest('[inert]') &&
            elemento.getAttribute('aria-hidden') !== 'true'
        );
    });
}

function menuEstaAberto() {
    return menu?.classList.contains('abrir-menu') ?? false;
}

function definirMenuAberto(aberto) {
    if (!menu || !botaoAbrir || !botaoFechar) return;

    if (aberto === menuEstaAberto()) return;

    if (aberto) {
        bloquearFundo();

        menu.inert = false;
        menu.setAttribute('aria-hidden', 'false');
        menu.setAttribute('aria-modal', 'true');

        menu.classList.add('abrir-menu');
        document.body.classList.add('menu-aberto');

        botaoAbrir.setAttribute('aria-expanded', 'true');

        botaoFechar.focus();

    } else {
        // Retira o foco do menu antes de ocultá-lo.
        botaoAbrir.focus();

        menu.classList.remove('abrir-menu');
        document.body.classList.remove('menu-aberto');

        botaoAbrir.setAttribute('aria-expanded', 'false');

        liberarFundo();

        menu.setAttribute('aria-modal', 'false');
        menu.setAttribute('aria-hidden', 'true');
        menu.inert = true;
    }
}

if (botaoAbrir && botaoFechar && menu && fundoEscuro && linksDoMenu) {

    // Estado inicial
    menu.inert = true;
    menu.setAttribute('aria-hidden', 'true');
    menu.setAttribute('aria-modal', 'false');

    botaoAbrir.setAttribute('aria-expanded', 'false');

    botaoAbrir.addEventListener('click', () => {
        definirMenuAberto(true);
    });

    botaoFechar.addEventListener('click', () => {
        definirMenuAberto(false);
    });

    fundoEscuro.addEventListener('click', () => {
        definirMenuAberto(false);
    });

    linksDoMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            definirMenuAberto(false);
        });
    });

    document.addEventListener('keydown', evento => {
        if (!menuEstaAberto()) return;

        // Fechar com Escape
        if (evento.key === 'Escape') {
            evento.preventDefault();
            definirMenuAberto(false);
            return;
        }

        // Gerenciamento de foco
        if (evento.key === 'Tab') {
            const elementos = obterElementosFocaveis();

            if (elementos.length === 0) {
                evento.preventDefault();
                botaoFechar.focus();
                return;
            }

            const primeiro = elementos[0];
            const ultimo = elementos[elementos.length - 1];

            // Recupera o foco se ele escapar do menu
            if (!menu.contains(document.activeElement)) {
                evento.preventDefault();

                if (evento.shiftKey) {
                    ultimo.focus();
                } else {
                    primeiro.focus();
                }

                return;
            }

            // Navegação reversa
            if (
                evento.shiftKey &&
                document.activeElement === primeiro
            ) {
                evento.preventDefault();
                ultimo.focus();
            }

            // Navegação normal
            else if (
                !evento.shiftKey &&
                document.activeElement === ultimo
            ) {
                evento.preventDefault();
                primeiro.focus();
            }
        }
    });
}


// ============================================================
// CARROSSEL DE PROJETOS DINÂMICO
// ============================================================

const carrossel = document.getElementById('projetos-lista');
const areaCarrossel = document.querySelector('.carrossel');
const viewportCarrossel = document.querySelector('.projetos-viewport');

const btnAnterior = document.getElementById('proj-anterior');
const btnProximo = document.getElementById('proj-proximo');

let cardsOriginais = [];
let largura = 0;
let pos = 0;
let posInicial = 0;

const velocidade = 0.5;

let pausado = false;
let alvoPos = null;
let ultimoTempo = 0;

const movimentoReduzido = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
);

// Validação de URLs
function validarUrl(url) {
    try {
        if (typeof url !== 'string' || !url.trim()) {
            return null;
        }

        const endereco = new URL(url);

        if (endereco.protocol !== 'https:') {
            return null;
        }

        return endereco.href;

    } catch {
        return null;
    }
}


// ============================================================
// CARREGAMENTO DOS PROJETOS
// ============================================================

async function carregarProjetos() {
    if (!carrossel) return;

    try {
        const resposta = await fetch('./projects.json', {
            cache: 'no-store'
        });

        if (!resposta.ok) {
            throw new Error('Não foi possível carregar projects.json.');
        }

        const projetos = await resposta.json();

        if (!Array.isArray(projetos) || projetos.length === 0) {
            throw new Error('A lista de projetos está vazia.');
        }

        const fragmento = document.createDocumentFragment();

        projetos.forEach(projeto => {
            const card = document.createElement('article');
            card.className = 'card-projeto';

            const nome = typeof projeto.name === 'string'
                ? projeto.name
                : projeto.id || 'Projeto';

            const descricao = typeof projeto.description === 'string'
                ? projeto.description.trim()
                : '';

            const linguagens = Array.isArray(projeto.languages)
                ? projeto.languages.filter(
                    linguagem => typeof linguagem === 'string'
                )
                : [];

            const urlImagem = validarUrl(projeto.imageUrl);
            const urlProjeto = validarUrl(projeto.projectUrl);

            // Imagem
            if (urlImagem) {
                const imagem = document.createElement('img');

                imagem.src = urlImagem;
                imagem.alt = `Imagem de demonstração do projeto ${nome}`;
                imagem.loading = 'lazy';
                imagem.decoding = 'async';

                if (urlProjeto) {
                    const linkImagem = document.createElement('a');

                    linkImagem.href = urlProjeto;
                    linkImagem.target = '_blank';
                    linkImagem.rel = 'noopener noreferrer';

                    linkImagem.setAttribute(
                        'aria-label',
                        `Abrir projeto ${nome}`
                    );

                    linkImagem.appendChild(imagem);
                    card.appendChild(linkImagem);

                } else {
                    card.appendChild(imagem);
                }
            }

            // Título
            const titulo = document.createElement('h3');
            titulo.textContent = nome;

            card.appendChild(titulo);

            // Descrição
            const texto = document.createElement('p');

            texto.textContent = descricao ||
                'Acesse o projeto para conhecer mais.';

            card.appendChild(texto);

            // Tecnologias
            if (linguagens.length > 0) {
                const lista = document.createElement('ul');

                lista.className = 'tecnologias';

                linguagens.forEach(linguagem => {
                    const item = document.createElement('li');

                    item.textContent = linguagem;
                    lista.appendChild(item);
                });

                card.appendChild(lista);
            }

            // Repositório
            const urlRepositorio = validarUrl(projeto.repoUrl);

            if (urlRepositorio) {
                const linkRepositorio = document.createElement('a');

                linkRepositorio.className = 'link-repositorio';
                linkRepositorio.href = urlRepositorio;
                linkRepositorio.target = '_blank';
                linkRepositorio.rel = 'noopener noreferrer';

                linkRepositorio.textContent = 'Ver repositório no GitHub';

                card.appendChild(linkRepositorio);
            }

            fragmento.appendChild(card);
        });

        carrossel.replaceChildren(fragmento);

    } catch (erro) {
        console.error('Erro ao carregar projetos:', erro);

        const mensagem = document.createElement('p');

        mensagem.textContent =
            'Não foi possível carregar os projetos no momento.';

        mensagem.setAttribute('role', 'alert');

        carrossel.replaceChildren(mensagem);
    }
}


// ============================================================
// MONTAGEM E CENTRALIZAÇÃO DO CARROSSEL
// ============================================================

function montarCarrossel() {
    if (!carrossel || !viewportCarrossel) return;

    carrossel.querySelectorAll('.clone').forEach(clone => {
        clone.remove();
    });

    cardsOriginais = Array.from(
        carrossel.children
    );

    if (cardsOriginais.length === 0) return;

    const estilo = getComputedStyle(carrossel);

    const larguraCard =
        cardsOriginais[0].getBoundingClientRect().width;

    if (larguraCard <= 0) return;

    const espaco = parseFloat(estilo.columnGap) || 0;

    largura = larguraCard + espaco;

    const quantidadeClones = cardsOriginais.length;

    // Clones do final
    cardsOriginais.forEach(card => {
        const clone = card.cloneNode(true);

        clone.classList.add('clone');
        clone.setAttribute('aria-hidden', 'true');
        clone.inert = true;

        carrossel.appendChild(clone);
    });

    // Clones do início
    cardsOriginais.slice().reverse().forEach(card => {
        const clone = card.cloneNode(true);

        clone.classList.add('clone');
        clone.setAttribute('aria-hidden', 'true');
        clone.inert = true;

        carrossel.insertBefore(clone, carrossel.firstChild);
    });

    const larguraVisivel = viewportCarrossel.clientWidth;

    const centralizacao =
        (larguraVisivel - larguraCard) / 2;

    posInicial =
        quantidadeClones * largura - centralizacao;

    pos = posInicial;
    alvoPos = null;
    ultimoTempo = 0;

    atualizarPosicao();
    atualizarCardAtivo();
}


// ============================================================
// ATUALIZAÇÃO DA POSIÇÃO
// ============================================================

function atualizarPosicao() {
    if (!carrossel) return;

    carrossel.style.transform = `translateX(-${pos}px)`;
}


// ============================================================
// MOVIMENTO INFINITO
// ============================================================

function normalizar() {
    if (cardsOriginais.length === 0 || largura <= 0) {
        return;
    }

    const distanciaTotal =
        largura * cardsOriginais.length;

    const limiteInicial = posInicial;
    const limiteFinal = posInicial + distanciaTotal;

    if (pos >= limiteFinal) {
        pos -= distanciaTotal;

        if (alvoPos !== null) {
            alvoPos -= distanciaTotal;
        }
    }

    if (pos < limiteInicial) {
        pos += distanciaTotal;

        if (alvoPos !== null) {
            alvoPos += distanciaTotal;
        }
    }
}


// ============================================================
// IDENTIFICAÇÃO DO CARD CENTRAL
// ============================================================

function atualizarCardAtivo() {
    if (!viewportCarrossel || !carrossel) return;

    const centro =
        viewportCarrossel.getBoundingClientRect().left +
        viewportCarrossel.clientWidth / 2;

    let cardCentral = null;
    let menorDistancia = Infinity;

    carrossel.querySelectorAll('.card-projeto').forEach(card => {
        const retangulo = card.getBoundingClientRect();

        const centroCard =
            retangulo.left + retangulo.width / 2;

        const distancia = Math.abs(centro - centroCard);

        if (distancia < menorDistancia) {
            menorDistancia = distancia;
            cardCentral = card;
        }
    });

    carrossel.querySelectorAll('.card-projeto').forEach(card => {
        card.classList.toggle('ativo', card === cardCentral);
    });
}


// ============================================================
// ANIMAÇÃO AUTOMÁTICA
// ============================================================

function animar(tempo) {
    if (!ultimoTempo) {
        ultimoTempo = tempo;
    }

    const intervalo = Math.min(
        tempo - ultimoTempo,
        32
    );

    ultimoTempo = tempo;

    if (alvoPos !== null) {

        if (movimentoReduzido.matches) {
            pos = alvoPos;
            alvoPos = null;

        } else {
            const diferenca = alvoPos - pos;

            pos += diferenca * 0.16;

            if (Math.abs(diferenca) < 0.5) {
                pos = alvoPos;
                alvoPos = null;
            }
        }

        normalizar();

        atualizarPosicao();
        atualizarCardAtivo();

    } else if (!pausado && !movimentoReduzido.matches) {

        pos += velocidade * (intervalo / 16.67);

        normalizar();

        atualizarPosicao();
        atualizarCardAtivo();
    }

    requestAnimationFrame(animar);
}


// ============================================================
// NAVEGAÇÃO DO CARROSSEL
// ============================================================

if (btnAnterior && btnProximo && areaCarrossel) {

    btnAnterior.addEventListener('click', () => {
        if (largura <= 0) return;

        alvoPos = (alvoPos ?? pos) - largura;
    });

    btnProximo.addEventListener('click', () => {
        if (largura <= 0) return;

        alvoPos = (alvoPos ?? pos) + largura;
    });

    // Pausa ao passar o mouse
    areaCarrossel.addEventListener('mouseenter', () => {
        pausado = true;
    });

    areaCarrossel.addEventListener('mouseleave', () => {
        pausado = false;
    });

    // Pausa durante navegação por teclado
    areaCarrossel.addEventListener('focusin', () => {
        pausado = true;
    });

    areaCarrossel.addEventListener('focusout', evento => {
        if (!areaCarrossel.contains(evento.relatedTarget)) {
            pausado = false;
        }
    });

    // Pausa durante toque
    areaCarrossel.addEventListener('touchstart', () => {
        pausado = true;
    }, { passive: true });

    areaCarrossel.addEventListener('touchend', () => {
        pausado = false;
    });

    areaCarrossel.addEventListener('touchcancel', () => {
        pausado = false;
    });
}


// ============================================================
// REDIMENSIONAMENTO
// ============================================================

let temporizadorResize = null;

window.addEventListener('resize', () => {
    clearTimeout(temporizadorResize);

    temporizadorResize = setTimeout(() => {
        montarCarrossel();
    }, 150);
});


// ============================================================
// INICIALIZAÇÃO DO CARROSSEL
// ============================================================

async function iniciarCarrossel() {
    if (!carrossel || !areaCarrossel || !viewportCarrossel) {
        return;
    }

    await carregarProjetos();

    montarCarrossel();

    requestAnimationFrame(animar);
}

iniciarCarrossel();


// ============================================================
// FORMULÁRIO DE CONTATO
// ============================================================

const EMAILJS = {
    chavePublica: 'ryOeWTB6VHZhkZfsB',
    idDoServico: 'service_l5u1row',
    idDoModelo: 'template_inyrme9'
};

const emailjsConfigurado = Object.values(EMAILJS).every(valor => {
    return (
        typeof valor === 'string' &&
        valor.trim() !== '' &&
        valor !== 'COLE_AQUI'
    );
});


// ============================================================
// REGRAS DE VALIDAÇÃO
// ============================================================

const REGRAS = {
    nome: {
        valido: texto =>
            texto.length >= 2 && texto.length <= 100,

        mensagem:
            'Informe seu nome (de 2 a 100 caracteres).'
    },

    email: {
        valido: texto => {
            return texto.length <= 254 &&
                /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(texto);
        },

        mensagem:
            'Informe um e-mail válido, com até 254 caracteres.'
    },

    mensagem: {
        valido: texto =>
            texto.length >= 10 && texto.length <= 3000,

        mensagem:
            'Escreva uma mensagem de 10 a 3000 caracteres.'
    }
};


// ============================================================
// ELEMENTOS DO FORMULÁRIO
// ============================================================

const formulario = document.getElementById('form-contato');

if (formulario) {

    const statusDoFormulario =
        document.getElementById('status-form');

    const botaoEnviar =
        formulario.querySelector('.btn-enviar');

    const campos = Object.keys(REGRAS)
        .map(nome => formulario.elements.namedItem(nome))
        .filter(Boolean);

    const elementoDeErro = campo => {
        return document.getElementById(`erro-${campo.name}`);
    };


    // ========================================================
    // MENSAGENS DE ERRO
    // ========================================================

    function mostrarErro(campo, texto) {
        campo.setAttribute('aria-invalid', 'true');

        const erro = elementoDeErro(campo);

        if (erro) {
            erro.textContent = texto;
            erro.setAttribute('aria-live', 'polite');
            erro.setAttribute('aria-atomic', 'true');
        }
    }

    function limparErro(campo) {
        campo.removeAttribute('aria-invalid');

        const erro = elementoDeErro(campo);

        if (erro) {
            erro.textContent = '';
            erro.removeAttribute('role');
            erro.removeAttribute('aria-live');
            erro.removeAttribute('aria-atomic');
        }
    }


    // ========================================================
    // VALIDAÇÃO INDIVIDUAL
    // ========================================================

    function validarCampo(campo) {
        const regra = REGRAS[campo.name];

        if (!regra) return true;

        const valor = campo.value.trim();

        const campoValido = regra.valido(valor);

        if (campoValido) {
            limparErro(campo);
        } else {
            mostrarErro(campo, regra.mensagem);
        }

        return campoValido;
    }


    // ========================================================
    // VALIDAÇÃO GERAL
    // ========================================================

    function validarFormulario() {
        const invalidos = campos.filter(campo => {
            return !validarCampo(campo);
        });

        if (invalidos.length > 0) {
            invalidos[0].focus();
            return false;
        }

        return true;
    }


    // ========================================================
    // PROTEÇÃO CONTRA ROBÔS (HONEYPOT)
    // ========================================================

    function ehRobo() {
        const campoOculto =
            formulario.elements.namedItem('site');

        return Boolean(
            campoOculto &&
            typeof campoOculto.value === 'string' &&
            campoOculto.value.trim() !== ''
        );
    }


    // ========================================================
    // STATUS DO FORMULÁRIO
    // ========================================================

    function mostrarStatus(texto, tipo) {
        if (!statusDoFormulario) return;

        statusDoFormulario.textContent = texto;
        statusDoFormulario.dataset.tipo = tipo;
    }


    // ========================================================
    // LEITURA DOS DADOS
    // ========================================================

    function lerDados() {
        return {
            nome: formulario.elements.namedItem('nome').value.trim(),
            email: formulario.elements.namedItem('email').value.trim(),
            mensagem: formulario.elements.namedItem('mensagem').value.trim()
        };
    }


    // ========================================================
    // ENVIO PELO EMAILJS
    // ========================================================

    async function enviarMensagem(dados) {
        if (!emailjsConfigurado) {
            throw new Error('EmailJS ainda não configurado.');
        }

        if (typeof emailjs === 'undefined') {
            throw new Error('Biblioteca EmailJS não carregada.');
        }

        await emailjs.send(
            EMAILJS.idDoServico,
            EMAILJS.idDoModelo,
            dados,
            {
                publicKey: EMAILJS.chavePublica
            }
        );
    }


    // ========================================================
    // AJUSTE AUTOMÁTICO DA ALTURA DO TEXTAREA
    // ========================================================

    formulario.querySelectorAll('textarea').forEach(campo => {

        campo.addEventListener('input', () => {
            campo.style.height = 'auto';
            campo.style.height = `${campo.scrollHeight}px`;
        });

    });


    // ========================================================
    // EVENTOS DE VALIDAÇÃO
    // ========================================================

    campos.forEach(campo => {

        campo.addEventListener('blur', () => {
            if (campo.value !== '') {
                validarCampo(campo);
            }
        });

        campo.addEventListener('input', () => {
            if (campo.hasAttribute('aria-invalid')) {
                validarCampo(campo);
            }
        });

    });


    // ========================================================
    // ENVIO DO FORMULÁRIO
    // ========================================================

    formulario.addEventListener('submit', async evento => {

        evento.preventDefault();

        if (ehRobo()) return;

        if (!validarFormulario()) {
            mostrarStatus(
                'Verifique os campos destacados antes de enviar.',
                'erro'
            );

            return;
        }

        if (!botaoEnviar) return;

        botaoEnviar.disabled = true;

        formulario.setAttribute('aria-busy', 'true');

        mostrarStatus('Enviando mensagem...', 'info');

        try {

            await enviarMensagem(lerDados());

            formulario.reset();

            // Reinicia altura do textarea
            formulario.querySelectorAll('textarea').forEach(campo => {
                campo.style.height = 'auto';
            });

            // Limpa os erros
            campos.forEach(campo => {
                limparErro(campo);
            });

            mostrarStatus(
                'Mensagem enviada! Responderei em breve.',
                'sucesso'
            );

        } catch (erro) {

            console.error('Erro ao enviar formulário:', erro);

            mostrarStatus(
                'Não foi possível enviar agora. Tente novamente ou escreva para victor.oliveira23.dev@gmail.com.',
                'erro'
            );

        } finally {

            botaoEnviar.disabled = false;

            formulario.removeAttribute('aria-busy');
        }

    });

}