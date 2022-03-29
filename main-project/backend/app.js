const express = require('express');
const bodyParser = require('body-parser');

const placesRoutes = require('./routes/places-routes');

const app = express();

app.use('/api/places', placesRoutes,);

app.use((error, req, res, next) => { // 4 parameters = express treats as special middleware errorhandling func, only executed on reqs with an error thrown
    if (res.headerSent) { // check of respone has been sent
        return next(error);
    }

    res.status(error.code || 500);
    res.json({message: error.message || 'An unknown error occured!'});

});

app.listen(5000);