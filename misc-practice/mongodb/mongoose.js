// logic to create and get new products
const mongoose = require('mongoose');

const Product = require('./models/product');

const url = 'mongodb+srv://matthew:eoUNed4irv7IWuZD@cluster0-mernpractice.z5bhi.mongodb.net/products_test?retryWrites=true&w=majority';
mongoose.connect(url)
    .then(() => {
        console.log('Connected to DB')
    })
    .catch(() => {
        console.log('Connection Failed')
    })

const createProduct = async (req, res, next) => {
    const createdProduct = new Product({
        name: req.body.name,
        price: req.body.price
    });

    const result = await createdProduct.save(); // because we created a model and blue print we can easily just use .save()

    console.log(typeof createdProduct.id); // .id is mongoose specific, we cannot use the ObjectId in javascript w/o conversion because this property is added automatically by mongodb
    res.status(201).json(result);

};

const getProducts = async (req, res, next) => {
    const products = await Product.find().exec(); //with mongoose returns arr by default, also Product = name of export at bottom of product.js, .exec() turn into real promise instead of fake mongo prom
    res.json(products);
};

exports.createProduct = createProduct;
exports.getProducts = getProducts;