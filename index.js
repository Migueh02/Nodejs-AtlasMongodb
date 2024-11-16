const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');

const fs = require('fs');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const puppeteer = require('puppeteer');

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
app.get('/exportar/pdf', async (req, res) => {
    try {
        // Obtener todos los emprendedores de la base de datos
        const emprendedores = await Emprendedor.find();

        // Crear un documento PDF en memoria
        const doc = new PDFDocument();
        let buffers = [];
        
        // Capturar los datos del PDF en un buffer
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            // Configurar los encabezados para la descarga
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=Emprendedores.pdf');
            res.send(pdfData);
        });

        // Agregar contenido al PDF
        doc.fontSize(18).text('Emprendedores Registrados', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text('Nombre | Correo | Teléfono | Descripción');
        doc.moveDown();

        // Agregar datos de cada emprendedor
        emprendedores.forEach(emprendedor => {
            doc.text(`${emprendedor.nombre} | ${emprendedor.correo} | ${emprendedor.telefono} | ${emprendedor.descripcion}`);
        });

        // Finalizar el documento
        doc.end();
    } catch (err) {
        console.error('Error al generar el PDF:', err);
        res.status(500).send('Error al generar el PDF.');
    }
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
    const emprendedores = await Emprendedor.find();
    const html = `
        <html>
        <head><style>table, th, td {border: 1px solid black; border-collapse: collapse; padding: 8px;} th {text-align: left;}</style></head>
        <body>
            <h2>Emprendedores Registrados</h2>
            <table>
                <thead>
                    <tr><th>Nombre</th><th>Correo</th><th>Teléfono</th><th>Descripción</th></tr>
                </thead>
                <tbody>
                    ${emprendedores.map(emprendedor => `
                        <tr>
                            <td>${emprendedor.nombre}</td>
                            <td>${emprendedor.correo}</td>
                            <td>${emprendedor.telefono}</td>
                            <td>${emprendedor.descripcion}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </body>
        </html>
    `;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    const filePath = path.join(__dirname, 'Emprendedores.png');
    await page.screenshot({ path: filePath });
    await browser.close();

    res.download(filePath, 'Emprendedores.png', (err) => {
        if (err) {
            console.error('Error al descargar archivo:', err);
        }
        fs.unlinkSync(filePath); // Elimina el archivo temporal después de la descarga
    });
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