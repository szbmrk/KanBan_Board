import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorWrapper from "./ErrorWrapper";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
        <ErrorWrapper />
    </React.StrictMode>
);