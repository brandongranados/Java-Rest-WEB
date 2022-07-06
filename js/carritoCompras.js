var cargaPagina = document.addEventListener("DOMContentLoaded", function () {
    var img;
    var srcIMG;

    mostrarCarritoAJax();

    function mostrarCarritoAJax()
    {
        console.log("ENTRO");
        var resServer = new XMLHttpRequest();
        resServer.open("POST", "http://localhost:8080/tarea8/rest/users/consultaCar");
        resServer.setRequestHeader("Content-Type", "application/json");
        resServer.onreadystatechange = function (){
            resServer.status == 200 && resServer.readyState == 4 ? server200(resServer) : console.log("");
        };
        resServer.send(JSON.stringify("-"));
    }
    function server200(resServer)
    {
        var trfoot = document.getElementsByTagName("tfoot")[0].childNodes[1]; 
        var obJSON = JSON.parse(resServer.responseText);
        var msmVacio = document.getElementById("vacio");
        var total = 0;
        if(obJSON.detalle != "CARRITO VACIO")
        {
            for(cont=0; cont<obJSON.length; cont++)
            {
                procesaImg(obJSON[cont].byteFoto);
                total += creaTableArt(obJSON[cont]);
            }
            msmVacio.style.display = "none";
        }
        else
        {
            console.log(obJSON.detalle);
            msmVacio.style.display = "block";
        }
        var tdTotal = document.createElement("td");
        tdTotal.setAttribute("colspan", "2");
        tdTotal.appendChild(document.createTextNode(""));
        tdTotal.innerText = total;

        trfoot.appendChild(tdTotal);
    }
    function creaTableArt(obJSON2)
    {
        var tbody = document.getElementsByTagName("tbody")[0]; 
        //CREAMOS EL RENGLON DEL ARTICULO
        var tr = document.createElement("tr");
        tr.appendChild(document.createTextNode(""));

        var imgFoto = document.createElement("img");
        imgFoto.setAttribute("src", srcIMG);

        var tdFoto = document.createElement("td");
        tdFoto.appendChild(document.createTextNode(""));
        tdFoto.appendChild(imgFoto);
        tdFoto.setAttribute("class", "anchoFoto");

        var tdDescrip = document.createElement("td");
        tdDescrip.appendChild(document.createTextNode(""));
        tdDescrip.innerText = obJSON2.descripcion;
        tdDescrip.setAttribute("class", "anchoDescrip");

        var tdCant = document.createElement("td");
        tdCant.appendChild(document.createTextNode(""));
        tdCant.innerText = obJSON2.cantCompra;
        tdCant.setAttribute("class", "anchoRest");

        var tdPrecio = document.createElement("td");
        tdPrecio.appendChild(document.createTextNode(""));
        tdPrecio.innerText = obJSON2.precio;
        tdPrecio.setAttribute("class", "anchoRest");

        var tdCosto = document.createElement("td");
        tdCosto.appendChild(document.createTextNode(""));
        tdCosto.innerText = obJSON2.precio * obJSON2.cantCompra;
        tdCosto.setAttribute("class", "anchoRest");

        var inputCheck = document.createElement("input");
        inputCheck.appendChild(document.createTextNode(""));
        inputCheck.setAttribute("type", "checkbox");
        inputCheck.setAttribute("class", "inputElimina");

        var tdInput = document.createElement("td");
        tdInput.appendChild(document.createTextNode(""));
        tdInput.setAttribute("class", "tdelimina");
        tdInput.appendChild(inputCheck);

        var hiddenNombre = document.createElement("input");
        hiddenNombre.setAttribute("type", "hidden");
        hiddenNombre.setAttribute("class", "nombreART");
        hiddenNombre.setAttribute("value", obJSON2.nombre);

        var tdNombreOculto = document.createElement("td");
        tdNombreOculto.appendChild(document.createTextNode(""));
        tdNombreOculto.appendChild(hiddenNombre);
        
        tr.appendChild(tdFoto);
        tr.appendChild(tdDescrip);
        tr.appendChild(tdCant);
        tr.appendChild(tdPrecio);
        tr.appendChild(tdCosto);
        tr.appendChild(tdInput);
        tr.appendChild(tdNombreOculto);

        tbody.appendChild(tr);

        return obJSON2.precio * obJSON2.cantCompra;
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
});