import React from 'react';
import axios from '../../api/axios';
import { useEffect, useState } from 'react';

const AddUser = ({ teamID, OnClose, AddUsers }) => {
    const [users, SetUsers] = useState([]);
    const [usersToTeams, SetUsersToTeams] = useState([]);

    useEffect(() => {
        getUsers();
    }, []);

    function handleAddUsers(usersToTeams, teamID) {
        AddUsers(usersToTeams, teamID);
        OnClose();
    }

    async function getUsers() {
        const token = sessionStorage.getItem('token');
        try {
            const response = await axios.get(`team/${teamID}/management/no_members`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            SetUsers(response.data.users);
        } catch (error) {
            console.log(error.response);
        }
    }

    function AddUser(user_id) {
        SetUsersToTeams((prevUsers) => [...prevUsers, user_id]);
        console.log(user_id);
    }

    return (
        <div className='overlay'>
            <div className='popup'>
                <div className='popup-content'>
                    <button className='close-btn' onClick={OnClose}>
                        Close
                    </button>
                    <p>Are you sure you want delete this team?</p>
                    <table>
                        <tbody>
                            {users.map((user) => (
                                <tr>
                                    <td onClick={() => AddUser(user.user_id)}>{user.username}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button onClick={() => handleAddUsers(usersToTeams, teamID)}>Add Users</button>
                </div>
            </div>
        </div>
    );
};

export default AddUser;
