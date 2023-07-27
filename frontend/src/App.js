import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/user/Login';
import Signup from './components/user/Signup';
import axios from './api/axios'
import Dashboard from './components/Dashboard';

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    function PrivateRoute({ children }) {

        return isLoggedIn ? children : <Navigate to="/login" />;
    }

    const checkLoginStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/user/check-login', {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
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
                <Route path="/dashboard" element={<PrivateRoute > <Dashboard /> </ PrivateRoute>} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
