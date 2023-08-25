import React, { useState } from 'react';
import '../../styles/login-signup.css';
import axios from '../../api/axios';
import { Link, useNavigate } from 'react-router-dom';
import useAuthForm from './useAuthForm';
import AuthForm from './AuthForm';

const Signup = () => {
    const navigate = useNavigate();

    const {
        error: err,
        display,
        formData,
        handleChange,
        handleSubmit,
        handlePaste: handlePasswordPaste,
    } = useAuthForm(
        { username: '', email: '', password: '', confirmPassword: '', acceptedTerms: false },
        async (formData) => {
            if (formData.password !== formData.confirmPassword) {
                {
                    setError('Passwords do not match');
                }
            }
            await axios.post('/user/signup', formData);
            console.log('Signup successful');
            navigate('/login');
        }
    );

    const [error, setError] = useState(err);

    return (
        <AuthForm
            state='signup'
            title='Create an account'
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            handlePaste={handlePasswordPaste}
            error={error}
            display={display}
            buttonText='Sign Up'
            textToTermsAndConditions='By clicking Sign Up, you agree to our Terms, Data Policy and Cookie Policy.'
            linkText='Already have an account?'
            linkTo='/login'
        />
    );
};

export default Signup;
