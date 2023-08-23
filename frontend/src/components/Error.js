import React from 'react';
import { Navigate } from 'react-router-dom';

export default function Error({ error, redirect }) {
    return (
        <>
            <h1 style={{ textAlign: 'center' }}>{error}</h1>
            {redirect &&
                setTimeout(() => {
                    return <Navigate to='/login' />;
                }, 2000)}
        </>
    );
}
