const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); 


exports.getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const users = await Usuario.paginate({}, { page, limit, select: '-password' });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los usuarios", error });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await Usuario.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el usuario", error });
    }
};


exports.createUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userExists = await Usuario.findOne({ email });
        if (userExists) return res.status(400).json({ message: "El correo ya está registrado" });

        const newUser = new Usuario({ name, email, password });
        await newUser.save();
        res.status(201).json({ message: "Usuario creado correctamente", user: newUser });
    } catch (error) {
        res.status(500).json({ message: "Error al crear el usuario", error });
    }
};


exports.updateUser = async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = await Usuario.findByIdAndUpdate(req.params.id, { name, email }, { new: true }).select('-password');
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
        res.json({ message: "Usuario actualizado", user });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar el usuario", error });
    }
};


exports.deleteUser = async (req, res) => {
    try {
        const user = await Usuario.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
        res.json({ message: "Usuario eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar el usuario", error });
    }
};


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
       
        const user = await Usuario.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }
       
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }
   
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ message: "Login exitoso", token });
    } catch (error) {
        res.status(500).json({ message: "Error al iniciar sesión", error });
    }
};
