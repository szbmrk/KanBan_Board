import React, { useState, useEffect } from 'react';
import '../styles/BasicAutocomplete.css';

const BasicAutocomplete = ({ placeholder, selectedValue, setSelectedValue, behaviourOptions, setBehaviourOptions }) => {
    const [value, setValue] = useState(selectedValue);
    const [suggestions, setSuggestions] = useState([]);
    const [visibility, setVisibility] = useState(['hidden']);

    const handleInputChange = (e) => {
        const inputValue = e.target.value;
        setValue(inputValue);
        setSelectedValue(inputValue);

        // Filter the items based on input value
        const filteredSuggestions = behaviourOptions.filter((item) =>
            item.toLowerCase().includes(inputValue.toLowerCase())
        );
        setSuggestions(filteredSuggestions);
        setVisibility(['visible']);
    };

    const handleSuggestionClick = (suggestion) => {
        setValue(suggestion);
        setSelectedValue(suggestion);
        setSuggestions([]);
    };

    return (
        <div >
            <input type='text' value={value} onChange={handleInputChange} placeholder={placeholder} />
            <ul
                className='suggestions-list'
                style={{
                    visibility: visibility,
                }}
            >
                {suggestions.map((suggestion, index) => (
                    <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
                        {suggestion}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BasicAutocomplete;
