package src;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import javax.naming.Context;
import javax.naming.InitialContext;
import javax.sql.DataSource;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import com.google.gson.*;

@Path("users")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class servidor {
    static Gson objJSON = new GsonBuilder().setDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS").create();
    static DataSource pool = null;
    static
    {
        try {
            Context tablaPool = new InitialContext();
            pool = (DataSource) tablaPool.lookup("java:comp/env/jdbc/mysql");
        } catch (Exception e) {}
    }
    @POST
    @Path("captura")
    public Response altaArticulo(String stringJSON) throws Exception
    {
        articulo newArt = (articulo)objJSON.fromJson(stringJSON, articulo.class);
        String stringSQL = "", error="";
        stringSQL = "INSERT INTO articulo(nombre, descripcion, precio, cantAlmacen, fechaRegistro, foto) VALUES (?, ?, ?, ?, ?, ?)";
        Connection conex = null;
        try 
        {
            conex = pool.getConnection();
            conex.setAutoCommit(false);
            try {
                conex.rollback();
            } catch (SQLException e1) {}
            PreparedStatement insertSQL = conex.prepareStatement(stringSQL);
            insertSQL.setString(1, newArt.nombre);
            insertSQL.setString(2, newArt.descripcion);
            insertSQL.setFloat(3, newArt.precio);
            insertSQL.setInt(4, newArt.cantidadAlmacen);
            insertSQL.setString(5, newArt.fechaRegistro);
            insertSQL.setString(6, newArt.byteFoto);
            if(insertSQL.executeUpdate() != 0)
                conex.commit();
            else
                conex.rollback();
            insertSQL.close();
            conex.close();
        } 
        catch (Exception e) 
        {
            return Response.status(400).entity(objJSON.toJson(new error(e.getMessage()))).build();
        }
        finally
        {
            try {
                conex.close();
            } catch (SQLException e) {}
        }
        return Response.ok().build();
    }
    @POST
    @Path("consulta")
    public Response selct(String coin) throws Exception
    {
        String coincidencia = "%"+objJSON.fromJson(coin, String.class)+"%";
        ArrayList<articulo> artList = new ArrayList<articulo>();
        String stringSQL = "SELECT nombre, descripcion, precio, cantAlmacen, fechaRegistro, foto FROM articulo WHERE descripcion LIKE ?";
        Connection conex = null;
        PreparedStatement consultSQL = null;
        ResultSet resultSQL = null;
        try
        {
            conex = pool.getConnection();
            consultSQL = conex.prepareStatement(stringSQL);
            consultSQL.setString(1, coincidencia);
            resultSQL = consultSQL.executeQuery();
            while(resultSQL.next())
            {
                articulo art = new articulo();
                art.nombre = resultSQL.getString("nombre");
                art.descripcion = resultSQL.getString("descripcion");
                art.precio = resultSQL.getFloat("precio");
                art.cantidadAlmacen = resultSQL.getInt("cantAlmacen");
                art.fechaRegistro = resultSQL.getString("fechaRegistro");
                art.byteFoto = resultSQL.getString("foto");
                artList.add(art);
            }
        }
        catch (Exception e) 
        {
            return Response.status(400).entity(objJSON.toJson(new error(e.getMessage()))).build();
        }
        finally
        {
            try {
                resultSQL.close();
                consultSQL.close();
                conex.close();
            } catch (Exception e) {}
        }
        if(artList.size() != 0)
            return Response.ok().entity(objJSON.toJson(artList)).build();
        else
            return Response.ok().entity(objJSON.toJson(new error("NO EXISTEN COINCIDENCIAS"))).build();
    }
    @POST
    @Path("addCar")
    public Response carritoCompras(String nuevoElement)
    {
        String sql = "SELECT idArticulo, cantAlmacen FROM articulo WHERE nombre = ?";
        carrito newCar = (carrito)objJSON.fromJson(nuevoElement, carrito.class);
        Connection conex = null;
        PreparedStatement consult = null;
        ResultSet res = null;
        boolean validaCommit1 = false, validaCommit2 =  false;
        int idArt = 0, cantAlmacen = 0, newCantAlm = 0;
        try {
            conex = pool.getConnection();
            conex.setAutoCommit(false);
            try {
                conex.rollback();
            } catch (Exception e) {}
            consult = conex.prepareStatement(sql);
            //BUSCANDO PRODUCTO POR NOMBRE
            consult.setString(1, newCar.nombreElemtSolictado);
            res = consult.executeQuery();
            while(res.next())
            {
                idArt = res.getInt("idArticulo");
                cantAlmacen = res.getInt("cantAlmacen");
            }
            res.close();
            consult.close();
            //INSERTANDO VALORES EN LA TABLA DE CARRITO
            sql = "INSERT INTO carrito_compra (idArticulo, cantCompra) VALUES (?, ?)";
            consult = conex.prepareStatement(sql);
            consult.setInt(1, idArt);
            consult.setInt(2, newCar.precioElemtSolictado);
            if(consult.executeUpdate() != 0)
                validaCommit1 = true;
            consult.close();
            //REALIZANDO UPDATE EN ARTICULO
            sql = "UPDATE articulo SET cantAlmacen = ? WHERE idArticulo = ?";
            newCantAlm = cantAlmacen-newCar.precioElemtSolictado;
            consult = conex.prepareStatement(sql);
            consult.setInt(1, newCantAlm);
            consult.setInt(2, idArt);
            if(consult.executeUpdate() != 0)
                validaCommit2 = true;
            /*VALIDA EL COMMIT CON LOS BOOLEANOS Y QUE LA RESTA DE ARTICULOS EN 
            ALMACEN CON ARTICULOS SOLICITADOS SEA >= 0*/
            if(validaCommit1 && validaCommit2 && newCantAlm >= 0)
                conex.commit();
            else
                conex.rollback();
            consult.close();
            conex.close();
        } catch (Exception e) {}
        finally
        {
            try {
                res.close();
            } catch (Exception e) {}
            try {
                consult.close();
            } catch (Exception e) {}
            try {
                conex.close();
            } catch (Exception e) {}
        }
        if(validaCommit1 && validaCommit2 && newCantAlm >= 0)
            return Response.ok().build();
        else if(validaCommit1 && validaCommit2 && newCantAlm < 0)
            return Response.status(400).entity(objJSON.toJson(new error("ARTICULOS INSUFICIENTES PARA COMPRA"))).build();
        else
            return Response.status(400).entity(new error("ERROR INTERNO")).build();
    }
    @POST
    @Path("consultaCar")
    public Response consultaCarrito(String objVacio)
    {
        ArrayList<articuloCar> listArt = new ArrayList<articuloCar>();
        Connection conex = null;
        PreparedStatement consult = null;
        ResultSet res = null;
        String sql = "select a.nombre, a.descripcion, a.precio, c.cantCompra, a.fechaRegistro, a.foto ";
        sql += "from carrito_compra c inner join articulo a on c.idArticulo = a.idArticulo";
        try {
            conex = pool.getConnection();
            consult = conex.prepareStatement(sql);
            res = consult.executeQuery();
            while(res.next())
            {
                articuloCar newArtCar = new articuloCar();
                newArtCar.nombre = res.getString("nombre");
                newArtCar.descripcion = res.getString("descripcion");
                newArtCar.precio = res.getFloat("precio");
                newArtCar.cantCompra = res.getInt("cantCompra");
                newArtCar.fechaRegistro = res.getString("fechaRegistro");
                newArtCar.byteFoto = res.getString("foto");
                listArt.add(newArtCar);
            }
            res.close();
            consult.close();
            conex.close();
        } catch (Exception e) {}
        finally
        {
            try {
                res.close();
            } catch (Exception e1) {}
            try {
                consult.close();
            } catch (Exception e1) {}
            try {
                conex.close();
            } catch (Exception e1) {}
        }
        if(listArt.size() != 0)
            return Response.ok(objJSON.toJson(listArt)).build();
        else
            return Response.status(400).entity(objJSON.toJson(new error("CARRITO VACIO"))).build();
    }
}