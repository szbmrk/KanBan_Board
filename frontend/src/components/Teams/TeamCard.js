import React, { useEffect, useState } from 'react';
import TeamManager from './TeamManager';
import '../../styles/teamcard.css';
import DeleteConfirm from './DeleteConfirm';
import AddUser from './AddUser';
import Loader from '../Loader';
import RolesManager from './RolesManager';
import axios from '../../api/axios';
import { dateFormatOptions } from '../../utils/DateFormat';

const TeamCard = ({
    data,
    deleteUserFromTeam,
    ChangeTeamName,
    AddUsers,
    DeleteTeam,
    ownPermissions,
    teamPermissions,
    handleDeleteRole,
    AddRoleToUser,
}) => {
    const [manageIsClicked, setManage] = useState(false);
    const [deleteIsClicked, setDelete] = useState(false);
    const [addIsClicked, setAdd] = useState(false);
    const [rolesIsClicked, setRoles] = useState(false);
    const [teamData, setTeamData] = useState([]);
    const [createdBy, setCreatedBy] = useState('');
    const [teamMemberId, setTeamMemberId] = useState();
    const user_id = parseInt(sessionStorage.getItem('user_id'));

    useEffect(() => {
        document.title = 'Teams';
        console.log(data.team_members);
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
    function handleRolesButton(team_members_id) {
        setTeamMemberId(team_members_id);
        setRoles(!rolesIsClicked);
    }

    const checkPermissonToManageTeam = (team_id) => {
        //TODO Refactor
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
    };

    const checkPermissonToManageTeamMembers = (team_id) => {
        //TODO Refactor
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
    };

    const checkPermissionToDeleteRoles = (role) => {
        console.log(role);
        for (let i = 0; i < role.permissions.length; i++) {
            if (role.permissions[i].name === 'team_member_management' || role.permissions[i].name === 'system_admin') {
                return false;
            }
        }
        return true;
    };

    return (
        data.team_members.length === 0 ? (
            <Loader />
        ) : (
            <div className='teamcard'>
                <div className='teamcard-header'>
                    <h2>{data.name}</h2>
                    <div className='teamcard-subheader'>
                        <p>Created by: {createdBy}</p>
                        <p>Created at: {new Date(data.created_at).toLocaleString('en-US', dateFormatOptions)}</p>
                    </div>
                </div>
                <div className='teamcard-body'>
                    <div className='team-members'>
                    {data.team_members.map((member) => (
                        <div className='team-member-card'>
                            <div className='team-member-image-container'>
                                <img
                                    className='team-member-image'
                                    src={member.user.user_image} //ha null, akkor default kép
                                    alt='profile'
                                />
                            </div>
                            <div className='team-member-card-body'>
                                <p>{member.user.username}</p>
                                <p>{member.user.email}</p>
                            </div>
                        </div>
                    ))}
                        <table>
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>Role</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.team_members.map((member) => (
                                    <tr key={member.user.user_id}>
                                        <td>
                                            <h3>{member.user.username}</h3>
                                        </td>
                                        <td>
                                        {member.roles.length !== 0 ? (
                                                member.roles.map((role) => (
                                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }} key={role.team_members_role_id}>
                                                        <p>
                                                            {role.board_id !== null ? role.name + " in " + role.board.name : role.name}
                                                        </p>
                                                        {checkPermissonToManageTeam(data.team_id) && (
                                                            <div>
                                                                {checkPermissionToDeleteRoles(role) && (
                                                                    <button
                                                                        className='delete_button'
                                                                        onClick={() => handleDeleteRole(role.team_members_role_id, role.board_id, data.team_id, member.user.user_id)}
                                                                    >
                                                                        Delete role
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))) : (
                                                <p>No roles</p>
                                            )}
                                        </td>
                                        <td>
                                            {checkPermissonToManageTeamMembers(data.team_id) && (
                                                <div className='teamcard-actions'>
                                                    {parseInt(member.user.user_id) !== user_id && (
                                                        <button
                                                            className='delete_button'
                                                            onClick={() => deleteUserFromTeam(data.team_id, member.user.user_id)}
                                                        >
                                                            Remove user from team
                                                        </button>
                                                    )}
                                                    {checkPermissonToManageTeam(data.team_id) && (
                                                        <button className='manageButton' onClick={() => handleRolesButton(member.team_members_id)}>
                                                            Add role
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                <div>
                    {checkPermissonToManageTeam(data.team_id) && (
                        <div>
                            <button className='manageButton' onClick={ManageTeam}>
                                Change team name
                            </button>
                            <button className='delete_button' onClick={handleDeleteButton}>
                                Delete Team
                            </button>
                        </div>
                    )}
                    {checkPermissonToManageTeamMembers(data.team_id) && (
                        <button className='manageButton' onClick={handleAddButton}>
                            Add Users
                        </button>
                    )}
                </div>
            </div>
            {manageIsClicked && (
                <TeamManager teamData={teamData} onClose={ManageTeam} ChangeTeamName={ChangeTeamName} />
            )}
            {deleteIsClicked && (
                <DeleteConfirm teamID={data.team_id} OnClose={handleDeleteButton} DeleteTeam={DeleteTeam} />
            )}
            {addIsClicked && <AddUser teamID={data.team_id} OnClose={handleAddButton} AddUsers={AddUsers} />}
            {rolesIsClicked && (
                <RolesManager
                    OnClose={handleRolesButton}
                    team_id={data.team_id}
                    team_member_id={teamMemberId}
                    AddRoleToUser={AddRoleToUser}
                />
            )}
        </div>
    );
};
export default TeamCard;
