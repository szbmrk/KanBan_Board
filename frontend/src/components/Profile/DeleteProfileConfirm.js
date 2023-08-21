import React, { useState } from 'react';
import axios from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import '../../styles/editprofile.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

const closeIcon = <FontAwesomeIcon icon={faXmark} />;

const DeleteProfileConfirm = ({ OnClose }) => {
    const [confirmPassword, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [display, setDisplay] = useState('none');

    const navigate = useNavigate();

    async function DeleteUser() {
        try {
            const token = sessionStorage.getItem('token');
            await axios.delete('/profile', {
                data: {
                    password: confirmPassword,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            navigate('/login');
        } catch (error) {
            setDisplay('block');
            setError('Invalid password');
            setTimeout(() => {
                setDisplay('none');
            }, 8000);
        }
    }

    function handleChange(e) {
        setError(false);
        setPassword(e.target.value);
    }

    return (
        <div className='overlay'>
            <div className='popup popup-mini'>
                <span className='close-btn' onClick={OnClose}>
                    {closeIcon}
                </span>
                <p className='confirmation-text'>Are you sure you want delete your profile?</p>
                <div className='password-confirmation'>
                    <input
                        className='input_field'
                        type='password'
                        id='password'
                        name='password'
                        value={confirmPassword}
                        onChange={handleChange}
                        placeholder='Enter your password'
                        required
                    />
                </div>
                {error !== '' && (
                    <div className='errorBox' style={{ display }}>
                        <p>{error}</p>
                    </div>
                )}
                <div className='button-container'>
                    <button onClick={OnClose} className='manageButton'>
                        Cancel
                    </button>
                    <button className='delete_button' onClick={DeleteUser}>
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteProfileConfirm;
