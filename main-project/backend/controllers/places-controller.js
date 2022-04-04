const uuid = require('uuid');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place');

let DUMMY_PLACES = [ //let so we are allowed to delete, const = unchangeable 
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

const getPlaceById = async (req, res, next) => { // path should only be what would trigger after the path inside of app.js, so no need to include /api/places/ in this path
    const placeId = req.params.pid // { pid: 'p1' }
    let place;
    try {
        place = await Place.findById(placeId); //findById DOES NOT return real promise, exec does
    } catch(err) {
        const error = new HttpError('Something went wrong, could not find a place', 500)
        return next(error);
    }

    if (!place) {
        const error = new HttpError('Could not find a place for the provided id.', 404);
        return next(error);
    }

    res.json({place: place.toObject({getters: true})}); // we want to convert our special mongoose obj into regular JS object 
                                                        // also want to get rid of the underscore in the id, getters: true is so the id is added to our js object, normally would be lost when converting
};

const getPlacesByUserId = async (req, res, next) => { 
    const userId = req.params.uid
    let places;
    try {
        places = await Place.find({ creator: userId });
    } catch(err) {
        const error = new HttpError('Fetching places failed, try again later', 500)
        return next(error);
    }

    if (!places || places.length === 0) {
        return next(
            new HttpError('Could not find places for the provided user id.', 404) //next if we are running an async function
        ); 
    }

    //can't use toObject() because mongoose find() returns array
    res.json({ 
        places: places.map(
            p => p.toObject(
                { getters: true}
            )
        )
    }); 
};

const createPlace = async (req, res, next) => {
    const errors = validationResult(req); //always put this at the beginning
    if (!errors.isEmpty()) {
        //console.log(errors)
        return next(new HttpError('Invalid inputs passed, please check your data', 422)); //next due to async code
    }

    // we expect data in the body due to it being a post request
    const { title, description, address, creator } = req.body; //obj destructuring to grab what we want

    let coordinates;
    try {
        coordinates = await getCoordsForAddress(address);
    } catch(error) {
        return next(error); //return error just to quit execution
    }

    const createdPlace = new Place({ // these properties must match what was created in schema
        title,
        description,
        address,
        location: coordinates,
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Empire_State_Building_%28aerial_view%29.jpg/800px-Empire_State_Building_%28aerial_view%29.jpg',
        creator 
    });

    try {
        await createdPlace.save();
    } catch(err) {
        const error = new HttpError(
            'Creating place failed, please try again', 500
        );
        return next(error);
    }

    res.status(201).json({place:createdPlace}); //201 is standard for successful creation on server

};

const updatePlace = async (req, res, next) => {
    const errors = validationResult(req); 
    if (!errors.isEmpty()) {
        return next (
            new HttpError('Invalid inputs passed, please check your data', 422)
        );
    }

    const { title, description } = req.body;
    const placeId = req.params.pid;
    
    let place;
    try {
        place = await Place.findById(placeId); //findById DOES NOT return real promise, exec does
    } catch(err) {
        const error = new HttpError('Something went wrong, could not find a place', 500)
        return next(error);
    }

    place.title = title;
    place.description = description;

    try {
        await place.save();
    } catch(err) {
        const error = new HttpError('Something went wrong, could not update place', 500)
        return next(error)
    }

    res.status(200).json({place: place.toObject( {getters: true} )});
};

const deletePlace = (req, res, next) => {
    const placeId = req.params.pid;
    if (!DUMMY_PLACES.find(p => p.id ==placeId)) {
        throw new HttpError('Could not find a place for that id.', 404);
    }

    DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId); // if id's match it will return false, false = dropped from array
    res.status(200).json({message: 'Deleted Successfully'});
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
// both will be bundled into 1 object, express calls function for us
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;