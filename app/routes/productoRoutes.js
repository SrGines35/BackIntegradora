const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const upload = require('../../config/multerConfig');


router.get('/', productoController.obtenerProductos);
router.get('/:id', productoController.obtenerProductoPorId);
router.get('/proveedor/:proveedorId', productoController.obtenerProductosPorProveedor);
router.get('/categoria/:categoria', productoController.obtenerProductosPorCategoria);
router.get('/nombre/:nombre', productoController.obtenerProductosPorNombre);
router.get('/favoritos/favorito=true', productoController.obtenerProductosFavoritos);

// Crear un producto con subida de imágenes
router.post('/', upload.array('imagenes', 3), productoController.crearProducto);

// Actualizar un producto con subida de imágenes
router.put('/:id', upload.array('imagenes', 3), productoController.actualizarProducto);

router.put('/:id/favorito', productoController.marcarComoFavorito);
router.delete('/:id', productoController.eliminarProducto);

module.exports = router;
