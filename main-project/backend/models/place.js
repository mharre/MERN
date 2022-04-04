const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const placeSchema = new Schema({
    title: { type: String, required: true},
    description: { type: String, required: true},
    image: { type: String, required: true}, //do not store img on db, always url pointing to img
    address: { type: String, required: true},
    location: {
        lat: { type: Number, required: true},
        lng: { type: Number, required: true},
    },
    creator: { type: String, required: true} //changes later
});

module.exports = mongoose.model('Place', placeSchema); //typically capital first letter and non plural name