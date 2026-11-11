// ============================================================
// MENU (mobile e destaque da seção atual)
// ============================================================
const botaoAbrir = document.getElementById('btn-menu');
const botaoFechar = document.getElementById('close');
const menu = document.getElementById('menu-mobile');
const fundoEscuro = document.getElementById('overlay-menu');
const linksDoMenu = document.getElementById('list');

function definirMenuAberto(aberto) {
    menu.classList.toggle('abrir-menu', aberto);
    document.body.classList.toggle('menu-aberto', aberto);
    botaoAbrir.setAttribute('aria-expanded', String(aberto));
}

const menuEstaAberto = () => menu.classList.contains('abrir-menu');

function abrirMenu() {
    definirMenuAberto(true);
    botaoFechar.focus();
}

const fecharMenu = () => definirMenuAberto(false);

botaoAbrir.addEventListener('click', abrirMenu);

[botaoFechar, fundoEscuro, linksDoMenu].forEach(elemento => {
    elemento.addEventListener('click', fecharMenu);
});

document.addEventListener('keydown', evento => {
    if (evento.key !== 'Escape' || !menuEstaAberto()) return;
    fecharMenu();
    botaoAbrir.focus();
});

// ----- Destaque da seção que está na tela -----
const secoes = document.querySelectorAll('main section[id]');
const linksDeNavegacao = document.querySelectorAll('.menu-desktop a, .menu-mobile a');

function marcarLinkAtivo(idDaSecao) {
    linksDeNavegacao.forEach(link => {
        const ehDaSecao = link.getAttribute('href') === `#${idDaSecao}`;
        if (ehDaSecao) {
            link.setAttribute('aria-current', 'true');
        } else {
            link.removeAttribute('aria-current');
        }
    });
}

// Considera só a faixa do meio da tela
const observadorDeSecoes = new IntersectionObserver(entradas => {
    entradas
        .filter(entrada => entrada.isIntersecting)
        .forEach(entrada => marcarLinkAtivo(entrada.target.id));
}, { rootMargin: '-40% 0px -55% 0px' });

secoes.forEach(secao => observadorDeSecoes.observe(secao));


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
let velocidade = 0.5;
let pausado = false;
let alvoPos = null;
let ultimoTempo = 0;
let temporizadorPausa;

async function carregarProjetos() {
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

            const nome = projeto.name || projeto.id || 'Projeto';

            const descricao = projeto.description?.trim()
                || 'Acesse o projeto para conhecer mais.';

            const linguagens = Array.isArray(projeto.languages)
                ? projeto.languages
                : [];

            // Imagem e link do projeto
            const linkImagem = document.createElement('a');
            linkImagem.href = validarUrl(projeto.projectUrl);
            linkImagem.target = '_blank';
            linkImagem.rel = 'noopener noreferrer';
            linkImagem.setAttribute('aria-label', `Abrir ${nome}`);

            const imagem = document.createElement('img');
            imagem.src = validarUrl(projeto.imageUrl);
            imagem.alt = `Imagem de demonstração do projeto ${nome}`;
            imagem.loading = 'lazy';

            linkImagem.appendChild(imagem);
            card.appendChild(linkImagem);

            // Nome
            const titulo = document.createElement('h3');
            titulo.textContent = nome;
            card.appendChild(titulo);

            // Descrição
            const texto = document.createElement('p');
            texto.textContent = descricao;
            card.appendChild(texto);

            // Linguagens
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

            // Repositório GitHub
            const linkRepositorio = document.createElement('a');
            linkRepositorio.className = 'link-repositorio';
            linkRepositorio.href = validarUrl(projeto.repoUrl);
            linkRepositorio.target = '_blank';
            linkRepositorio.rel = 'noopener noreferrer';
            linkRepositorio.textContent = 'Ver repositório no GitHub';

            card.appendChild(linkRepositorio);

            fragmento.appendChild(card);
        });

        carrossel.replaceChildren(fragmento);

    } catch (erro) {
        console.error('Erro ao carregar projetos:', erro);
    }
}

// Validação de URLs
function validarUrl(url) {
    try {
        const endereco = new URL(url);

        if (endereco.protocol !== 'https:') {
            return '#';
        }

        return endereco.href;
    } catch {
        return '#';
    }
}

// Montagem e centralização
function montarCarrossel() {
    carrossel.querySelectorAll('.clone').forEach(clone => {
        clone.remove();
    });

    cardsOriginais = Array.from(carrossel.children);

    if (cardsOriginais.length === 0) return;

    const estilo = getComputedStyle(carrossel);
    const larguraCard = cardsOriginais[0].getBoundingClientRect().width;
    const espaco = parseFloat(estilo.columnGap) || 0;

    largura = larguraCard + espaco;

    const quantidadeClones = cardsOriginais.length;

    // Clones do final
    cardsOriginais.forEach(card => {
        const clone = card.cloneNode(true);
        clone.classList.add('clone');
        carrossel.appendChild(clone);
    });

    // Clones do início
    cardsOriginais.slice().reverse().forEach(card => {
        const clone = card.cloneNode(true);
        clone.classList.add('clone');
        carrossel.insertBefore(clone, carrossel.firstChild);
    });

    const larguraVisivel = viewportCarrossel.clientWidth;
    const centralizacao = (larguraVisivel - larguraCard) / 2;

    posInicial = quantidadeClones * largura - centralizacao;

    pos = posInicial;
    alvoPos = null;
    ultimoTempo = 0;

    atualizarPosicao();
    atualizarCardAtivo();
}

// Atualiza a posição do carrossel
function atualizarPosicao() {
    carrossel.style.transform = `translateX(-${pos}px)`;
}

// Mantém o movimento infinito
function normalizar() {
    const distanciaTotal = largura * cardsOriginais.length;

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

// Identifica e destaca o card centralizado
function atualizarCardAtivo() {
    const centro = viewportCarrossel.getBoundingClientRect().left
        + viewportCarrossel.clientWidth / 2;

    let cardCentral = null;
    let menorDistancia = Infinity;

    carrossel.querySelectorAll('.card-projeto').forEach(card => {
        const retangulo = card.getBoundingClientRect();
        const centroCard = retangulo.left + retangulo.width / 2;
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

// Animação automática
function animar(tempo) {
    if (!ultimoTempo) ultimoTempo = tempo;

    const intervalo = Math.min(tempo - ultimoTempo, 32);
    ultimoTempo = tempo;

    if (!pausado) {
        if (alvoPos !== null) {
            // Transição suave, com resposta mais rápida
            const diferenca = alvoPos - pos;

            pos += diferenca * 0.16;

            if (Math.abs(diferenca) < 0.5) {
                pos = alvoPos;
                alvoPos = null;
            }
        } else if (
            !window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ) {
            pos += velocidade * (intervalo / 16.67);
        }

        normalizar();
        atualizarPosicao();
        atualizarCardAtivo();
    }

    requestAnimationFrame(animar);
}

// Pausa temporariamente a animação após os botões
function pausarTemporariamente() {
    clearTimeout(temporizadorPausa);

    pausado = false;

    temporizadorPausa = setTimeout(() => {
        pausado = false;
    }, 1500);
}

// Navegação
btnAnterior.addEventListener('click', () => {
    pausarTemporariamente();
    alvoPos = pos - largura;
});

btnProximo.addEventListener('click', () => {
    pausarTemporariamente();
    alvoPos = pos + largura;
});

// Pausa ao interagir
areaCarrossel.addEventListener('mouseenter', () => {
    pausado = true;
});

areaCarrossel.addEventListener('mouseleave', () => {
    pausado = false;
});

areaCarrossel.addEventListener('focusin', () => {
    pausado = true;
});

areaCarrossel.addEventListener('focusout', evento => {
    if (!areaCarrossel.contains(evento.relatedTarget)) {
        pausado = false;
    }
});

areaCarrossel.addEventListener('touchstart', () => {
    pausado = true;
}, { passive: true });

areaCarrossel.addEventListener('touchend', () => {
    pausado = false;
});

// Redimensionamento
window.addEventListener('resize', () => {
    montarCarrossel();
});

// Inicialização
async function iniciarCarrossel() {
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
    idDoModelo: 'template_inyrme9',
};
const emailjsConfigurado = Object.values(EMAILJS).every(valor => valor !== 'COLE_AQUI');

const REGRAS = {
    nome: {
        valido: texto => texto.length >= 2,
        mensagem: 'Informe seu nome (mínimo de 2 letras).',
    },
    email: {
        valido: texto => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(texto),
        mensagem: 'Informe um e-mail válido, como nome@exemplo.com.',
    },
    mensagem: {
        valido: texto => texto.length >= 10,
        mensagem: 'Escreva uma mensagem com pelo menos 10 caracteres.',
    },
};

const camposMensagem = document.querySelectorAll("textarea");
camposMensagem.forEach(campo => {
    campo.addEventListener('input', () => {
        campo.style.height = 'auto';
        campo.style.height = campo.scrollHeight + 'px';
    });
});

const formulario = document.getElementById('form-contato');
const statusDoFormulario = document.getElementById('status-form');
const botaoEnviar = formulario.querySelector('.btn-enviar');
const campos = Object.keys(REGRAS).map(nome => formulario.elements[nome]);

const elementoDeErro = campo => document.getElementById(`erro-${campo.name}`);

function mostrarErro(campo, texto) {
    campo.setAttribute('aria-invalid', 'true');
    elementoDeErro(campo).textContent = texto;
}

function limparErro(campo) {
    campo.removeAttribute('aria-invalid');
    elementoDeErro(campo).textContent = '';
}

function validarCampo(campo) {
    const regra = REGRAS[campo.name];
    const campoValido = regra.valido(campo.value.trim());

    if (campoValido) limparErro(campo);
    else mostrarErro(campo, regra.mensagem);

    return campoValido;
}

function validarFormulario() {
    const invalidos = campos.filter(campo => !validarCampo(campo));
    if (invalidos.length > 0) invalidos[0].focus();
    return invalidos.length === 0;
}

const ehRobo = () => formulario.elements.site.value !== '';

function mostrarStatus(texto, tipo) {
    statusDoFormulario.textContent = texto;
    statusDoFormulario.dataset.tipo = tipo;
}

function lerDados() {
    return {
        nome: formulario.elements.nome.value.trim(),
        email: formulario.elements.email.value.trim(),
        mensagem: formulario.elements.mensagem.value.trim(),
    };
}

async function enviarMensagem(dados) {
    if (!emailjsConfigurado) throw new Error('EmailJS ainda não configurado');
    await emailjs.send(EMAILJS.idDoServico, EMAILJS.idDoModelo, dados, {
        publicKey: EMAILJS.chavePublica,
    });
}

campos.forEach(campo => {
    campo.addEventListener('blur', () => {
        if (campo.value !== '') validarCampo(campo);
    });
    campo.addEventListener('input', () => {
        if (campo.hasAttribute('aria-invalid')) validarCampo(campo);
    });
});

formulario.addEventListener('submit', async evento => {
    evento.preventDefault();
    if (ehRobo() || !validarFormulario()) return;

    botaoEnviar.disabled = true;
    mostrarStatus('Enviando...', 'info');

    try {
        await enviarMensagem(lerDados());
        formulario.reset();
        mostrarStatus('Mensagem enviada! Responderei em breve.', 'sucesso');
    } catch {
        mostrarStatus('Não foi possível enviar agora. Tente de novo ou escreva para victorqpr121021@gmail.com.', 'erro');
    } finally {
        botaoEnviar.disabled = false;
    }
});