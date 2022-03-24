import React, { useCallback, useReducer } from 'react';

import Button from '../../shared/components/FormElements/Button';
import { VALIDATOR_MINLENGTH, VALIDATOR_REQUIRE } from '../../shared/utils/validators';
import Input from '../../shared/components/FormElements/Input';
import './NewPlace.css';

const formReducer = (state, action) => {
    switch (action.type) {
        case 'INPUT_CHANGE':
            let formIsValid = true;
            for (const inputId in state.inputs) { //inputId is state.inputs so either title or description
               if (inputId === action.inputId) { //if the inputId equal to the action that is being updated
                   formIsValid = formIsValid && action.isValid; //checking if that specific action is valid(the input that changes) and formIsValid
               } else {
                   formIsValid = formIsValid && state.inputs[inputId].isValid; //if i am looking at input that is not currently getting updated with the action
                   // so we just atke the stored value because it is the input we are not currently updating
                   // this insures with anyone 1 false validity the overall form is set to false
               }
            }
            return {
                ...state, //copy existing state
                inputs: {
                    ...state.inputs,
                    [action.inputId]: { value: action.value, isValid: action.isValid} //changing key & setting value / validity. ex: set title: {value: action.value, isValid: action.isValid}
                },
                isValid: formIsValid
            };

        default:
            return state
    }
};

const NewPlace = () => {
    const [formState, dispatch] = useReducer(formReducer, {
        inputs: {
            title: {
                value: '',
                isValid: false
            },
            description: {
                value: '',
                isValid: false
            }
        },
        isValid: false
    });

    const inputHandler = useCallback((id, value, isValid) => { 
        // without useCallback this function is a side effect in useEffect inside of input which runs every time something in Input changes, 
        // if we do anything that changes state of NewPlace then NewPlace is rerendered
        // that includes this function to be rerendered as well, because we are defining inside of the component function which = infinite loop
        dispatch({type: 'INPUT_CHANGE', value: value, isValid: isValid, inputId: id})
    }, []);

    const placeSubmitHandler = (event) => {
        event.preventDefault();
        console.log(formState.inputs); // send to backend later
    };

    return (
        <form className='place-form' onSubmit={placeSubmitHandler}>
            <Input
                id='title'
                element='input'
                type='text'
                label='Title'
                validators={[VALIDATOR_REQUIRE()]}
                errorText='Please enter a valid title'
                onInput={inputHandler}
            />
            <Input
                id='description'
                element='textarea'
                label='Description'
                validators={[VALIDATOR_MINLENGTH(5)]}
                errorText='Please enter a valid description (atleast 5 characters)'
                onInput={inputHandler}
            />
            <Input
                id='address'
                element='input'
                label='Address'
                validators={[VALIDATOR_REQUIRE()]}
                errorText='Please enter a valid address'
                onInput={inputHandler}
            />
            <Button type='submit' disabled={!formState.isValid}>Add Place</Button>
        </form>
    )
};

export default NewPlace