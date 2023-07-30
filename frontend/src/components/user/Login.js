import React, { useContext, useEffect, useState } from 'react';
import '../../styles/login-signup.css';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import AuthContext from '../../auth/AuthContext';

const Login = () => {
    const authCtx = useContext(AuthContext);
    const [error, setError] = useState(null);
    const [display, setDisplay] = useState('none');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: val,
        }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`/user/login`, formData);
            const data = response.data;
            const token = response.data.token;

            try {
                const response = await axios.get('/user/check-login', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                if (response.data.isLoggedIn) {
                    authCtx.onLogin(data);
                }
            } catch (error) {
                console.log(error);
            }

        } catch (error) {
            setDisplay('block');
            setError(error.response.data.error);
        }
    };

    useEffect(() => {
        authCtx.onLogout();
    }, []);


    return (
        <div>
            <form className="login-form" onSubmit={handleLogin}>
                <h2>Login</h2>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        required
                    />
                </div>
                <div className="errorBox" style={{display}}>
                    <p>{error}</p>
                </div>
                <button id="loginbtn" type="submit">Login</button>
                <Link to="/signup">Don't have an account?</Link>
            </form>
        </div>
    );
};

export default Login;
