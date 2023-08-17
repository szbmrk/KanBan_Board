import React, { useState } from 'react'
import axios from '../../api/axios';
import { useNavigate } from 'react-router-dom';

const DeleteProfileConfirm = ({ OnClose }) => {
    const [confirmPassword, setPassword] = useState('');
    const [error, setError] = useState(false);
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
            setError(true);
        }
    }

    function handleChange(e) {
        setError(false);
        setPassword(e.target.value);
    }

    return (
        <div className="overlay">
            <div className='popup'>
                <div className="popup-content">
                    <button className="close-btn" onClick={OnClose}>
                        Close
                    </button>
                    <p>Are you sure you want delete your profile?</p>
                    Your password:
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={confirmPassword}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        required
                    />
                    <table>
                        <tbody>
                            <tr>
                                <td>
                                    <button onClick={OnClose}>Cancel</button>
                                </td>
                                <td>
                                    <button className='delete-button-popup' onClick={DeleteUser}>Delete</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    {error &&
                        (<h1>Password is incorrect!</h1>)
                    }
                </div>
            </div>
        </div>
    )
}

export default DeleteProfileConfirm;
