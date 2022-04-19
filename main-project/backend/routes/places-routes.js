const express = require('express');
const { check } = require('express-validator');
// check returns new middleware configured for our validation requirements

const placesControllers = require('../controllers/places-controller');
const fileUpload = require('../middleware/file-upload');

const router = express.Router(); //gives us special object which w can register middleware and can export our configured router, import in app and register as 1 single middlewar

router.get('/:pid', placesControllers.getPlaceById);

router.get('/user/:uid', placesControllers.getPlacesByUserId);

router.post('/',
    fileUpload.single('image'),
    [
        check('title').not().isEmpty(),
        check('description').isLength({min: 5}),
        check('address').not().isEmpty()
    ],
    placesControllers.createPlace
);
//check takes the name of the field you want to have validation on

router.patch('/:pid', // does not clash with above because it is only for patch and not a get
    [
        check('title').not().isEmpty(),
        check('description').isLength({min: 5})
    ],
    placesControllers.updatePlace
); 

router.delete('/:pid', placesControllers.deletePlace);

module.exports = router;

//ORDER OF ROUTES MATTERS so if /:pid is first technically /user would still work for this route