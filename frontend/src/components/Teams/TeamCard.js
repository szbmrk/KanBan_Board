import React, { useEffect, useState } from 'react';
import TeamManager from './TeamManager';
import '../../styles/teamcard.css';
import DeleteConfirm from './DeleteConfirm';
import AddUser from './AddUser';
import Loader from '../Loader';

const TeamCard = ({ data, deleteUserFromTeam, ChangeTeamName, AddUsers, DeleteTeam }) => {

  const [manageIsClicked, setManage] = useState(false);
  const [deleteIsClicked, setDelete] = useState(false);
  const [addIsClicked, setAdd] = useState(false);
  const [teamData, setTeamData] = useState([]);

  useEffect(() => {
    console.log(data);
  }, []);

  function ManageTeam() {
    setTeamData(data);
    setManage(!manageIsClicked);
  }

  function handleDeleteButton() {
    setDelete(!deleteIsClicked);
  }

  function handleAddButton() {
    setAdd(!addIsClicked);
  }

  return (
    <div className='content'>
      {data.team_members.length === 0 ? (<Loader />) : (
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
                      <li key={index}>{member.user.username}</li>
                    </td>
                    <td>
                      {data.created_by !== member.user.user_id &&
                        <button onClick={() => deleteUserFromTeam(data.team_id, member.user.user_id)}>
                          Remove user from team
                        </button>}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>

            <div><button id='manageButton' onClick={ManageTeam}>Change team name</button><button onClick={handleDeleteButton}>Delete Team</button><button onClick={handleAddButton}>Add Users</button></div>
          </div>
          {manageIsClicked &&
            <TeamManager teamData={teamData} onClose={ManageTeam} ChangeTeamName={ChangeTeamName} />
          }
          {
            deleteIsClicked &&
            <DeleteConfirm teamID={data.team_id} OnClose={handleDeleteButton} DeleteTeam={DeleteTeam} />
          }
          {
            addIsClicked &&
            <AddUser teamID={data.team_id} OnClose={handleAddButton} AddUsers={AddUsers} />
          }
        </div>
      )}
    </div>
  );
};

export default TeamCard;