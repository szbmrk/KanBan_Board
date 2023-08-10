import React from 'react'
import '../../styles/popup.css'; // Import the CSS file for styling
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
          onClose();
        }
        catch (error) {
          console.log(error.response);
        }
      }

    return (
        <>
        {teamData.length !==0 ?
        ( 
        <div className="overlay">
      <div className='popup'> 
        <div className="popup-content">
          <button className="close-btn" onClick={onClose}>
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
          <button className='delete-button-popup' onClick={DeleteTeam}>Delete Team</button>
        </div>
      </div>
      </div>
    ): 
    <div className="overlay">
    <div className='popup'> 
      <div className="popup-content">
        <button className="close-btn" onClick={onClose}>
          Close
        </button>
        <table>
          <tbody>
              <tr>
                  <td>
                      Team name:
                  </td>
                  <td>
                      <input type="text" />
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
      </div>
    </div>
    </div>
}
</>
    );
  };

  export default TeamManager;
