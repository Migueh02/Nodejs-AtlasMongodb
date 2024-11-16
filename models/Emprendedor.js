const mongoose = require('mongoose');

const emprendedorSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    correo: { type: String, required: true, unique: true },
    telefono: { type: String },
    descripcion: { type: String },
    fotoPerfil: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Emprendedor', emprendedorSchema);
