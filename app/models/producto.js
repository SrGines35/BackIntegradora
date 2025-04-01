const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  Nombre: { type: String, required: true },
  Descripcion: { type: String, required: true },
  Precio: { 
    type: Number, 
    required: true, 
    min: [0, 'El precio no puede ser negativo'] 
  },
  Stock: { 
    type: Number, 
    required: true, 
    min: [0, 'El stock no puede ser negativo'] 
  },
  proveedor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Proveedor',  
    required: true 
  },
  categoria: { type: String, required: true },
  url_direction: { type: String },
  imagenes: [{ type: String }], // Ahora las imágenes se guardan en un array
  favorito: { type: Boolean, default: false }, 
}, { timestamps: true });

const Producto = mongoose.model('Producto', productoSchema);
module.exports = Producto;