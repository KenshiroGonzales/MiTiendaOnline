const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para procesar JSON grandes e imágenes en Base64
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Asegurar carpeta uploads local
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Archivo JSON para persistencia local de productos
const dataFile = path.join(__dirname, 'productos.json');

let productos = [];
let nextId = 1;

// Cargar productos guardados previamente si el archivo existe
if (fs.existsSync(dataFile)) {
    try {
        const data = fs.readFileSync(dataFile, 'utf8');
        productos = JSON.parse(data);
        if (productos.length > 0) {
            nextId = Math.max(...productos.map(p => p.id)) + 1;
        }
    } catch (err) {
        console.error("Error al leer el archivo de productos:", err);
        productos = [];
    }
}

// Función para guardar cambios en el archivo JSON
function guardarProductosEnDisco() {
    fs.writeFileSync(dataFile, JSON.stringify(productos, null, 2));
}

// Rutas de las vistas
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// API: Obtener todos los productos
app.get('/api/productos', (req, res) => {
    res.json(productos);
});

// API: Crear un nuevo producto
app.post('/api/productos', (req, res) => {
    const { nombre, precio, imagen, descripcion } = req.body;
    if (!nombre || !precio || !imagen || !descripcion) {
        return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const nuevoProducto = {
        id: nextId++,
        nombre,
        precio: parseFloat(precio),
        imagen,
        descripcion
    };

    productos.push(nuevoProducto);
    guardarProductosEnDisco(); // Guardar cambios
    res.status(201).json(nuevoProducto);
});

// API: Modificar un producto existente
app.put('/api/productos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { nombre, precio, imagen, descripcion } = req.body;

    const index = productos.findIndex(p => p.id === id);
    if (index === -1) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }

    productos[index] = {
        id,
        nombre: nombre || productos[index].nombre,
        precio: precio !== undefined ? parseFloat(precio) : productos[index].precio,
        imagen: imagen || productos[index].imagen,
        descripcion: descripcion || productos[index].descripcion
    };

    guardarProductosEnDisco(); // Guardar cambios
    res.json(productos[index]);
});

// API: Eliminar un producto
app.delete('/api/productos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = productos.findIndex(p => p.id === id);

    if (index === -1) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const eliminado = productos.splice(index, 1);
    guardarProductosEnDisco(); // Guardar cambios
    res.json({ success: true, eliminado: eliminado[0] });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
