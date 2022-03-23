import React from 'react';

import './Input.css';

const Input = (props) => {
    //so we can decide from outside which element we want to enter
    // ex: if props.element equls input then we store an input element otherwise output a text area
    // if no specify of element then it must be textarea
    const element = 
        props.element === 'input' ? (
            <input id={props.id} type={props.type} placeholder={props.placeholder} />
        ) : (
            <textarea id={props.id} rows={props.rows || 3} />
        );


    return (
        <div className={`form-control`}>
            <label htmlFor={props.id}>{props.label}</label>
            {element}
        </div>
    )
};

export default Input;