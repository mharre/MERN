const jwt = require('jsonwebtoken');

const HttpError = require("../models/http-error");

module.exports = (req, res, next) => {
    if (req.method === 'OPTIONS') { //default browswer behavior, send OPTIONS req to test if others are allowed
        return next();
    }

    //.headers accessable via express, don't want token in body because not all routes that need protection will have a body, we send token in headers instead
    //check app.js and authorization header is set, case insensitive
    try {
        const token = req.headers.authorization.split(' ')[1]; // typically Authorization: 'Bearer Token', split on the whitespace between bearer / token
        if (!token) {
            throw new Error('Authentication Failed') // 2 errors, 1 if authorization isn't set, 2 if it is and we split and get somethning invalid
        }

        const decodedToken = jwt.verify(token,'supersecret_dont_share') //same string that was set in user-controller, different or type = diff token. returns object with token info
        req.userData = { userId: decodedToken.userId }; //adding data to req, everyone after can now use userId
        next(); //when we reach this, we know they are authenticated and can call next so they can reach any other route in the middleware
    } catch(err) {
        const error = new HttpError('Authentication Failed', 401);
        return next(error);
    }

};