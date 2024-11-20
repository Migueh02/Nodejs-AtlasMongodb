const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');

const fs = require('fs');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const puppeteer = require('puppeteer');
const { createCanvas } = require('canvas');

const Emprendedor = require('./models/Emprendedor');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de la base de datos
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error al conectar a MongoDB:', err));

// Configuración de EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de la sesión
app.use(session({
  secret: 'mysecret',  // Cambia esta clave por algo más seguro
  resave: false,
  saveUninitialized: true
}));

// Rutas
const authRoutes = require('./routes/rutas');
app.use('/', authRoutes);

// Ruta de Exportación a Excel
app.get('/exportar/excel', async (req, res) => {
    const emprendedores = await Emprendedor.find();
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Emprendedores');

    worksheet.columns = [
        { header: 'Nombre', key: 'nombre' },
        { header: 'Correo', key: 'correo' },
        { header: 'Teléfono', key: 'telefono' },
        { header: 'Descripción', key: 'descripcion' }
    ];

    emprendedores.forEach(emprendedor => {
        worksheet.addRow(emprendedor);
    });

    const filePath = path.join(__dirname, 'Emprendedores.xlsx');
    await workbook.xlsx.writeFile(filePath);
    res.download(filePath, 'Emprendedores.xlsx', (err) => {
        if (err) {
            console.error('Error al descargar archivo:', err);
        }
        fs.unlinkSync(filePath); // Elimina el archivo temporal después de la descarga
    });
});

// Ruta de Exportación a PDF
app.get('/exportar/pdf', async (req, res) => {
    try {
        // Obtener todos los emprendedores de la base de datos
        const emprendedores = await Emprendedor.find();

        // Generar el contenido HTML para el PDF
        let htmlContent = `
            <h1 style="text-align: center;">Emprendedores Registrados</h1>
            <table border="1" style="width: 100%; border-collapse: collapse;">
                <tr>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Teléfono</th>
                    <th>Descripción</th>
                </tr>`;
        
        emprendedores.forEach(emp => {
            htmlContent += `
                <tr>
                    <td>${emp.nombre}</td>
                    <td>${emp.correo}</td>
                    <td>${emp.telefono}</td>
                    <td>${emp.descripcion}</td>
                </tr>`;
        });
        htmlContent += `</table>`;

        // Configurar el archivo PDF
        const file = { content: htmlContent };

        // Generar el PDF en memoria
        const pdfBuffer = await pdf.generatePdf(file, { format: 'A4' });

        // Enviar el PDF como respuesta
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=Emprendedores.pdf');
        res.send(pdfBuffer);
    } catch (err) {
        console.error('Error al generar el PDF:', err);
        res.status(500).send('Error al generar el PDF.');
    }
});

app.use(express.static(path.join(__dirname, 'public')));

// Ruta de Exportación a TXT
app.get('/exportar/txt', async (req, res) => {
    const emprendedores = await Emprendedor.find();
    const filePath = path.join(__dirname, 'Emprendedores.txt');
    let fileContent = 'Emprendedores Registrados\n\n';

    emprendedores.forEach(emprendedor => {
        fileContent += `${emprendedor.nombre} | ${emprendedor.correo} | ${emprendedor.telefono} | ${emprendedor.descripcion}\n`;
    });

    fs.writeFileSync(filePath, fileContent);
    res.download(filePath, 'Emprendedores.txt', (err) => {
        if (err) {
            console.error('Error al descargar archivo:', err);
        }
        fs.unlinkSync(filePath); // Elimina el archivo temporal después de la descarga
    });
});

// Ruta de Exportación a PNG
app.get('/exportar/png', async (req, res) => {
    try {
        const emprendedores = await Emprendedor.find();

        // Crear el lienzo y el contexto
        const canvas = createCanvas(800, 600);
        const ctx = canvas.getContext('2d');

        // Establecer el estilo de fuente y el color
        ctx.font = '16px Arial';
        ctx.fillStyle = 'black';

        // Títulos
        ctx.fillText('Emprendedores Registrados', 10, 30);

        // Dibujar la tabla
        const headers = ['Nombre', 'Correo', 'Teléfono', 'Descripción'];
        let yPos = 60;
        headers.forEach((header, index) => {
            ctx.fillText(header, 10 + index * 180, yPos);
        });

        // Dibujar las filas
        emprendedores.forEach(emprendedor => {
            yPos += 30;
            ctx.fillText(emprendedor.nombre, 10, yPos);
            ctx.fillText(emprendedor.correo, 180, yPos);
            ctx.fillText(emprendedor.telefono, 360, yPos);
            ctx.fillText(emprendedor.descripcion, 540, yPos);
        });

        // Guardar el PNG
        const filePath = path.join('/tmp', 'Emprendedores.png');
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(filePath, buffer);

        // Descargar el archivo
        res.download(filePath, 'Emprendedores.png', (err) => {
            if (err) {
                console.error('Error al descargar archivo:', err);
                res.status(500).send('Error al descargar el archivo.');
            }
            fs.unlinkSync(filePath); // Eliminar el archivo temporal después de la descarga
        });
    } catch (err) {
        console.error('Error al generar el PNG:', err);
        res.status(500).send('Error al generar el PNG.');
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Middleware de autenticación
function verificarAutenticacion(req, res, next) {
    if (req.session && req.session.usuarioLogueado) {
        return next();
    } else {
        return res.redirect('/login');
    }
}

// Ruta de login
app.get('/login', (req, res) => {
    if (req.session && req.session.usuarioLogueado) {
        return res.redirect('/index');
    }
    res.render('login');
});

// Procesar el formulario de login
app.post('/login', async (req, res) => {
    const { correo, password } = req.body;
    const usuario = await Emprendedor.findOne({ correo });

    if (usuario && usuario.password === password) {
        req.session.usuarioLogueado = usuario;
        return res.redirect('/index');
    } else {
        res.render('login', { mensaje: 'Credenciales incorrectas' });
    }
});

// Ruta protegida
app.get('/index', verificarAutenticacion, async (req, res) => {
    const emprendedores = await Emprendedor.find();
    res.render('index', { emprendedores });
});

// Cerrar sesión
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
        }
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
});