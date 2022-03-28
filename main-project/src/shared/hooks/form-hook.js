import { useCallback, useReducer } from 'react';

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
export const useForm = (initialInputs, initialFormValidity) => {
    const [formState, dispatch] = useReducer(formReducer, {
        inputs: initialInputs,
        isValid: initialFormValidity
    });

    const inputHandler = useCallback((id, value, isValid) => { 
        // without useCallback this function is a side effect in useEffect inside of input which runs every time something in Input changes, 
        // if we do anything that changes state of NewPlace then NewPlace is rerendered
        // that includes this function to be rerendered as well, because we are defining inside of the component function which = infinite loop
        dispatch({type: 'INPUT_CHANGE', value: value, isValid: isValid, inputId: id})
    }, []);

    return [formState, inputHandler]
};