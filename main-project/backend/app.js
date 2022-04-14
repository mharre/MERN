const fs = require('fs');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const usersRoutes = require('./routes/users-routes');
const placesRoutes = require('./routes/places-routes');
const HttpError = require('./models/http-error');

const app = express();

app.use(bodyParser.json()); // location of this is important, top down middleware

app.use('/uploads/images', express.static( //just return file, don't execute - just return. must contol which files in which folders we must return therefore we need an absolute path
    path.join('uploads', 'images') // builds path to uploads/images, if there is a request to this specific path the requested image is returned
));

app.use((req, res, next) => {
    // idea is we don't send response, just add certain headers to the response. when response is sent back from more specific routes (below) it already has these headers attached
    res.setHeader('Access-Control-Allow-Origin', '*'); //this allows everything, could technically just allow localhost:3000
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader('Access-Control-Allow-Methods','GET, POST, PATCH, DELETE');

    next();
});

app.use('/api/users', usersRoutes);
app.use('/api/places', placesRoutes,);

app.use((req, res, next) => { //idea that this only runs when we don't send a response in any other middle ware above
    const error = new HttpError('Could not find this page', 404);
    throw error;
}); 

app.use((error, req, res, next) => { // 4 parameters = express treats as special middleware errorhandling func, only executed on reqs with an error thrown
    if (req.file) { //.file is added to req by multer - if .file we want to delete since this is our general error catching func
        fs.unlink(req.file.path, (err) => {
            console.log(err);
        }); 
    }
    if (res.headerSent) { // check of respone has been sent
        return next(error);
    }

    res.status(error.code || 500);
    res.json({message: error.message || 'An unknown error occured!'});

});

mongoose
    .connect('mongodb+srv://matthew:eoUNed4irv7IWuZD@cluster0-mernpractice.z5bhi.mongodb.net/mern?retryWrites=true&w=majority')
    .then(() => {
        app.listen(5000);
    })
    .catch(err => {
        console.log(err);
    }) 