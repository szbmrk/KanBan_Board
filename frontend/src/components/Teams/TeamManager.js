import React from 'react'
import '../../styles/teams.css'; // Import the CSS file for styling
import axios from '../../api/axios';
import { useEffect, useState } from 'react';

const TeamManager = ({ teamData, onClose }) => {

    const [users, setUsers]=useState([]);
    const [teamName, setTeamName]=useState('');
    const [addedUsers, setAddedUsers]=useState([]);
    const[teamID, setTeamID]=useState();

    useEffect(() => {
        if(teamData.length!==0)
        {
          setTeamName(teamData.name);
          getUsers();
        }
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
            setUsers(response.data.users);
            }
            catch(error)
            {
                console.log(error.response);
            }
        
    }
    async function SubmitTeamName(e)
    {
      e.preventDefault();
      const token = sessionStorage.getItem('token');
      try {
          const response = await axios.put(`/dashboard/teams/${teamData.team_id}`, {name: teamName},
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
      onClose();
    }

    async function AddUsers()
    {
      const token = sessionStorage.getItem('token');

      try{
        const response = await axios.post(`/team/${teamID}/management`, {user_ids: addedUsers},
        {
        headers: {
          Authorization: `Bearer ${token}`,
        }
        });
      console.log(response); 
      }
      catch(error)
      {
        console.log(error.response);
      }
      window.location.reload();
    }

    async function AddTeam(e)
    {
      e.preventDefault();
      const token = sessionStorage.getItem('token');
      const user_id = sessionStorage.getItem('user_id');
      try {
          const response = await axios.post(`/dashboard/teams/`, {name: teamName},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            }
        });
          console.log(response);
          setAddedUsers(user_id);
          setTeamID(response.data.team_id);
          AddUsers();
      }
      catch (error) {
        console.log(error.response);
      }
      onClose();
    }

    const handleInputChange = (e) =>
    {
      setTeamName(e.target.value);
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
          <form onSubmit={SubmitTeamName}>
          <table>
            <tbody>
                <tr>
                    <td>
                        Team name:
                    </td>
                    <td>
                        <input type="text" value={teamName} onChange={handleInputChange}/>
                    </td>
                </tr>
            </tbody>
          </table>
          <button className='delete-button-popup' type='submit'>Apply</button>
          </form>
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
        <form onSubmit={AddTeam}>
        <table>
          <tbody>
              <tr>
                  <td>
                      Team name:
                  </td>
                  <td>
                      <input type="text" value={teamName} onChange={handleInputChange} />
                  </td>
              </tr>
          </tbody>
        </table>
        <button className='delete-button-popup' type='submit'>Apply</button>
        </form>
      </div>
    </div>
    </div>
}
</>
    );
  };

  export default TeamManager;
