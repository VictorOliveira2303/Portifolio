var lampada = document.getElementById("lamp");
var EstadoLamp = false;

function Estado(){
    if (EstadoLamp == false){
        lampada.src="assets/lamp_on.png"
        lampada.alt="Lâmpada acesa"
        document.body.style.background = "radial-gradient(circle, white 8%, yellow 100%)"
        EstadoLamp = true
    }
    else{
        lampada.src="assets/lamp_off.png"
        lampada.alt="Lâmpada apagada"
        document.body.style.background = "radial-gradient(circle, white 8%, black 100%)"
        EstadoLamp = false
    }
}