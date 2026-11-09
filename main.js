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

// ===== Carrossel de projetos =====
const carrossel = document.getElementById('projetos-lista');
const areaCarrossel = document.querySelector('.carrossel');
const btnAnterior = document.getElementById('proj-anterior');
const btnProximo = document.getElementById('proj-proximo');

const VELOCIDADE = 40; // pixels por segundo (aumente para ir mais rápido)
const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let largura = 0;  // largura de um conjunto completo de cards (com o gap)
let base = 0;     // posição de rolagem do 1º card original
let pos = 0;      // posição atual, com casas decimais
let rodando = false;
let emHover = false;
let emFoco = false;
let emToque = false;
let pausadoAte = 0;
let ultimoQuadro = 0;

// Duplica os cards antes e depois dos originais: é isso que cria o loop sem corte
function clonar(card) {
    const clone = card.cloneNode(true);
    clone.setAttribute('data-clone', '');
    clone.setAttribute('aria-hidden', 'true');
    clone.querySelectorAll('a, button').forEach(el => el.setAttribute('tabindex', '-1'));
    return clone;
}

// Lê os cards que estiverem na página e monta o carrossel.
// Funciona com os cards do HTML e, no futuro, com os que vierem do GitHub.
function montarCarrossel() {
    carrossel.querySelectorAll('[data-clone]').forEach(c => c.remove());
    const originais = Array.from(carrossel.querySelectorAll('.card-projeto'));
    if (originais.length === 0) return;

    const gap = parseFloat(getComputedStyle(carrossel).columnGap) || 0;
    const primeiro = originais[0];
    const ultimo = originais[originais.length - 1];
    largura = ultimo.offsetLeft + ultimo.offsetWidth + gap - primeiro.offsetLeft;

    const copias = Math.ceil(carrossel.clientWidth / largura) + 1;
    const antes = document.createDocumentFragment();
    const depois = document.createDocumentFragment();
    for (let i = 0; i < copias; i++) {
        originais.forEach(card => {
            antes.append(clonar(card));
            depois.append(clonar(card));
        });
    }
    carrossel.prepend(antes);
    carrossel.append(depois);

    // Começa com o 1º card original centralizado
    base = primeiro.offsetLeft - (carrossel.clientWidth - primeiro.offsetWidth) / 2;
    pos = base;
    carrossel.scrollLeft = pos;
    destacarCentro();
}

// Mantém a posição dentro de um conjunto: o "salto" é invisível porque os conjuntos são iguais
function normalizar() {
    if (pos >= base + largura) pos -= largura;
    else if (pos < base) pos += largura;
}

// Anima o card mais próximo do centro
let destacando = false;
function destacarCentro() {
    if (destacando) return;
    destacando = true;
    requestAnimationFrame(() => {
        const cards = Array.from(carrossel.querySelectorAll('.card-projeto'));
        const centro = carrossel.scrollLeft + carrossel.clientWidth / 2;
        let melhor = null;
        let menor = Infinity;
        cards.forEach(card => {
            const distancia = Math.abs(card.offsetLeft + card.offsetWidth / 2 - centro);
            if (distancia < menor) {
                menor = distancia;
                melhor = card;
            }
        });
        cards.forEach(card => card.classList.toggle('ativo', card === melhor));
        destacando = false;
    });
}

// Movimento automático
function animar(agora) {
    const dt = Math.min(agora - ultimoQuadro, 50);
    ultimoQuadro = agora;

    const deveRodar = !reduzirMovimento && !emHover && !emFoco && !emToque && agora > pausadoAte;
    if (deveRodar && !rodando) pos = carrossel.scrollLeft;
    rodando = deveRodar;

    if (rodando) {
        pos += VELOCIDADE * dt / 1000;
        normalizar();
        carrossel.scrollLeft = pos;
    }
    requestAnimationFrame(animar);
}

// Quando o usuário rola manualmente (dedo, roda do mouse, setas), ajusta o loop ao parar
let timerAjuste;
carrossel.addEventListener('scroll', () => {
    destacarCentro();
    if (rodando) return;
    clearTimeout(timerAjuste);
    timerAjuste = setTimeout(() => {
        pos = carrossel.scrollLeft;
        const antes = pos;
        normalizar();
        if (pos !== antes) carrossel.scrollLeft = pos;
    }, 150);
});

// Setas
function passo() {
    const card = carrossel.querySelector('.card-projeto');
    const gap = parseFloat(getComputedStyle(carrossel).columnGap) || 0;
    return card.offsetWidth + gap;
}
function mover(direcao) {
    pausadoAte = performance.now() + 3000;
    carrossel.scrollBy({ left: direcao * passo(), behavior: reduzirMovimento ? 'auto' : 'smooth' });
}
btnProximo.addEventListener('click', () => mover(1));
btnAnterior.addEventListener('click', () => mover(-1));

// Pausas: mouse em cima, foco do teclado e toque
areaCarrossel.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') emHover = true; });
areaCarrossel.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') emHover = false; });
areaCarrossel.addEventListener('focusin', e => { emFoco = e.target.matches(':focus-visible'); });
areaCarrossel.addEventListener('focusout', () => { emFoco = false; });
areaCarrossel.addEventListener('touchstart', () => { emToque = true; }, { passive: true });
function fimDoToque() {
    emToque = false;
    pausadoAte = performance.now() + 2500;
}
areaCarrossel.addEventListener('touchend', fimDoToque);
areaCarrossel.addEventListener('touchcancel', fimDoToque);
areaCarrossel.addEventListener('wheel', () => { pausadoAte = performance.now() + 2500; }, { passive: true });

// Refaz as medidas se a janela mudar de tamanho
let timerResize;
window.addEventListener('resize', () => {
    clearTimeout(timerResize);
    timerResize = setTimeout(montarCarrossel, 200);
});

montarCarrossel();
requestAnimationFrame(animar);

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