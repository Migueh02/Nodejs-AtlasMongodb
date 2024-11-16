const Emprendedor = require('../models/Emprendedor');

exports.renderIndex = async (req, res) => {
    const emprendedores = await Emprendedor.find();
    res.render('index', { emprendedores });
};

exports.renderCrear = (req, res) => {
    res.render('crear');
};

exports.crearEmprendedor = async (req, res) => {
    const { nombre, correo, telefono, descripcion } = req.body;
    await Emprendedor.create({ nombre, correo, telefono, descripcion });
    res.redirect('/');
};

exports.renderEditar = async (req, res) => {
    const emprendedor = await Emprendedor.findById(req.params.id);
    res.render('editar', { emprendedor });
};

exports.actualizarEmprendedor = async (req, res) => {
    const { nombre, correo, telefono, descripcion } = req.body;
    await Emprendedor.findByIdAndUpdate(req.params.id, { nombre, correo, telefono, descripcion });
    res.redirect('/');
};

exports.eliminarEmprendedor = async (req, res) => {
    await Emprendedor.findByIdAndDelete(req.params.id);
    res.redirect('/');
};
