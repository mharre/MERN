const express = require('express');

const placesControllers = require('../controllers/places-controller');

const router = express.Router(); //gives us special object which w can register middleware and can export our configured router, import in app and register as 1 single middlewar

router.get('/:pid', placesControllers.getPlaceById);

router.get('/user/:uid', placesControllers.getPlaceByUserId);

router.post('/', placesControllers.createPlace);

module.exports = router;

//ORDER OF ROUTES MATTERS so if /:pid is first technically /user would still work for this route