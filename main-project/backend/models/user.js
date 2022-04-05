const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: { type: String, required: true},
    email: { type: String, required: true, unique: true}, //speeds up query process by giving it an internal index - DOES NOT make sure email is unique
    password: { type: String, required: true, minlength: 6}, 
    image: { type: String, required: true},
    places: { type: String, required: true} // will be dynamic later, uniqueId's
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);