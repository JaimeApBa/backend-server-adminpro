var express = require('express');

var mdAuthetication = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico');

// ====================================================
// Obtener todos los medicos
// ====================================================

app.get('/', (req, res) => {

    var desde = req.query.desde || 0;

    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medico) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error al buscar medico',
                    errors: err
                });
            }
            Medico.count({}, (err, total) => {
                res.status(200).json({
                    ok: true,
                    medico,
                    total
                });
            });

        });

});

// ====================================================
// Actualizar medico
// ====================================================

app.put('/:id', mdAuthetication.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar medico',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                message: 'El medico no existe',
                errors: err
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'No se ha podido actualizar el medico',
                    errors: err
                });
            }

            return res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });

    });

});

// ====================================================
// Crear nuevo medico
// ====================================================

app.post('/', mdAuthetication.verificaToken, (req, res) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'No se ha podido crear el medico',
                errors: err
            });
        }

        return res.status(200).json({
            ok: true,
            medico: medicoGuardado
        });

    });

});

// ====================================================
// Borrar medico
// ====================================================

app.delete('/:id', mdAuthetication.verificaToken, (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al borrar medico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                message: 'El medico no existe',
                errors: { message: 'No existe ese medico' }
            });
        }

        return res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });

    });

});

module.exports = app;