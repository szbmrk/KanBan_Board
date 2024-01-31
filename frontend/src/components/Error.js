import React from 'react';
import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Error({ error, redirect }) {
    const [canBeRedirected, setCanBeRedirected] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem("darkMode"));

    useEffect(() => {
        const onPageLoad = () => {
            setTimeout(() => {
                redirect && setCanBeRedirected(true);
            }, 2000);
        };

        document.readyState === 'complete' ? onPageLoad() : window.addEventListener('load', onPageLoad);
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
        <>
            {canBeRedirected ? (
                <Navigate to='/login' />
            ) : (
                <>
                    <div className='content col-10'>
                        <h1 style={{ textAlign: 'center' }}>{error}</h1>
                    </div>
                </>
            )}
        </>
    );
}
