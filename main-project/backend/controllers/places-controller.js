const fs = require('fs');

//const uuid = require('uuid');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place');
const User = require('../models/user');

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

    //let places;
    let userWithPlaces;
    try {
        //places = await Place.find({ creator: userId });
        userWithPlaces = await User.findById(userId).populate('places');
    } catch(err) {
        const error = new HttpError('Fetching places failed, try again later', 500)
        return next(error);
    }

    if (!userWithPlaces || userWithPlaces.length === 0) {
        return next(
            new HttpError('Could not find places for the provided user id.', 404)
        ); 
    }
    
    //if (!places || places.length === 0) {
    //    return next(
    //        new HttpError('Could not find places for the provided user id.', 404)
    //    ); 
    //}

    //can't use toObject() because mongoose find() returns array
    res.json({ places: userWithPlaces.places.map(place => place.toObject({ getters: true }))}); 
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
        image: req.file.path,
        creator 
    });

    let user;
    try {
        user = await User.findById(creator); //check if ID of logged in user is already existing
    } catch(err) {
        const error = new HttpError(
            'Creating place failed, please try again', 500
        );
        return next(error);
    }

    if (!user) {
        const error = new HttpError('We could not find user for provided id', 404);
        return next(error)
    }

    //console.log(user);

    /****************************************************************************************************** 
    ********** Working with Transactions / Sessions means mongodb cann't create on the fly collections ****
    *******************************************************************************************************/

    try { // transactions/sessions. transaction = allow perform multiple operations, they are built on a session so session must come first
        const sess = await mongoose.startSession(); // once session begins we can start our transtion
        sess.startTransaction(); // now write what we want to do
        await createdPlace.save({ session: sess }); // this creates a new place and automatically creates the id because mongodb. now make sure this place is connected to user
        user.places.push(createdPlace); // mongoose specific .push() method - pushes the connection between the 2 models in which we are referring
        await user.save({ session: sess});
        await sess.commitTransaction(); // only at this point is it saved to DB

    } catch(err) {
        console.log(err);
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

    if (place.creator.toString() !== req.userData.userId) { //toString because creator is a special mongoose ID which isn't a string so we convert
        const error = new HttpError('You are not allowed to edit this place', 401)
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

const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid;
    let place;
    try {
        place = await Place.findById(placeId).populate('creator'); //can only use populate if existing connection between collections exists - looking to change info in Users.creator
    } catch(err) {
        const error = new HttpError('Something went wrong, could not find the place', 500);
        return next(error);
    }

    if (!place) {
        const error = new HttpError('Could not find place for this id', 404);
        return next(error);
    }

    if ( place.creator.id !== req.userData.userId ) { //because of populate we can just access creator.id immediately 
        const error = new HttpError('You are not allowed to edit this place', 401)
        return next(error);
    }

    const imagePath = place.image; //place document with image key

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await place.remove({ session: sess }) //we know place exists because we check above if it doesn't 
        place.creator.places.pull(place); //mongoose specific pull - pull that specific place from the places array in the creator
        await place.creator.save({ session: sess }) // we are allowed to use pull because populate gave us access to the full object linked to that place
        await sess.commitTransaction(); 
    } catch(err) {
        const error = new HttpError('Something went wrong, could not delete the place', 500);
        return next(error);
    }

    fs.unlink(imagePath, (err) => {
        console.log(err);
    });

    res.status(200).json({message: 'Deleted Successfully'});
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
// both will be bundled into 1 object, express calls function for us
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;