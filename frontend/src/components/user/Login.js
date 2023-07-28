import React, { useState } from 'react';
import '../../styles/login-signup.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';

const Login = () => {
    const navigate = useNavigate();
    const [error, setError] = useState(null);
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
            console.log(response);
            localStorage.setItem('token', response.data.token);
            console.log('Login successful');
            navigate('/dashboard');
        } catch (error) {
            console.error('Login failed:', error.response.data.error);
            setError(error.response.data.error);
        }
    };

    return (
        <div className="background">
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
                <button type="submit">Login</button>
                <Link to="/signup">Don't have an account?</Link>
            </form>
            <h1>{error}</h1>
        </div>
    );
};

export default Login;
