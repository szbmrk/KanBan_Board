import React, { useState } from 'react';
import '../../styles/signup.css';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();

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

    const handleSubmit = (e) => {
        e.preventDefault();
        // backend
        console.log(formData);
        navigate('/dashboard');
    };

    return (
        <form className="login-form" onSubmit={handleSubmit}>
            <Link to="/signup">Don't have an account?</Link>
            <h2>Login</h2>
            <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
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
                    required
                />
            </div>
            <button type="submit">Login</button>
        </form>
    );
};

export default Login;
