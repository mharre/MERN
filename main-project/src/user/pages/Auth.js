import React, { useState, useContext } from 'react';

import { AuthContext } from '../../shared/context/auth-context';
import { useForm } from '../../shared/hooks/form-hook';
import {VALIDATOR_MINLENGTH, VALIDATOR_EMAIL, VALIDATOR_REQUIRE} from '../../shared/utils/validators';
import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import Card from '../../shared/components/UIElements/Card';
import './Auth.css';

const Auth = () => {
    const auth = useContext(AuthContext);

    const [isLoginMode, setIsLoginMode] = useState(true);

    const [formState, inputHandler, setFormData] = useForm({
        email: {
            value: '',
            isValid: false
        },
        password: {
            value: '',
            isValid: false
        }
    }, false)

    const switchModeHandler = () => {
        // need to set form data because w/o when our form switchs modes it doesn't correctly handle new one (form = confused)
        if (!isLoginMode) {
            setFormData({     // coming from signup mode and going into login mode - validity depends on email / password field because of this
                ...formState.inputs,
                name: undefined // to "drop" name field
            }, formState.inputs.email.isValid && formState.inputs.password.isValid); // checking validity of email/pw
        } else { //moving to signup mode
            setFormData({
                ...formState.inputs, // retain old inputs that might be there
                name: {
                    value: '',
                    isValid: false
                }
            }, false);
        }
        setIsLoginMode(prevMode => !prevMode); //easy way to invert
    };

    const authSubmitHandler = (event) => {
        event.preventDefault();

        console.log(formState.inputs);
        auth.login();
    };

    return (
        <Card className='authentication'>
            <h2>Login Required</h2>
            <hr />
            <form onSubmit={authSubmitHandler}>
                {!isLoginMode && (
                    <Input 
                        element='input'
                        id='name'
                        type='text'
                        label='Your Name'
                        validators={[VALIDATOR_REQUIRE()]}
                        errorText='Please enter a name'
                        onInput={inputHandler}
                    />
                )}
                <Input
                    id='email'
                    element='input'
                    type='email'
                    label='Email'
                    validators={[VALIDATOR_EMAIL()]}
                    errorText='Please enter a valid email'
                    onInput={inputHandler}
                />
                <Input
                    id='password'
                    element='input'
                    type='password'
                    label='Password'
                    validators={[VALIDATOR_MINLENGTH(5)]}
                    errorText='Please enter a valid password'
                    onInput={inputHandler}
                />
                <Button type='submit' disabled={!formState.isValid}>
                    { isLoginMode ? 'Login' : 'SignUp'}
                </Button>
            </form>
            <Button inverse onClick={switchModeHandler}>
                Switch to {isLoginMode ? 'Signup' : 'Login'}
            </Button>
        </Card>
    )
};

export default Auth;