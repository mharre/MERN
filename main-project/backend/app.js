const express = require('express');
const bodyParser = require('body-parser');

const usersRoutes = require('./routes/users-routes');
const placesRoutes = require('./routes/places-routes');
const HttpError = require('./models/http-error');

const app = express();

app.use(bodyParser.json()); // location of this is important, top down middleware

app.use('/api/users', usersRoutes);
app.use('/api/places', placesRoutes,);

app.use((res, req, next) => { //idea that this only runs when we don't send a response in any other middle ware above
    const error = new HttpError('Could not find this page', 404);
    throw error;
}); 

app.use((error, req, res, next) => { // 4 parameters = express treats as special middleware errorhandling func, only executed on reqs with an error thrown
    if (res.headerSent) { // check of respone has been sent
        return next(error);
    }

    res.status(error.code || 500);
    res.json({message: error.message || 'An unknown error occured!'});

});

app.listen(5000);