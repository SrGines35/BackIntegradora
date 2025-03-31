const express = require('express');
const router = express.Router();
const proveedorController = require('../controllers/proveedorController');
const upload = require('../../config/multerConfig');

router.get('/', proveedorController.getProveedores);

router.get('/:id', proveedorController.getProveedorById);



router.put('/:id', proveedorController.updateProveedor);

router.delete('/:id', proveedorController.deleteProveedor);

router.post('/login', proveedorController.login);


// Configuración de la ruta para crear proveedor y cargar imágenes
router.post('/', 
  upload.fields([
    { name: 'ImagenPerfil', maxCount: 1 },  // Solo se permite una imagen para 'ImagenPerfil'
    { name: 'ImagenNegocio', maxCount: 1 }  // Solo se permite una imagen para 'ImagenNegocio'
  ]), 
  proveedorController.createProveedor
);

  
  // Actualizar proveedor con imagen de perfil e imagen de negocio
  router.put('/:id', 
    upload.fields([
      { name: 'ImagenPerfil', maxCount: 1 },  // Solo se permite una imagen para 'ImagenPerfil'
      { name: 'ImagenNegocio', maxCount: 1 }  // Solo se permite una imagen para 'ImagenNegocio'
    ]), 
    proveedorController.updateProveedor
  );

module.exports = router;
