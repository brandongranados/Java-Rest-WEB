create database distribuidos;

drop database distribuidos;

use distribuidos;

CREATE USER 'userDistribuidos'@'localhost' identified by 'S2019300476señales+';

grant all privileges on distribuidos.* to 'userDistribuidos'@'localhost';

flush privileges;

create table articulo (
idArticulo integer auto_increment primary key, nombre varchar(100) not null unique, 
descripcion varchar(200) not null, precio float not null, cantAlmacen bigint not null,
fechaRegistro datetime not null, foto longblob
);

insert into articulo (nombre, descripcion, precio, cantAlmacen, fechaRegistro, foto) values (
0, "prueba", "descrip", 100, 10, "2022-5-18 17:8:20", null
);

create unique index nombreIndex on articulo(nombre);
create unique index descripINdex on articulo(descripcion);

create table carrito_compra (
idCarrito integer auto_increment, idArticulo integer, cantCompra integer not null,
primary key(idCarrito, idArticulo), foreign key(idArticulo) references articulo (idArticulo) 
on delete cascade on update cascade
);

create unique index idArticuloIndex on carrito_compra(idArticulo);

select nombre, descripcion, precio, cantAlmacen, fechaRegistro, foto from articulo where descripcion like '%pas%';
select * from articulo;
delete from articulo where idArticulo = 33;
select * from carrito_compra;
delete from carrito_compra where idCarrito = 12;
SELECT * FROM carrito_compra;

select a.nombre, a.descripcion, a.precio, c.cantCompra, a.fechaRegistro, a.foto 
from carrito_compra c inner join articulo a on c.idArticulo = a.idArticulo;