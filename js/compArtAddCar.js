function agregarCarroAjax(botonSelec)
{
    var ajax = new XMLHttpRequest();
    //Obtenemos la cantidad solicitada
    var obJSON = 
    {
        nombreElemtSolictado : botonSelec.srcElement.parentNode.childNodes[2].childNodes[1].innerText.split(": ")[1],
        precioElemtSolictado : botonSelec.srcElement.parentNode.childNodes[3].childNodes[1].value
    };
    ajax.open("POST", "http://localhost:8080/tarea8/rest/users/addCar");
    ajax.setRequestHeader("Content-Type", "application/json");
    ajax.onreadystatechange = function ()
    {
        ajax.status == 200 && ajax.readyState == 4 ? conexAjax200(obJSON, botonSelec) : console.log("PETICIÓN EN PROCESO");
        ajax.status == 400 && ajax.readyState == 4 ? conexAjax400(ajax) : console.log("PROCESANDO");
    };
    ajax.send(JSON.stringify(obJSON));
}
function conexAjax200(obJSON, botonSelec)
{
    var newCant = botonSelec.srcElement.parentNode.childNodes[2].childNodes[4].innerText.split(": ")[1];
    newCant = parseInt(newCant)-obJSON.precioElemtSolictado;
    botonSelec.srcElement.parentNode.childNodes[2].childNodes[4].innerText = "Existencias : "+newCant;
    alert("AGREGADO A CARRITO CON EXITO");
}
function conexAjax400(ajax)
{
    var resJSON = JSON.parse(ajax.responseText);
    if(resJSON.detalle != "ERROR INTERNO")
        alert("NO HAY ARTICULOS SUFICIENTES EN ALMACEN PARA PROCESAR PETICION \n PRUEBE OTRA CANTIDAD VALIDA");
    console.log(resJSON.detalle);
}