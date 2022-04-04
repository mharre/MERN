const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({ // constructor func, put new in front to add object to it
    name: {type: String, required: true},
    price: {type: Number, required: true}
});

// after schema creation must add a model to use schema
module.exports = mongoose.model('Product', productSchema); //1st arg = name we want, second refers to schema we created 