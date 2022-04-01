const express = require('express');

const placesControllers = require('../controllers/places-controller');

const router = express.Router(); //gives us special object which w can register middleware and can export our configured router, import in app and register as 1 single middlewar

router.get('/:pid', placesControllers.getPlaceById);

router.get('/user/:uid', placesControllers.getPlaceByUserId);

router.post('/', placesControllers.createPlace);

router.patch('/:pid', placesControllers.updatePlace); // does not clash with above because it is only for patch and not a get

router.delete('/:pid', placesControllers.deletePlace);

module.exports = router;

//ORDER OF ROUTES MATTERS so if /:pid is first technically /user would still work for this route