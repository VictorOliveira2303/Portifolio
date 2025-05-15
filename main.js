let btnMenu = document.getElementById('btn-menu');
let menu = document.getElementById('menu-mobile');
let overlay = document.getElementById('overlay-menu');
let lista = document.getElementById('list');
let fechar = document.getElementById('close');
btnMenu.addEventListener('click',()=>{
    menu.classList.add('abrir-menu')
});
overlay.addEventListener('click',()=>{
    menu.classList.remove('abrir-menu')
});
lista.addEventListener('click',()=>{
    menu.classList.remove('abrir-menu')
});
fechar.addEventListener('click',()=>{
    menu.classList.remove('abrir-menu')
});