import React, { useEffect, useState } from 'react'
import axios from '../../api/axios';
import '../../styles/editprofile.css';

export default function EditProfile() {

    useEffect(() => {
        document.title = 'Profile'
        getProfileData();
    }, []);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        newPassword: '',
        confirmPassword: '',
        oldPassword: ''
    });
    const [error, setError] = useState('');

    const getProfileData = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.get(`/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFormData({ username: response.data[0].username, email: response.data[0].email });
        } catch (err) {
            console.log(err);
        }
    }

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
                const token = sessionStorage.getItem('token');
                const response = await axios.put(`/profile`, { username: formData.username, email: formData.email, old_password: formData.oldPassword }, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log(response);
            }
            catch (err) {
                console.log(err);
            }
        else
            if (formData.newPassword !== formData.confirmPassword) {
                setError('New passwords do not match!');
            }
            else {
                try {
                    const token = sessionStorage.getItem('token');
                    const response = await axios.put(`/profile`, { username: formData.username, email: formData.email, old_password: formData.oldPassword, new_password: formData.newPassword }, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    console.log(response);
                }
                catch (err) {
                    setError(err.response.data.error);
                }
            }
    }


    return (
        <div>
            <h1>Edit your profile</h1>
            <form onSubmit={handleSubmit}>
                <table>
                    <tbody>
                        <tr>
                            <td>
                                Username
                            </td>
                            <td>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter your username"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                E-mail
                            </td>
                            <td>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter your E-mail" />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                Old password:
                            </td>
                            <td>
                                <input
                                    type="password"
                                    id="oldPassword"
                                    name="oldPassword"
                                    value={formData.oldPassword}
                                    onChange={handleChange}
                                    placeholder="Enter your old password"
                                    required
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                New password:
                            </td>
                            <td>
                                <input
                                    type="password"
                                    id="newPassword"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    placeholder="Enter your new password"
                                />
                            </td>
                        </tr>
                        <tr key="">
                            <td>
                                Confirm new password
                            </td>
                            <td>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm your new password"
                                    onPaste={handlePaste}
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
                {error !== '' &&
                    (
                        <h1>{error}</h1>
                    )
                }
                <button type='submit'>Submit</button>
            </form>
        </div>
    )
}
