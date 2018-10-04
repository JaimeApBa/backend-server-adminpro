var express = require('express');

var mdAuthetication = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital');

// ====================================================
// Obtener todos los hospitales
// ====================================================

app.get('/', (req, res) => {

    var desde = req.query.desde || 0;

    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec((err, hospital) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error al buscar hospital',
                    errors: err
                });
            }
            Hospital.count({}, (err, total) => {
                res.status(200).json({
                    ok: true,
                    hospital,
                    total
                });
            });

        });

});

// ====================================================
// Actualizar hospital
// ====================================================

app.put('/:id', mdAuthetication.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar hospital',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                message: 'El hospital no existe',
                errors: err
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'No se ha podido actualizar el hospital',
                    errors: err
                });
            }

            return res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });

    });

});

// ====================================================
// Crear nuevo hospital
// ====================================================

app.post('/', mdAuthetication.verificaToken, (req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'No se ha podido crear el hospital',
                errors: err
            });
        }

        return res.status(200).json({
            ok: true,
            hospital: hospitalGuardado
        });

    });

});

// ====================================================
// Borrar hospital
// ====================================================

app.delete('/:id', mdAuthetication.verificaToken, (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al borrar hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                message: 'El hospital no existe',
                errors: { message: 'No existe ese hospital' }
            });
        }

        return res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });

    });

});

module.exports = app;