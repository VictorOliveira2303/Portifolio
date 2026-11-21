var Info = document.getElementById("taskInput");
var lista = document.getElementById("taskList");

function Add(){
    if(Info.value != ""){

        var valor = document.createElement("li")
        valor.innerHTML = Info.value;
        lista.appendChild(valor);
        Info.value = "";
        valor.id = "value";

        var x = document.createElement("button")
        x.innerHTML = "x";
        valor.appendChild(x);

        x.addEventListener("click",function(){
            valor.remove()
        });
    }
    else{
        alert("Escreva algo!");
    }
}