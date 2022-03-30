const uuid = require('uuid');

const HttpError = require('../models/http-error');

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
];

const getPlaceById = (req, res, next) => { // path should only be what would trigger after the path inside of app.js, so no need to include /api/places/ in this path
    const placeId = req.params.pid // { pid: 'p1' }
    const place = DUMMY_PLACES.find(p => {
        return p.id == placeId
    });

    if (!place) {
        throw new HttpError('Could not find a place for the provided id.', 404);
    }

    res.json({place}); // takes any data that can be converted to valid json. obj, array, num, bool, str etc 
};

const getPlaceByUserId =  (req, res, next) => { 
    const userId = req.params.uid 
    const place = DUMMY_PLACES.find(p => {
        return p.creator == userId
    });

    if (!place) {
        return next(
            new HttpError('Could not find a place for the provided user id.', 404) //next if we are running an async function
        ); 
    }

    res.json({place}); 
};

const createPlace = (req, res, next) => {
    // we expect data in the body due to it being a post request
    const { title, description, coordinates, address, creator } = req.body; //obj destructuring to grab what we want
    
    const createdPlace = {
        id: uuid.v4(),
        title,
        description,
        location: coordinates,
        address,
        creator
    };

    DUMMY_PLACES.push(createdPlace);

    res.status(201).json({place:createdPlace}); //201 is standard for successful creation on server

};

exports.getPlaceById = getPlaceById;
exports.getPlaceByUserId = getPlaceByUserId;
// both will be bundled into 1 object, express calls function for us
exports.createPlace = createPlace;