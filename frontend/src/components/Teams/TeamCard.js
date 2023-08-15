import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import TeamManager from './TeamManager';
import '../../styles/teamcard.css';
import DeleteConfirm from './DeleteConfirm';
import AddUser from './AddUser';

const TeamCard = ({ data }) => {

  const [manageIsClicked, setManage] = useState(false);
  const[deleteIsClicked, setDelete]=useState(false);
  const[addIsClicked, setAdd]=useState(false);
  const [teamData, setTeamData]=useState([]);

  function ManageTeam() {
      setTeamData(data);
      setManage(!manageIsClicked);
  }

  function handleDeleteButton()
  {
      setDelete(!deleteIsClicked);
  }

  function handleAddButton()
  {
    setAdd(!addIsClicked);
  }

  async function deleteUserFromTeam(e)
  {
    const token = sessionStorage.getItem('token');
    try {
      await axios.delete(`/team/${data.team_id}/management/${e.target.id}`,
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
        
        {data.created_by === data.pivot.user_id ? <div><button id='manageButton' onClick={ManageTeam}>Change team name</button><button onClick={handleDeleteButton}>Delete Team</button><button onClick={handleAddButton}>Add Users</button></div>: <></>}
      </div>
      {manageIsClicked && 
        <TeamManager teamData={teamData} onClose={ManageTeam} />
      }
      {
        deleteIsClicked &&
        <DeleteConfirm teamID={data.team_id} OnClose={handleDeleteButton}/>
      }
      {
        addIsClicked &&
        <AddUser teamID={data.team_id} OnClose={handleAddButton}/>
      }
    </div>
  );
};

export default TeamCard;