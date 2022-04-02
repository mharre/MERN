const uuid = require('uuid');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');

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

const signup = (req, res, next) => {
    const errors = validationResult(req); 
    if (!errors.isEmpty()) {
        throw new HttpError('Invalid inputs passed, please check your data', 422);
    }

    const { name, email, password } = req.body;

    const hasUser = DUMMY_USERS.find(u => u.email === email);
    if (hasUser) {
        throw new HttpError('Could not create user, email already exists', 422); //422 = invalid user input 
    }

    const createdUser = {
        id: uuid.v4(),
        name,
        email,
        password
    }

    DUMMY_USERS.push(createdUser);

    res.status(201).json({user: createdUser});

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