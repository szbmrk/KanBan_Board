import React, { useState } from 'react';
import '../../styles/signup.css';
import '../../api/axios';
import { Link } from 'react-router-dom';

const Signup = () => {
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
            ['confirmPassword']: '',
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

    const handleSubmit = (e) => {
        e.preventDefault();
        // post a axios request to the backend
        console.log(formData);
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
        </div>
    );
};

export default Signup;
