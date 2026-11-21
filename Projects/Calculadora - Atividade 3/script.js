let texto = document.getElementById("display");
let Pressed = document.getElementById("Pressed");
let valor;
let posicao;
let numero1;
let numero2;
let resultado;

function pressed(num) {
    console.log(num);
    if (num === "Enter") {
        calculate();
        Pressed.innerText = "Tecla Pressionada: " + num
    }
    else if (num === "Backspace") {
        backspace();
        Pressed.innerText = "Tecla Pressionada: " + num
    }
    else if (num === "Delete") {
        clearAll();
        Pressed.innerText = "Tecla Pressionada: " + num
    }
    else if ("0123456789+-*/.".includes(num)) {
        texto.innerText += num;
        Pressed.innerText = "Tecla Pressionada: " + num
    }
}
function backspace() {
    texto.innerText = texto.innerText.slice(0, -1);
}
function clearAll() {
    texto.innerText = "";
}
function calculate() {
    valor = texto.innerText;

    if (valor === "" || valor.startsWith("+") || valor.startsWith("-") || valor.startsWith("*") || valor.startsWith("/") || valor.endsWith("+") || valor.endsWith("-") || valor.endsWith("*") || valor.endsWith("/")) {
        texto.innerText = "Erro";
        return;
    }

    let numeros = valor.split(/[+\-*/]/);
    let operadores = valor.match(/[+\-*/]/g);

    if (numeros.includes("")) {
        texto.innerText = "Erro";
        return;
    }

    if (operadores === null) {
        texto.innerText = valor;
        return;
    }

    for (let i = 0; i < operadores.length; i++) {

        if (operadores[i] === "*" || operadores[i] === "/") {

            numero1 = parseFloat(numeros[i]);
            numero2 = parseFloat(numeros[i + 1]);

            if (operadores[i] === "/" && numero2 === 0) {
                texto.innerText = "Erro";
                return;
            }

            if (operadores[i] === "*") {
                resultado = numero1 * numero2;
            }
            else {
                resultado = numero1 / numero2;
            }

            numeros.splice(i, 2, resultado.toString());
            operadores.splice(i, 1);
            i--;
        }
    }

    resultado = parseFloat(numeros[0]);

    for (let i = 0; i < operadores.length; i++) {

        numero2 = parseFloat(numeros[i + 1]);

        if (operadores[i] === "+") {
            resultado = resultado + numero2;
        }
        else if (operadores[i] === "-") {
            resultado = resultado - numero2;
        }
    }

    texto.innerText = resultado;
}