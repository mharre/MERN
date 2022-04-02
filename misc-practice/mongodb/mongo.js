const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb+srv://matthew:eoUNed4irv7IWuZD@cluster0-mernpractice.z5bhi.mongodb.net/products_test?retryWrites=true&w=majority';

const createProduct = async (req, res, next) => {
    const newProduct = { //this object represents a what a new product should look like
        name: req.body.name,
        price: req.body.price
    };

    const client = new MongoClient(url); //this doesnt establsh connection, just tells which server we want to connect too
    try {
        await client.connect();
        const db = client.db(); // no argument it takes name from our url string

        const result = await db.collection('products').insertOne(newProduct); // if name doesn't exist it will be created new, if it does it iwll be added to existing

    } catch(error) {
        return res.json({message: 'Could not store data'});
    };
    
    client.close();
    res.json(newProduct);

};

const getProducts = async (req, res, next) => {
    const client = new MongoClient(url);
    let products;
    try {
        await client.connect();
        const db = client.db();

        products = await db.collection('products').find().toArray(); //find() for mongo db returns cursor which we can loop through, to array is so we just add them all to array

    } catch(error) {
        return res.json({message: 'Could not retrieve data'});
    };
    client.close();
    res.json(products);
};

exports.createProduct = createProduct;
exports.getProducts = getProducts;