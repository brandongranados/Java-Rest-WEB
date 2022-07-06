package src;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import com.google.gson.*;

public class prueba {
    public prueba ()throws SQLException
    {
        Gson objJSON = new GsonBuilder().create();
        String sql = "SELECT idArticulo, cantAlmacen FROM articulo WHERE nombre = ?";
        carrito rel = new carrito();
        rel.nombreElemtSolictado = "laptop asus vivobook";
        rel.precioElemtSolictado = 6;
        String temp = objJSON.toJson(rel);
        carrito newCar = (carrito) objJSON.fromJson(temp, carrito.class);
        Connection conex = null;
        PreparedStatement consult = null;
        ResultSet res = null;
        boolean validaCommit1 = false, validaCommit2 =  false;
        int idArt = 0, cantAlmacen = 0, newCantAlm = 0;
        try {
            Class.forName("com.mysql.cj.jdbc.Driver").newInstance();
            conex = DriverManager.getConnection("jdbc:mysql://localhost:3306/distribuidos", "userDistribuidos", "S2019300476señales+");
            conex.setAutoCommit(false);
            try {
                conex.rollback();
            } catch (Exception e) {}
            consult = conex.prepareStatement(sql);
            //BUSCANDO PRODUCTO POR NOMBRE
            consult.setString(1, newCar.nombreElemtSolictado);
            res = consult.executeQuery();
            if(res.next())
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
            System.out.println("TODO BIEN");
        else if(validaCommit1 && validaCommit2 && newCantAlm < 0)
            System.out.println("INCSUFIECIENTE");
        else
            System.out.println("MAL");
    }
    public static void main(String[] args) throws SQLException {
        prueba hola = new prueba();
    }
}
