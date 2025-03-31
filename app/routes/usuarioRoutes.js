const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController'); 


router.get('/', usuarioController.getUsers);
router.get('/:id', usuarioController.getUserById);
router.post('/', usuarioController.createUser);
router.put('/:id', usuarioController.updateUser);
router.delete('/:id', usuarioController.deleteUser);
router.post('/login', usuarioController.login);


module.exports = router;
