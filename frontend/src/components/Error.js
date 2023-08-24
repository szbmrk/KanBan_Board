import React from 'react';
import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Error({ error, redirect }) {
    const [canBeRedirected, setCanBeRedirected] = useState(false);

    useEffect(() => {
        const onPageLoad = () => {
            setTimeout(() => {
                setCanBeRedirected(true);
            }, 2000);
        };

        document.readyState === 'complete' ? onPageLoad() : window.addEventListener('load', onPageLoad);
    }, []);

    return <>{canBeRedirected ? <Navigate to='/login' /> : <h1 style={{ textAlign: 'center' }}>{error}</h1>}</>;
}
