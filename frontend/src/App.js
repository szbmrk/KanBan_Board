import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/user/Login';
import Signup from './components/user/Signup';

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
