const Proveedor = require('../models/proveedor');
const Producto = require('../models/producto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

exports.createProveedor = async (req, res) => {
  try {
    const { name, email, password, NumeroTelefono, DescripcionNegocio, UbicacionNegocio, UrlFacebook } = req.body;

    // Validación simplificada
    if (!name || !email || !password || !NumeroTelefono || !DescripcionNegocio || !UbicacionNegocio || !UrlFacebook) {
      return res.status(400).json({ message: "Todos los campos son requeridos" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newProveedor = new Proveedor({
      name,
      email,
      password: hashedPassword,
      NumeroTelefono,
      DescripcionNegocio,
      UbicacionNegocio,
      UrlFacebook,
      ImagenPerfil: req.files['ImagenPerfil']?.[0]?.path,
      ImagenNegocio: req.files['ImagenNegocio']?.[0]?.path
    });

    await newProveedor.save();
    res.status(201).json({ message: "Proveedor creado correctamente" });

  } catch (error) {
    res.status(500).json({ 
      message: "Error al crear el proveedor",
      error: error.message
    });
  }
};




// Obtener todos los proveedores
exports.getProveedores = async (req, res) => {
    try {
        const proveedores = await Proveedor.find().select('-password').populate('productos');
        res.json(proveedores);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los proveedores", error });
    }
};

// Obtener proveedor por ID
exports.getProveedorById = async (req, res) => {
    try {
        const proveedor = await Proveedor.findById(req.params.id).select('-password').populate('productos');
        if (!proveedor) return res.status(404).json({ message: "Proveedor no encontrado" });
        res.json(proveedor);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el proveedor", error });
    }
};

// Actualizar proveedor
exports.updateProveedor = async (req, res) => {
    try {
        const { 
            name, 
            email, 
            NombreEncargado, 
            CorreoNegocio, 
            DescripcionNegocio, 
            NumeroTelefono, 
            UbicacionNegocio, 
            UrlFacebook 
        } = req.body;

        // Verificar si el proveedor existe
        const proveedor = await Proveedor.findById(req.params.id);
        if (!proveedor) return res.status(404).json({ message: "Proveedor no encontrado" });

        // Procesar y filtrar imágenes duplicadas
        let imagenPerfil = proveedor.ImagenPerfil;
        let imagenNegocio = proveedor.ImagenNegocio;

        if (req.files) {
          // Filtrar la imagen de perfil
          if (req.files.ImagenPerfil && !req.files.ImagenPerfil[0].duplicate) {
            imagenPerfil = req.files.ImagenPerfil[0].path;
          }
          
          // Filtrar la imagen de negocio
          if (req.files.ImagenNegocio && !req.files.ImagenNegocio[0].duplicate) {
            imagenNegocio = req.files.ImagenNegocio[0].path;
          }
          
          // Eliminar archivos duplicados
          req.files.forEach(file => {
            if (file.duplicate) {
              fs.unlink(file.path, (err) => {
                if (err) console.error('Error eliminando archivo duplicado:', err);
              });
            }
          });
        }

        // Actualizar proveedor
        const updatedProveedor = await Proveedor.findByIdAndUpdate(
            req.params.id, 
            { 
                name, 
                email, 
                NombreEncargado, 
                CorreoNegocio, 
                DescripcionNegocio, 
                NumeroTelefono, 
                UbicacionNegocio, 
                UrlFacebook, 
                ImagenPerfil: imagenPerfil, 
                ImagenNegocio: imagenNegocio 
            }, 
            { new: true }
        ).select('-password').populate('productos');
        
        if (!updatedProveedor) return res.status(404).json({ message: "Proveedor no encontrado" });
        res.json({ message: "Proveedor actualizado", proveedor: updatedProveedor });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar el proveedor", error });
    }
};

// Eliminar proveedor
exports.deleteProveedor = async (req, res) => {
    try {
        const proveedor = await Proveedor.findById(req.params.id);
        if (!proveedor) return res.status(404).json({ message: "Proveedor no encontrado" });

        // Eliminar los productos asociados
        await Producto.deleteMany({ proveedor: proveedor._id });
        await proveedor.deleteOne(); // Eliminar proveedor

        res.json({ message: "Proveedor y sus productos eliminados correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar el proveedor", error });
    }
};

// Login de proveedor
exports.login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.status(400).json({ message: "Email y contraseña son requeridos" });
      }
  
      const proveedor = await Proveedor.findOne({ email }).select('+password');
      if (!proveedor) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }
  
      // Comparar las contraseñas
      const isMatch = await proveedor.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }
  
      const token = jwt.sign({ id: proveedor._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
      // Eliminar la contraseña de la respuesta
      proveedor.password = undefined; 
  
      res.json({
        message: "Login exitoso",
        proveedor,
        token
      });
    } catch (error) {
      res.status(500).json({ message: "Error al iniciar sesión", error });
    }
};