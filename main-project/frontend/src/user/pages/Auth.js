import React, { useState, useContext } from 'react';

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
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState();

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

        setIsLoading(true);

        if (isLoginMode) {
            try {
                const response = await fetch('http://localhost:5000/api/users/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify({
                        email: formState.inputs.email.value,
                        password: formState.inputs.password.value, 
                    })
                });

                const responseData = await response.json(); 
                if (!response.ok) {
                    throw new Error(responseData.message); 
                }
                //console.log(responseData)

                setIsLoading(false);
                auth.login(); 
            } catch (err) {
                console.log(err);

                setIsLoading(false);
                setError(err.message || 'Something went wrong, please try again');
            }

        } else {
            try {
                const response = await fetch('http://localhost:5000/api/users/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json' // so our BE knows it's JSON data incoming
                    },
                    body: JSON.stringify({
                        name: formState.inputs.name.value,
                        email: formState.inputs.email.value,
                        password: formState.inputs.password.value, //these are the fields we are expecting on the BE
                    })
                });

                const responseData = await response.json(); // our BE sends back the created user
                if (!response.ok) {
                    throw new Error(responseData.message); // since we throw error here we will make it into catch block, fetch works that even if 400/500 still technically no "error"
                }
                //console.log(responseData)

                setIsLoading(false);
                auth.login(); // only runs after our response 
            } catch (err) {
                console.log(err);

                setIsLoading(false);
                setError(err.message || 'Something went wrong, please try again');
            }
        }
    };

    const errorHandler = () => {
        setError(null);
    };

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={errorHandler} />
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
        </React.Fragment>
    )
};

export default Auth;