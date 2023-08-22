import React, { useEffect, useState } from 'react';
import TeamManager from './TeamManager';
import '../../styles/teamcard.css';
import DeleteConfirm from './DeleteConfirm';
import AddUser from './AddUser';
import Loader from '../Loader';
import RolesManager from './RolesManager';

const TeamCard = ({ data, deleteUserFromTeam, ChangeTeamName, AddUsers, DeleteTeam, ownPermissions, teamPermissions }) => {
  const [manageIsClicked, setManage] = useState(false);
  const [deleteIsClicked, setDelete] = useState(false);
  const [addIsClicked, setAdd] = useState(false);
  const [rolesIsClicked, setRoles] = useState(false);
  const [teamData, setTeamData] = useState([]);
  const [createdBy, setCreatedBy] = useState('');

  useEffect(() => {
    document.title = 'Teams';
    console.log(data);
    for (let i = 0; i < data.team_members.length; i++) {
      if (data.team_members[i].user_id === data.created_by) {
        setCreatedBy(data.team_members[i].user.username);
        break;
      }
    }
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
  function handleRolesButton(){
    setRoles(!rolesIsClicked);
  }

  const checkPermissonToManageTeam = (team_id) => {
    //TODO Refactor
    console.log(teamPermissions);
    if (ownPermissions.includes('system_admin')) {
      return true;
    }
    if (teamPermissions.length === 0) {
      return false;
    }
    for (let i = 0; i < teamPermissions.length; i++) {
      if (teamPermissions[i].team_id === team_id) {
        if (teamPermissions[i].permission === 'team_management') {
          return true;
        }
      }
    }
  }

  const checkPermissonToManageTeamMembers = (team_id) => {
    //TODO Refactor
    console.log(teamPermissions);
    if (ownPermissions.includes('system_admin')) {
      return true;
    }
    if (teamPermissions.length === 0) {
      return false;
    }
    for (let i = 0; i < teamPermissions.length; i++) {
      if (teamPermissions[i].team_id === team_id) {
        if (teamPermissions[i].permission === 'team_member_management') {
          return true;
        }
      }
    }
  }

  return (
    <div className='content'>
      {data.team_members.length === 0 ? (<Loader />) : (
        <div className="card">
          <div className="card-header">
            <h2>{data.name}</h2>
          </div>
          <div className="card-content">
            <h3>Created by: {createdBy}</h3>
            <p>Created at: {data.created_at}</p>
            <h3>Team Members:</h3>
            <table>
              <tbody>
                {data.team_members.map((member, index) => (

                  <tr>
                    <td>
                      <h3 key={index}>{member.user.username}</h3>
                    </td>
                    <td>
                      {data.created_by !== member.user.user_id && checkPermissonToManageTeamMembers(data.team_id) &&
                        (
                          < button className='delete_button' onClick={() => deleteUserFromTeam(data.team_id, member.user.user_id)}>
                            Remove user from team
                          </button>)}
                    </td>
                    <td>
                      {data.created_by !== member.user.user_id && (checkPermissonToManageTeamMembers(data.team_id) || checkPermissonToManageTeam(data.team_id)) &&
                        (
                          <button onClick={handleRolesButton}>
                            Manage roles
                          </button>
                        )
                      }
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>

            <div>
              {checkPermissonToManageTeam(data.team_id) &&
                (
                  <div>
                    <button className='manageButton' onClick={ManageTeam}>
                      Change team name
                    </button>
                    <button className='delete_button' onClick={handleDeleteButton}>
                      Delete Team
                    </button>
                  </div>
                )
              }
              {checkPermissonToManageTeamMembers(data.team_id) &&
                <button className='manageButton' onClick={handleAddButton}>
                  Add Users
                </button>
              }
            </div>
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
          {
            rolesIsClicked &&
              <RolesManager OnClose={handleRolesButton} team_id={data.team_id}/>
          }
        </div>
      )
      }
    </div >
  );
};

export default TeamCard;