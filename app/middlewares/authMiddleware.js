const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'tu_clave_secreta';

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', ''); // Extraer token del header "Authorization"

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // Adjuntar los datos del proveedor al request
    next(); // Continuar con la siguiente ruta
  } catch (error) {
    res.status(400).json({ message: 'Token no válido.' });
  }
};

module.exports = authMiddleware;
