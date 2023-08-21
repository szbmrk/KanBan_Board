import React, { useState } from 'react'
import axios from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import '../../styles/editprofile.css';

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
                    <div>
                        <button className="close-btn" onClick={OnClose}>
                            Close
                        </button>
                    </div>
                    <p>Are you sure you want delete your profile?</p>
                    <div className='password_confirmation'>
                        Your password:
                        <input className="input_field"
                            type="password"
                            id="password"
                            name="password"
                            value={confirmPassword}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <div className='buttons'>
                        <table className='buttons'>
                            <tbody>
                                <tr>
                                    <td>
                                        <button onClick={OnClose} className='manageButton'>Cancel</button>
                                    </td>
                                    <td>
                                        <button className='delete_button' onClick={DeleteUser}>Delete</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    {error &&
                        (<h1>Password is incorrect!</h1>)
                    }
                </div>
            </div>
        </div>
    )
}

export default DeleteProfileConfirm;
