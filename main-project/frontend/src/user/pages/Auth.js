import React, { useState, useContext } from 'react';

import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';
import { useForm } from '../../shared/hooks/form-hook';
import {VALIDATOR_MINLENGTH, VALIDATOR_EMAIL, VALIDATOR_REQUIRE} from '../../shared/utils/validators';
import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import Card from '../../shared/components/UIElements/Card';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import './Auth.css';

const Auth = () => {
    const auth = useContext(AuthContext);

    const [isLoginMode, setIsLoginMode] = useState(true);
    const {isLoading, error, sendRequest, clearError } = useHttpClient();

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

    const authSubmitHandler = async (event) => {
        event.preventDefault();

        if (isLoginMode) {
            try {
                const responseData = await sendRequest( 
                    'http://localhost:5000/api/users/login',
                    'POST',
                    JSON.stringify({
                        email: formState.inputs.email.value,
                        password: formState.inputs.password.value, 
                    }),
                    {
                        'Content-Type': 'application/json' 
                    }, 
                );
                auth.login(responseData.user.id); // on the BE, user key in the object and it's id
            } catch (err) {} //we can leave this empty for this specific request because we are handling everything inside of our custom hook
        } else {
            try {
                const responseData = await sendRequest(
                    'http://localhost:5000/api/users/signup',
                    'POST',
                    JSON.stringify({
                        name: formState.inputs.name.value,
                        email: formState.inputs.email.value,
                        password: formState.inputs.password.value, //these are the fields we are expecting on the BE
                    }),
                    {
                        'Content-Type': 'application/json' // so our BE knows it's JSON data incoming
                    },
                );
                auth.login(responseData.user.id); 
            } catch (err) {} // leave blank same as above
        }
    };

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError} />
            <Card className='authentication'>
                {isLoading && <LoadingSpinner asOverlay /> }
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
                        validators={[VALIDATOR_MINLENGTH(6)]}
                        errorText='Please enter a valid password, must be at least 6 characters long'
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
        </React.Fragment>
    )
};

export default Auth;