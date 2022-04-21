//const uuid = require('uuid');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');
const User = require('../models/user');

const getUsers= async (req, res, next) => {
    let users;
    try {
        users = await User.find({}, '-password'); //only want to find email and name. alternate syntax ({}, 'email name')
    } catch(err) {
        const error = new HttpError('Fetching users failed', 500)
        return next(error);
    }

    res.json({users: users.map(
        user => user.toObject(
            { getters: true }
        )
    )});
};

const signup = async (req, res, next) => {
    //we need to link img upload with user and a url. also need to roll back in case there is an error so no img upload is saved
    const errors = validationResult(req); 
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data', 422));
    }

    const { name, email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({email: email}) // finds one document matching our criteria we set
    } catch(err) {
        const error = new HttpError('Signing up failed, please try again later', 500);
        return next(error);
    }
    
    if (existingUser) {
        const error = new HttpError('User exists already, please login instead', 422);
        return next(error);
    }

    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12); // 12 = standard, can't be reverse engineered and doesn't take hours to generate
    } catch(err) {
        const error = new HttpError('Could not create user, please try again', 500)
        return next(error);
    }

    const createdUser = new User({
        name,
        email,
        image: req.file.path,
        password: hashedPassword,
        places: []
    });

    try {
        await createdUser.save();
        //await createdUser.save(function(err){
        //    if(err){
        //        console.log(err);
        //        return;
        //    }
        //});
    } catch(err) {
        const error = new HttpError('Signup failed', 500);
        return next(error)
    }

    let token; //1st arg = payload, data we want to encode into token, 2nd=private string only server knows, 3rd=configuration obj
    try {
        token = jwt.sign(
            { userId: createdUser.id, email: createdUser.email },
            'supersecret_dont_share',
            { expiresIn: '1h' } //best practice is to let expire
        ); 
    } catch(err) {
        const error = new HttpError('Signup failed', 500);
        return next(error)
    }

    res.status(201).json({ userId: createdUser.id, email:createdUser.email, token: token });

};

const loginUser = async (req, res, next) => {
    const { email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({email: email}) // finds one document matching our criteria we set
    } catch(err) {
        const error = new HttpError('Logging in failed, please try again later', 500);
        return next(error);
    }

    if (!existingUser) {
        const error = new HttpError('Invalid credentials, could not log you in', 401)
        return next(error);
    }

    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch(err) {
        const error = new HttpError('Could not log you in, please check your credentials.', 500);
        return next(error);
    }

    if (!isValidPassword) {
        const error = new HttpError('Invalid credentials, could not log you in', 401)
        return next(error);
    }

    let token; 
    try {
        token = jwt.sign(
            { userId: existingUser.id, email: existingUser.email },
            'supersecret_dont_share', //very important to use the same string as above, if it is different we will generate a different token
            { expiresIn: '1h' } 
        ); 
    } catch(err) {
        const error = new HttpError('Logging in failed', 500);
        return next(error)
    }


    res.json({ userId: existingUser.id, email: existingUser.email, token: token });
};

exports.getUsers= getUsers;
exports.signup = signup;
exports.loginUser = loginUser;