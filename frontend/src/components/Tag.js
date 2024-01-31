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
    const [theme, setTheme] = useState(localStorage.getItem("darkMode"));
    useEffect(() => {
        //ez
        const ResetTheme = () => {
            setTheme(localStorage.getItem("darkMode"))
        }


        console.log("Darkmode: " + localStorage.getItem("darkMode"))
        window.addEventListener('ChangingTheme', ResetTheme)

        return () => {
            window.removeEventListener('ChangingTheme', ResetTheme)
        }
        //eddig
    }, []);

    return (
        <div className={'tag ' + extraClassName} style={tagStyle} onClick={onClick} data-theme={theme}>
            <p

            /* TODO: enableClickbehavior === false ? név szerkesztése : semmi */
            >
                {name}
            </p>
        </div>
    );
};

export default Tag;
