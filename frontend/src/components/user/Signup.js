import React, { useState } from 'react';
import '../../styles/signup.css';
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
            await axios.post('/user/signup', formData);
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
                <Link to="/login">Already have an account?</Link>
                <h2>Sign Up</h2>
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
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
                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        onPaste={handlePaste}
                    />
                </div>
                <div className="form-group">
                    <label>
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
            </form>
            <h1>{error}</h1>
        </div>
    );
};

export default Signup;
