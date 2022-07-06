var cargaPagina = document.addEventListener("DOMContentLoaded", function(){
    var formCaptArt = document.forms[0].elements["submit"];
    var eventIMG = document.forms[0].elements["foto"];
    var imgPreview = document.getElementById("img");

    //EVENTO PARA ENVIAR DATOS AL SERVIDOR
    formCaptArt.addEventListener("click", cargaIMG);
    //EVENTO CUANDO SE CAMBIA LA IMAGEN
    eventIMG.addEventListener("change", previsualizarIMG);

    function previsualizarIMG()
    {
        //MOSTRAR LA IMAGEN EN CLIENTE COMO PREVISUALIZACION
        var imgMostrar = new FileReader();
        imgMostrar.readAsDataURL(eventIMG.files[0]);
        imgMostrar.onload = function (){
            if(eventIMG.files[0])
                imgPreview.setAttribute("src", imgMostrar.result);
        };
    }
    function cargaIMG()
    {
        //CARGAR IMAGEN PARA ENVIAR DENTRO DEL OBJETO JSON COMO ARREGLO DE BYTES
        event.preventDefault();
        if(eventIMG.files[0])
        {
            var imgCarga = new FileReader();
            imgCarga.readAsArrayBuffer(eventIMG.files[0]);
            imgCarga.onload = function(){
                var bytes64Foto = "";
                if(eventIMG.files[0])
                {
                    bytes64Foto = btoa(new Uint8Array(imgCarga.result));
                    recopilaDatosJSON(bytes64Foto);
                }
            };
        }
        else
            recopilaDatosJSON("");
    }
    function recopilaDatosJSON(bytes64Foto)
    {
        var errores = "";
        var obj = new Object();
        //CREAMOS UNA FECHAHORA LOCAL
        var dt = new Date();
        //RESETEAMOS LA FECHA LOCAL POR UNA FECHA UTC
        dt.setFullYear(dt.getUTCFullYear());
        dt.setMonth(dt.getUTCMonth());
        dt.setDate(dt.getUTCDate());
        //RESETEAMOS LA HORA LOCAL POR UNA HORA UTC
        dt.setHours(dt.getUTCHours());
        dt.setMinutes(dt.getUTCMinutes());
        dt.setSeconds(dt.getUTCSeconds());
        //CON toJSON obtenemos la fecha como cadena con formato similar a 'yyy-MM-dd'T'HH:mm:ss.SSSZ' 
        //y separamos la cadena apartir de la T obteniendo ['yyy-MM-dd', 'HH:mm:ss.SSSZ']
        var separaDT = dt.toJSON().split("T");
        //OBTENEMOS UNA CADENA CON LA FECHA QUE ACEPTA EL CAMPO DATETIME DE MySQL ejemplo: 'yyy-MM-dd HH:mm:ss'
        //CON FORMATO DE FECHA UTC
        var dtMySQL_UTC = separaDT[0]+" "+separaDT[1].split(".")[0];
        //VALIDACIONES DE CAMPOS
        if(document.forms[0].elements["nombre"].value == "")
            errores += "EL nombre no puede ir vacio \n";
        if(document.forms[0].elements["descripcion"].value == "")
            errores += "La descripcion no puede ir vacia \n";
        //if(parseFloat(document.forms[0].elements["precio"].value) > 0)
            //errores += "El precio debe de ser mayor o igual a 0 \n";
        //if(parseInt(document.forms[0].elements["cantAmacen"].value) > 0)
            //errores += "La cantidad de almacen debe de ser mayor o igual a 0";
        if(errores.length != 0)
        {
            alert(errores);
            return;
        }
        //OBTENEMOS VALORES DE FORMULARIO EN UN OBJETO
        obj.nombre = document.forms[0].elements["nombre"].value;
        obj.descripcion = document.forms[0].elements["descripcion"].value;
        obj.precio = parseFloat(document.forms[0].elements["precio"].value);
        obj.cantidadAlmacen = parseInt(document.forms[0].elements["cantAmacen"].value);
        obj.fechaRegistro = dtMySQL_UTC;
        obj.byteFoto = bytes64Foto;
        enviarDatos(JSON.stringify(obj));
    }
    function enviarDatos(objJSON)
    {
        var xhr = new XMLHttpRequest();
        xhr.open("POST","http://localhost:8080/tarea8/rest/users/captura");
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = function () {
            xhr.status == 200 && xhr.readyState == 4 ? respAjax200() : console.log("PETICION EN PROCESO");
            xhr.status == 400 && xhr.readyState == 4 ? respAjaxDif200(xhr) : console.log("");
        };
        xhr.send(objJSON);
    }
    function respAjax200()
    {
        alert("DATOS INGRESADOS CORRECTAMENTE");
        deleteForm();
    }
    function respAjaxDif200(xhr)
    {
        var rJSON = JSON.parse(xhr.responseText);
        alert(rJSON.detalle);
        deleteForm();
    }
    function deleteForm ()
    {
        document.forms[0].elements["nombre"].value = "";
        document.forms[0].elements["descripcion"].value = "";
        document.forms[0].elements["precio"].value = "";
        document.forms[0].elements["cantAmacen"].value = "";
        document.getElementById("img").removeAttribute("src");
    }
});