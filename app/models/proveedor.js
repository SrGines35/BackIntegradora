const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const proveedorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, match: /.+\@.+\..+/, unique: true }, 
  // NombreEncargado: { type: String, required: true },
  // CorreoNegocio: { type: String, required: true },
  DescripcionNegocio: { type: String },
  NumeroTelefono: { type: String, required: true },
  UbicacionNegocio: { type: String },
  UrlFacebook: { type: String },
  ImagenPerfil: { type: String },
  ImagenNegocio: { type: String },
  productos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Producto' }],
  password: {
    type: String,
    required: [true, "La contraseña es obligatoria"],
    minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
    select: false
  }
}, { timestamps: true });

// Método para encriptar la contraseña 
proveedorSchema.methods.encryptPassword = async function(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Método para comparar la contraseña con la almacenada
proveedorSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const Proveedor = mongoose.model('Proveedor', proveedorSchema);
module.exports = Proveedor;