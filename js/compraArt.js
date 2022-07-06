var cargaPagina = document.addEventListener("DOMContentLoaded", function () {
    var botonSearch = document.forms[0].elements["buscar"];
    var barraSearch = document.forms[0].elements["busqueda"];
    var img;
    var srcIMG;

    botonSearch.addEventListener("click", capturaBusqueda);

    function capturaBusqueda()
    {
        event.preventDefault();
        var descripcion = barraSearch.value;
        var listArticle = document.getElementsByTagName("section")[0];
        var tamListArticle = parseInt(listArticle.childNodes.length)-1;
        if(descripcion.length == 0)
        {
            alert("Debes escribir al menos un caracter para realizar la busqueda por coincidencias");
            return;
        }
        if(listArticle.childNodes.length != 0)
            for(k=tamListArticle; k>=0; k--)
                listArticle.childNodes[k].remove();
        enviarDatos(JSON.stringify(descripcion));
    }
    function enviarDatos(objJSON)
    {
        var xhr = new XMLHttpRequest();
        xhr.open("POST","http://localhost:8080/tarea8/rest/users/consulta");
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = function ()
        {   xhr.status == 200 && xhr.readyState == 4 ? listArt(xhr) : console.log("EN PROCESO");  };
        xhr.send(objJSON);
    }
    function listArt (xhr)
    {
        var respJSON = JSON.parse(xhr.responseText);
        var resFail = document.getElementById("msmRes");
        if(respJSON.detalle != "NO EXISTEN COINCIDENCIAS")
        {
            resFail.style.display = "none";
            for(j=0; j<respJSON.length; j++)
            {
                procesaImg(respJSON[j].byteFoto);
                createElements(respJSON[j]);
            }
        }
        else
            resFail.style.display = "block";
        barraSearch.value = "";
    }
    function procesaImg (crudImgCod64)
    {
        var crudImgDecod = atob(crudImgCod64).split(",");
        var imgBytes = new Uint8Array(crudImgDecod.length);
        for(i=0; i<crudImgDecod.length; i++)
            imgBytes[i] = parseInt(crudImgDecod[i]);
        img = new Blob([imgBytes], {type : 'image'});
        srcIMG = URL.createObjectURL(img);
    }
    //FUNCION PARA CREAR ARTICULOS DINAMICOS EN EL CLIENTE
    function createElements (rJSON)
    {
        //CONTENEDOR DE TODOS LOS ARTCULOS CREADOS
        var contennedorArts = document.getElementsByTagName("section")[0];
        //CREAMOS EL CONTENEDOR DE CADA ARTICULO
        var cajaArticulo = document.createElement("article");
        cajaArticulo.appendChild(document.createTextNode(""));
        //CREAMOS EL ELEMNTO DE IMAGEN
        var imagen = document.createElement("img");
        imagen.setAttribute("src", srcIMG);
        imagen.setAttribute("alt", "img art");
        //CREAMOS EL CONTENEDOR PARA LOS DETALLES DE CADA PRODUCTO DESPLEGADO DEL SERVER EN Y CREAMOS UN
        //PARAFO POR CADA CAMPO DE LA BASE DE DATOS, A LOS PARRAFOS LE PONEMOS LA RESPUESTA JSON DEL SERVER
        var cajaTextos = document.createElement("span");
        var nombreArt = document.createElement("p");
        nombreArt.innerText = "Producto : "+rJSON.nombre;
        var descripArt = document.createElement("p");
        descripArt.innerText = "Descripci&oacute;n : "+rJSON.descripcion;
        var precioArt = document.createElement("p");
        precioArt.innerText = "Precio : "+rJSON.precio;
        var cantAlmArt = document.createElement("p");
        cantAlmArt.innerText = "Existencias : "+rJSON.cantidadAlmacen;
        var fechaArt = document.createElement("p");
        fechaArt.innerText = "Fecha : "+rJSON.fechaRegistro;
        //CREAMOS EL CAMPO PARA INGRESAR LA CANTIDAD QUE DESEAMOS DE CADA PRODUCTO CON EL BOTON E AGREGAR AL CARRO
        var botonCompra = document.createElement("button");
        botonCompra.setAttribute("class", "addCar");
        botonCompra.innerText = "Añadir";
        //AGREGAMOS EL EVENTO PARA LOS BOTONES DE AGREGAR CARRITO EN CADA ELEMENTO
        botonCompra.addEventListener("click", agregarCarroAjax);
        var labelInput = document.createElement("label");
        labelInput.innerText = "Cantidad :";
        var inputCant = document.createElement("input");
        var contentAddCar = document.createElement("div");
        contentAddCar.setAttribute("class", "contAddCar");
        inputCant.setAttribute("type", "number");
        inputCant.setAttribute("name", "cantidad");
        inputCant.setAttribute("min", "1");
        inputCant.setAttribute("value", "1");
        //AGREGAMOS LOS PARRAFOS CREADOS A SU CONTENEDOR PARA DARLE ESTILOS
        cajaTextos.appendChild(document.createTextNode(""));
        cajaTextos.appendChild(nombreArt);
        cajaTextos.appendChild(descripArt);
        cajaTextos.appendChild(precioArt);
        cajaTextos.appendChild(cantAlmArt);
        cajaTextos.appendChild(fechaArt);
        //AGREGAMOS EL INPUT Y EL BOTON A SU CONTENEDOR
        contentAddCar.appendChild(labelInput);
        contentAddCar.appendChild(inputCant);
        //AGREGAMOS LO CONTENEDORES PREVIOS Y LA IMAGEN AL COTENEDOR DEL ARTICULO GENERAL
        cajaArticulo.appendChild(imagen);
        cajaArticulo.appendChild(cajaTextos);
        cajaArticulo.appendChild(contentAddCar);
        cajaArticulo.appendChild(botonCompra);
        //AGREGAMOS EL ARTCULO AL CONTENEDOR DE ARTICULOS
        contennedorArts.appendChild(cajaArticulo);
    }
});