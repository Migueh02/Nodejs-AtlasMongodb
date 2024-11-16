const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Página de login
router.get('/login', (req, res) => {
    res.render('login', { message: null });  // Pasa message como null inicialmente
});

// Manejar el envío del formulario de login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.render('login', { message: 'Usuario no encontrado' });
        }

        const match = await user.comparePassword(password);
        if (!match) {
            return res.render('login', { message: 'Contraseña incorrecta' });
        }

        // Iniciar sesión
        req.session.userId = user._id;
        res.redirect('/');
    } catch (err) {
        res.status(500).send('Error al iniciar sesión');
    }
});

// Página de registro
router.get('/register', (req, res) => {
    res.render('register');
});

// Manejar el envío del formulario de registro
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = new User({ username, password });
        await user.save();
        res.redirect('/login');
    } catch (err) {
        res.status(500).send('Error al registrar el usuario');
    }
});

// Cerrar sesión
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).send('Error al cerrar sesión');
        res.redirect('/login');
    });
});

// Middleware de autenticación
router.use((req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    next();
});




const emprendedorController = require('../controllers/emprendedorController');

router.get('/', emprendedorController.renderIndex);
router.get('/crear', emprendedorController.renderCrear);
router.post('/crear', emprendedorController.crearEmprendedor);
router.get('/editar/:id', emprendedorController.renderEditar);
router.post('/editar/:id', emprendedorController.actualizarEmprendedor);
router.post('/eliminar/:id', emprendedorController.eliminarEmprendedor);

// Ruta para editar un emprendedor
router.post('/editar/:id', (req, res) => {
    const id = req.params.id;
    const { nombre, correo, telefono, descripcion } = req.body;

    Emprendedor.findByIdAndUpdate(id, { nombre, correo, telefono, descripcion })
        .then(() => res.redirect('/')) // Redirigir a la página principal después de actualizar
        .catch(err => res.status(500).send(err));
});

// Middleware para verificar si el usuario está autenticado
router.use((req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/login');  // Redirigir a login si no está autenticado
    }
    next();
});

// Rutas protegidas, como la de la página principal
router.get('/', (req, res) => {
    // Si el usuario está autenticado, esta ruta se accede
    res.render('index');
});

module.exports = router;

