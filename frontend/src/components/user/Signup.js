import React, { useState } from 'react';
import '../../styles/login-signup.css';
import axios from '../../api/axios';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        acceptedTerms: false,
    });

    const handlePaste = (e) => {
        e.preventDefault();
        setFormData((prevFormData) => ({
            ...prevFormData,
            confirmPassword: '',
        }));
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: val,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setFormData((prevFormData) => ({
                ...prevFormData,
                password: '',
                confirmPassword: '',
            }));
            setError('Passwords do not match');
            return;
        }
        try {
            const response = await axios.post('/user/signup', formData);
            console.log(response);
            console.log('Signup successful');
            navigate('/login')
        }
        catch (error) {
            console.error('Signup failed:', error.response.data.error);
            setError(error.response.data.error);
        }

    };

    return (
        <div className="background">
            <form className="signup-form" onSubmit={handleSubmit}>
                <h2>Sign Up</h2>
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Enter your username"
                        required
                    />
                </div>
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
                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Enter your password again"
                        required
                        onPaste={handlePaste}
                    />
                </div>
                <div className="form-group">
                    <label id="checkbox">
                        <input
                            type="checkbox"
                            name="acceptedTerms"
                            checked={formData.acceptedTerms}
                            onChange={handleChange}
                            required
                        />{' '}
                        I accept the terms and conditions
                    </label>
                </div>
                <button type="submit">Sign Up</button>
                <Link to="/login">Already have an account?</Link>
            </form>
            <h1>{error}</h1>
        </div>
    );
};

export default Signup;
