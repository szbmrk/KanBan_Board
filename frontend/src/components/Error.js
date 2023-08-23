import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function Error({ error, redirect }) {
    const navigate = useNavigate();

    return <>{redirect && <h1 style={{ textAlign: 'center' }}>{error}</h1>}</>;
}
