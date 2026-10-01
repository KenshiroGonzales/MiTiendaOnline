const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para procesar JSON grandes (necesario si subes imágenes en Base64) y archivos estáticos
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Asegurar carpeta uploads local por si se requiere
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Base de datos en memoria 
let productos = [
    {
        id: 1,
        nombre: "Elf Bar BC5000",
        precio: 120.00,
        imagen: "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=600&q=80",
        descripcion: "Dispositivo desechable con hasta 5000 caladas y sabores frutales intensos."
    },
    {
        id: 2,
        nombre: "Lost Mary BM6000",
        precio: 140.00,
        imagen: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=600&q=80",
        descripcion: "Diseño ergonómico compacto, batería recargable y excelente rendimiento."
    },
    {
        id: 3,
        nombre: "Juul Dispositivo Starter Kit",
        precio: 180.00,
        imagen: "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=600&q=80",
        descripcion: "Sistema de pods elegante, fácil de usar y con calada suave."
    }
];

let nextId = 4;

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
    res.json({ success: true, eliminado: eliminado[0] });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});