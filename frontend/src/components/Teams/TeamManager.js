import React from 'react'
import '../../styles/teammanager.css'; // Import the CSS file for styling
import axios from '../../api/axios';
import { useEffect, useState } from 'react';

const TeamManager = ({ teamData, onClose }) => {

    const [users, setUsers]=useState([]);

    useEffect(() => {
        getUsers();
      }, []);

    async function getUsers()
    {
        const token = sessionStorage.getItem('token');
        try {
            const response = await axios.get(`team/${teamData.team_id}/management/no_members`,
            {
                headers: {
                  Authorization: `Bearer ${token}`,
                }
              });
            console.log(response.data.users);
            setUsers(response.data.users);
            }
            catch(error)
            {
                console.log(error.response);
            }
    }

    async function DeleteTeam() {
        const token = sessionStorage.getItem('token');
        const user_id = sessionStorage.getItem('user_id');
        try {
          const response = await axios.delete(`/dashboard/teams/${teamData.team_id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              }
            });
          console.log(response);
        }
        catch (error) {
          console.log(error.response);
        }
      }

    return (
      <div className='popup'> 
        <div className="popup-content">
          <button className="close-button" onClick={onClose}>
            Close
          </button>
          <table>
            <tbody>
                <tr>
                    <td>
                        Team name:
                    </td>
                    <td>
                        <input type="text" value={teamData.name}/>
                    </td>
                </tr>
                <tr>
                    <td>
                        Add members:
                    </td>
                    <td>
                        <select >
                            <option disabled>Choose members</option>
                            {users.map((user) => (
                                <option value={user.user_id}>{user.username}</option>
                            ))}
                        </select>
                    </td>
                </tr>
            </tbody>
          </table>
          <p>This is the content of the pop-up.</p>
          <button className='delete-button' onClick={DeleteTeam}>Delete Team</button>
        </div>
      </div>
    );
  };

  export default TeamManager;
