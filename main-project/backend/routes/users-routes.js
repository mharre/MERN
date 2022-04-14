const express = require('express');
const { check } = require('express-validator');

const usersController = require('../controllers/users-controller');
const fileUpload = require('../middleware/file-upload');

const router = express.Router(); 

router.get('/', usersController.getUsers);

router.post(
    '/signup',
    fileUpload.single('image'), //we will expect an image key on what we want to extract, value should be the actual pic. instructs multer to extract this file with the image key
    [
        check('name').not().isEmpty(),
        check('email').normalizeEmail().isEmail(),
        check('password').isLength({min: 6})

    ],
    usersController.signup
);

router.post('/login', usersController.loginUser);

module.exports = router;