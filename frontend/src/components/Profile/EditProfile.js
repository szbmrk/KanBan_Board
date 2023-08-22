import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import '../../styles/editprofile.css';
import DeleteConfirm from './DeleteProfileConfirm';
import Loader from '../Loader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

const deleteIcon = <FontAwesomeIcon icon={faXmark} />;

export default function EditProfile() {
    const token = sessionStorage.getItem('token');

    useEffect(() => {
        document.title = 'Profile';
        getProfileData();
    }, []);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        newPassword: '',
        confirmPassword: '',
        oldPassword: '',
    });
    const [error, setError] = useState('');
    const [deleteIsClicked, setDelete] = useState(false);
    const [profileImageUrl, setProfileImageUrl] = useState(
        'https://www.pngitem.com/pimgs/m/30-307416_profile-icon-png-image-free-download-searchpng-employee.png'
    );

    const getProfileData = async () => {
        try {
            const response = await axios.get(`/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFormData({ username: response.data[0].username, email: response.data[0].email });
        } catch (err) {
            console.log(err);
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        setFormData((prevFormData) => ({
            ...prevFormData,
            confirmPassword: '',
        }));
    };

    const handleChange = (e) => {
        setError('');
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: val,
        }));
    };

    async function handleSubmit(e) {
        e.preventDefault();
        if (formData.newPassword === '' && formData.confirmPassword === '')
            try {
                const response = await axios.put(
                    `/profile`,
                    { username: formData.username, email: formData.email, old_password: formData.oldPassword },
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                console.log(response);
            } catch (err) {
                console.log(err);
            }
        else if (formData.newPassword !== formData.confirmPassword) {
            setError('New passwords do not match!');
        } else {
            try {
                const response = await axios.put(
                    `/profile`,
                    {
                        username: formData.username,
                        email: formData.email,
                        old_password: formData.oldPassword,
                        new_password: formData.newPassword,
                    },
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                console.log(response);
            } catch (err) {
                setError(err.response.data.error);
            }
        }
    }

    const changeProfilePicture = async (e) => {};

    function handleDeleteButton() {
        setDelete(!deleteIsClicked);
    }

    function handleImageClick() {
        changeProfilePicture();
    }

    return (
        <div className='content'>
            {formData.username === '' ? (
                <Loader />
            ) : (
                <div>
                    <h1>Edit your profile</h1>
                    <form className='edit-profile-form' onSubmit={handleSubmit}>
                        <div className='profile-image-container'>
                            <img
                                className='profile-image'
                                src={profileImageUrl}
                                alt='profile'
                                onClick={handleImageClick}
                            />
                        </div>
                        <div className='form-group-edit'>
                            <label htmlFor='username'>Username</label>
                            <input
                                type='text'
                                id='username'
                                name='username'
                                value={formData.username}
                                onChange={handleChange}
                                required
                                placeholder='Enter your username'
                            />
                        </div>
                        <div className='form-group-edit'>
                            <label htmlFor='email'>E-mail</label>
                            <input
                                type='email'
                                id='email'
                                name='email'
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder='Enter your E-mail'
                            />
                        </div>
                        <div className='form-group-edit'>
                            <label htmlFor='oldPassword'>Old Password</label>
                            <input
                                type='password'
                                id='oldPassword'
                                name='oldPassword'
                                value={formData.oldPassword}
                                onChange={handleChange}
                                placeholder='Enter your old password'
                                required
                            />
                        </div>
                        <div className='form-group-edit'>
                            <label htmlFor='newPassword'>New Password</label>
                            <input
                                type='password'
                                id='newPassword'
                                name='newPassword'
                                value={formData.newPassword}
                                onChange={handleChange}
                                placeholder='Enter your new password'
                            />
                        </div>
                        <div className='form-group-edit'>
                            <label htmlFor='confirmPassword'>Confirm Password</label>
                            <input
                                type='password'
                                name='confirmPassword'
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder='Confirm your new password'
                                onPaste={handlePaste}
                            />
                        </div>
                        {error !== '' && <h1>{error}</h1>}
                        <button className='confirm-button' type='submit'>
                            Save
                        </button>
                        <span className='delete-button' onClick={handleDeleteButton} data-hover='Delete Account'>
                            {deleteIcon}
                        </span>
                    </form>

                    {deleteIsClicked && <DeleteConfirm OnClose={handleDeleteButton} />}
                </div>
            )}
        </div>
    );
}
