import React, { useCallback } from 'react';

import { VALIDATOR_MINLENGTH, VALIDATOR_REQUIRE } from '../../shared/utils/validators';
import Input from '../../shared/components/FormElements/Input';
import './NewPlace.css';

const NewPlace = () => {
    const titleInputHandler = useCallback((id, value, isValid) => { 
        // without useCallback this function is a side effect in useEffect inside of input which runs every time something in Input changes, 
        // if we do anything that changes state of NewPlace then NewPlace is rerendered
        // that includes this function to be rerendered as well, because we are defining inside of the component function which = infinite loop

    }, []);
    const descriptionInputHandler = useCallback((id, value, isValid) => {}, []);

    return (
        <form className='place-form'>
            <Input
                id='title'
                element='input'
                type='text'
                label='Title'
                validators={[VALIDATOR_REQUIRE()]}
                errorText='Please enter a valid title'
                onInput={titleInputHandler}
            />
            <Input
                id='description'
                element='textarea'
                label='Description'
                validators={[VALIDATOR_MINLENGTH(5)]}
                errorText='Please enter a valid description (atleast 5 characters)'
                onInput={descriptionInputHandler}
            />
        </form>
    )
};

export default NewPlace