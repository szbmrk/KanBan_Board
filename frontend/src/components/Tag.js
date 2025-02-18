import React from 'react';
import { useState, useEffect } from 'react';
import '../styles/tag.css';

const Tag = ({ name, color, extraClassName, enableClickBehavior, onClick }) => {
    const [isClicked, setIsClicked] = useState(false);

    const tagStyle = {
        backgroundColor: color,
        fontSize: isClicked ? '0.8em' : '0em',
        height: isClicked ? '25px' : '',
        padding: isClicked ? '0.2rem 0.5rem' : '0',
    };

    const handleClickOnTag = () => {
        if (enableClickBehavior) {
            setIsClicked(!isClicked);
        }
    };

    return (
        <div className={'tag ' + extraClassName} style={tagStyle} onClick={onClick} >
            <p

            /* TODO: enableClickbehavior === false ? név szerkesztése : semmi */
            >
                {name}
            </p>
        </div>
    );
};

export default Tag;
