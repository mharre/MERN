const express = require('express');

const router = express.Router(); //gives us special object which w can register middleware and can export our configured router, import in app and register as 1 single middlewar

const DUMMY_PLACES = [
    {
        id: 'p1',
        title: 'Empire State Building',
        description: 'AMAZING',
        location: {
            lat: 40.7484474,
            lng: -73.9871516
        },
        address: '20 W 34th St, New York, NY 10001',
        creator: 'u1'
    },
    {
        id: 'p2',
        title: 'Empire State Building',
        description: 'AMAZING',
        location: {
            lat: 40.7484474,
            lng: -73.9871516
        },
        address: '20 W 34th St, New York, NY 10001',
        creator: 'u2'
    },
];

router.get('/:pid', (req, res, next) => { // path should only be what would trigger after the path inside of app.js, so no need to include /api/places/ in this path
    const placeId = req.params.pid // { pid: 'p1' }
    const place = DUMMY_PLACES.find(p => {
        return p.id == placeId
    });

    if (!place) {
        const error = new Error('Could not find a place for the provided id.');
        error.code = 404;
        throw error;
    }

    res.json({place}); // takes any data that can be converted to valid json. obj, array, num, bool, str etc 
});

router.get('/user/:uid', (req, res, next) => { 
    const userId = req.params.uid 
    const place = DUMMY_PLACES.find(p => {
        return p.creator == userId
    });

    if (!place) {
        const error = new Error('Could not find a place for the provided user id.');
        error.code = 404;
        return next(error); //next if we are running an async function
    }

    res.json({place}); 
});

module.exports = router;

//ORDER OF ROUTES MATTERS so if /:pid is first technically /user would still work for this route