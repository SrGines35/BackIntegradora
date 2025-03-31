const express = require('express');
const mongoose = require('mongoose'); 
const cors = require('cors');
const path = require('path'); // Para manejar rutas de archivos
require('dotenv').config();

const DB_URL = process.env.DB_URL;
const PORT = process.env.PORT || 3000;
const app = express();
const bodyParser = require('body-parser');

const usuarioRoutes = require('./app/routes/usuarioRoutes'); 
const itemsRoutes = require('./app/routes/items');  // Corrección en el nombre
const proveedorRoutes = require('./app/routes/proveedorRoutes');
const productoRoutes = require('./app/routes/productoRoutes');

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));

// Servir archivos estáticos desde 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas de la API
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/items', itemsRoutes);
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/productos', productoRoutes);

// Conectar a MongoDB
if (!DB_URL) {
  console.error('❌ No se ha definido DB_URL en las variables de entorno.');
  process.exit(1); // Detiene la ejecución si no hay una URL válida
}

mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(error => console.error('❌ Error de conexión a MongoDB:', error));

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});