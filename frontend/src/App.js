import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/user/Login';
import Signup from './components/user/Signup';
import axios from './api/axios'

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const checkLoginStatus = async () => {
        try {
            const response = await axios.get('/api/check-login');
            if (response.data.isLoggedIn) {
                setIsLoggedIn(true);
            }
        } catch (error) {
            setIsLoggedIn(false);
        }
    };

    useEffect(() => {
        checkLoginStatus();
    }, []);


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
