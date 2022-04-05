//const uuid = require('uuid');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const User = require('../models/user');

const DUMMY_USERS = [
    {
        id: 'u1',
        name: 'Bob Smith',
        email: 'test@test.com',
        password: 'hashedpassword'
    }
];

const getUsers= (req, res, next) => {
    res.status(200).json({ users: DUMMY_USERS });
};

const signup = async (req, res, next) => {
    const errors = validationResult(req); 
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data', 422));
    }

    const { name, email, password, places } = req.body;

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

    const createdUser = new User({
        name,
        email,
        image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260',
        password,
        places
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

    res.status(201).json({user: createdUser.toObject({ getters:true })});

};

const loginUser = (req, res, next) => {
    const { email, password } = req.body;

    const identifedUser = DUMMY_USERS.find(u => u.email === email);

    if(!identifedUser || identifedUser.password != password) {
        throw new HttpError('Could not identify user, credentials seem to be wrong', 401);
    }

    res.status(200).json({message: 'Logged in!'})

};

exports.getUsers= getUsers;
exports.signup = signup;
exports.loginUser = loginUser;