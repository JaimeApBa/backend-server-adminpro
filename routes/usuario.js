var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Usuario = require('../models/usuario');

// ====================================================
// Obtener todos los usuarios
// ====================================================

app.get('/', (req, res) => {

    var desde = req.query.desde || 0;

    desde = Number(desde);

    Usuario.find({}, 'nombre email img role google')
        .skip(desde)
        .limit(5)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando usuarios',
                    errors: err
                });
            }

            Usuario.count({}, (err, total) => {

                res.status(200).json({
                    ok: true,
                    usuarios,
                    total

                });

            });


        });


});


// ====================================================
// Actualizar usuario
// ====================================================

app.put('/:id', [mdAutenticacion.verificaToken, mdAutenticacion.verificaROLE_OR_USUARIO], (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario no existe',
                errors: { message: 'No existe ese usuario' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el usuario',
                    errors: err
                });
            }
            usuarioGuardado.password = ":)"; // Muestra este texto, para no enseñar el autentico password
            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });

        });
    });

});


// ====================================================
// Crear nuevo usuario
// ====================================================

app.post('/', (req, res) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            creadoPor: req.usuario
        });
    });

});

// ====================================================
// Borrar usuario
// ====================================================

app.delete('/:id', [mdAutenticacion.verificaToken, mdAutenticacion.verificaROLE], (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario no existe',
                errors: { message: 'No existe ese usuario' }
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioBorrado
        });

    });

});

module.exports = app;