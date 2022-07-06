var cargaPagina = document.addEventListener("DOMContentLoaded", function () {
    var borarArt = document.getElementById("eliminaImagen");

    borarArt.addEventListener("click", borraArtCarrito);
    
    function borraArtCarrito()
    {
        var colecCheckbox = document.getElementsByClassName("inputElimina");
        var nombreArt = document.getElementsByClassName("nombreART");
        var obj = new Array();
        for(j=0; j<colecCheckbox.length; j++)
            if(colecCheckbox[j].checked)
                obj.push(nombreArt[j].value);
        peticionAjax(JSON.stringify(obj));
    }
    function peticionAjax(obJSON)
    {
        var petAjax = new XMLHttpRequest();
        petAjax.open("POST", "http://localhost:8080/tarea8/rest/users/borraArtCar");
        petAjax.setRequestHeader("Content-Type", "application/json");
        petAjax.onreadystatechange = function () {
            petAjax.status == 200 && petAjax.readyState == 4 ? resp200(petAjax) : console.log("Procesando");
        };
        petAjax.send(obJSON);
    }
    function resp200(petAjax)
    {
        console.log(petAjax.responseText);
    }
});