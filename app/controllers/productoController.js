const Producto = require('../models/producto');
const Proveedor = require('../models/proveedor');
const fs = require('fs');
const path = require('path');

// Crear un nuevo producto y asociarlo a un proveedor
exports.crearProducto = async (req, res) => {
  try {
    const { proveedor, ...productoData } = req.body;
    const proveedorExistente = await Proveedor.findById(proveedor);
    if (!proveedorExistente) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }

    // Procesar y filtrar imágenes duplicadas
    let imagenesUnicas = [];
    const nombresSet = new Set();
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        // Si no se ha agregado la imagen según su nombre original, se guarda
        if (!nombresSet.has(file.originalname)) {
          nombresSet.add(file.originalname);
          imagenesUnicas.push(file.path);
        } else {
          // Si ya existe, eliminar el archivo duplicado del disco
          fs.unlink(file.path, (err) => {
            if (err) console.error('Error eliminando archivo duplicado:', err);
          });
        }
      });
    }

    const nuevoProducto = new Producto({
      proveedor,
      imagenes: imagenesUnicas,
      ...productoData
    });

    await nuevoProducto.save();

    // Asociar producto al proveedor
    proveedorExistente.productos.push(nuevoProducto._id);
    await proveedorExistente.save();

    res.status(201).json({ message: 'Producto creado con éxito', producto: nuevoProducto });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el producto', error: error.message });
  }
};

// Obtener todos los productos
exports.obtenerProductos = async (req, res) => {
  try {
    const productos = await Producto.find().populate('proveedor');
    res.status(200).json(productos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener productos', error: error.message });
  }
};

// Obtener un producto por ID
exports.obtenerProductoPorId = async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id).populate('proveedor');
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.status(200).json(producto);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener producto', error: error.message });
  }
};

// Obtener productos por proveedor
exports.obtenerProductosPorProveedor = async (req, res) => {
  try {
    const productos = await Producto.find({ proveedor: req.params.proveedorId }).populate('proveedor');
    res.status(200).json(productos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener productos por proveedor', error: error.message });
  }
};

// Actualizar un producto
exports.actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const productoExistente = await Producto.findById(id);
    if (!productoExistente) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Manejo de imágenes en la actualización, filtrando duplicados
    let imagenesActualizadas = productoExistente.imagenes;
    if (req.files && req.files.length > 0) {
      let imagenesUnicas = [];
      const nombresSet = new Set();
      req.files.forEach(file => {
        if (!nombresSet.has(file.originalname)) {
          nombresSet.add(file.originalname);
          imagenesUnicas.push(file.path);
        } else {
          fs.unlink(file.path, (err) => {
            if (err) console.error('Error eliminando archivo duplicado:', err);
          });
        }
      });
      imagenesActualizadas = imagenesUnicas;
    }

    const productoActualizado = await Producto.findByIdAndUpdate(
      id,
      { ...req.body, imagenes: imagenesActualizadas },
      { new: true }
    );

    res.status(200).json({ message: 'Producto actualizado con éxito', producto: productoActualizado });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar producto', error: error.message });
  }
};

// Eliminar un producto
exports.eliminarProducto = async (req, res) => {
  try {
    const producto = await Producto.findByIdAndDelete(req.params.id);
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Eliminar las imágenes asociadas al producto de la carpeta 'uploads'
    producto.imagenes.forEach(imagenPath => {
      const filePath = path.join(__dirname, '../uploads', imagenPath); // Ajusta la ruta si es necesario
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error al eliminar archivo:', err);
          else console.log(`Archivo eliminado: ${filePath}`);
        });
      }
    });

    // Eliminar referencia en el proveedor
    await Proveedor.findByIdAndUpdate(producto.proveedor, { $pull: { productos: producto._id } });

    res.status(200).json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar producto', error: error.message });
  }
};

// Obtener productos por categoría
exports.obtenerProductosPorCategoria = async (req, res) => {
  try {
    const { categoria } = req.params;
    const productos = await Producto.find({ categoria });
    if (productos.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontraron productos en esta categoría' });
    }
    res.json(productos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al buscar productos por categoría', error: error.message });
  }
};

// Buscar productos por nombre
exports.obtenerProductosPorNombre = async (req, res) => {
  try {
    const { nombre } = req.params;
    if (nombre.length < 4) {
      return res.status(400).json({ mensaje: 'El nombre debe tener al menos 4 caracteres' });
    }
    const productos = await Producto.find({ 
      Nombre: { $regex: `^${nombre}`, $options: 'i' } 
    });
    if (productos.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontraron productos con ese nombre' });
    }
    res.status(200).json(productos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al buscar productos por nombre', error: error.message });
  }
};

// Marcar o desmarcar un producto como favorito
exports.marcarComoFavorito = async (req, res) => {
  try {
    const productoId = req.params.id;
    const { favorito } = req.body;
    const producto = await Producto.findByIdAndUpdate(
      productoId,
      { favorito },
      { new: true }
    );
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.status(200).json({ message: 'Estado de favorito actualizado', producto });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar estado de favorito', error: error.message });
  }
};

// Obtener productos favoritos
exports.obtenerProductosFavoritos = async (req, res) => {
  try {
    const productosFavoritos = await Producto.find({ favorito: true }).populate('proveedor');
    res.status(200).json(productosFavoritos);
  } catch (error) {
    console.error('Error al obtener productos favoritos:', error);
    res.status(500).json({ message: 'Error al obtener productos favoritos', error: error.message });
  }
};
