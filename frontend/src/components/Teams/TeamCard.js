import React, { useState } from 'react';
import axios from '../../api/axios';
import TeamManager from './TeamManager';
import '../../styles/teamcard.css';

const TeamCard = ({ data }) => {

  const [manageIsClicked, setManage] = useState(false);
  const [teamData, setTeamData]=useState([]);

  async function ManageTeam() {
      setTeamData(data);
      setManage(!manageIsClicked);
  }
  async function deleteUserFromTeam(e)
  {
    const token = sessionStorage.getItem('token');
    try {
      const response = await axios.delete(`/team/${data.team_id}/management/${e.target.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
    }
    catch (error) {
      console.log(error.response);
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2>{data.name}</h2>
        <p>Created by User {data.created_by}</p>
      </div>
      <div className="card-content">
        <p>Created at: {data.created_at}</p>
        <p>Team ID: {data.team_id}</p>
        <p>Parent Team ID: {data.parent_team_id !== null ? data.parent_team_id : 'None'}</p>
        <h3>Team Members:</h3>
        
        <table>
          <tbody>
          {data.team_members.map((member, index) => (

                <tr>
                  <td>
                    <li key={index}>User {member.user_id}</li>
                  </td>
                  <td>
                    {data.created_by!==member.user_id && 
                    <button id={member.user_id} onClick={deleteUserFromTeam}>
                        Remove user from team
                    </button>}
                  </td>
                </tr>
              ))}
              </tbody>
              </table>
        
        {data.created_by === data.pivot.user_id ? <button id='manageButton' onClick={ManageTeam}>Manage team</button> : <></>}
      </div>
      {manageIsClicked && 
        <TeamManager teamData={teamData} onClose={ManageTeam} />
      }
    </div>
  );
};

export default TeamCard;