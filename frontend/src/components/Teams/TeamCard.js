import React, { useEffect, useState } from 'react';
import TeamManager from './TeamManager';
import '../../styles/teamcard.css';
import DeleteConfirm from './DeleteConfirm';
import AddUser from './AddUser';
import Loader from '../Loader';
import RolesManager from './RolesManager';
import axios from '../../api/axios';
import { dateFormatOptions } from '../../utils/DateFormat';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEllipsis, faPencil, faUserPlus } from '@fortawesome/free-solid-svg-icons';

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
    const trashIcon = <FontAwesomeIcon icon={faTrash} />;
    const dotsIcon = <FontAwesomeIcon icon={faEllipsis} />;
    const pencilIcon = <FontAwesomeIcon icon={faPencil} />;
    const addUserIcon = <FontAwesomeIcon icon={faUserPlus} />;

    const [isHoveredEdit, setIsHoveredEdit] = useState(false);
    const [isHoveredAddUser, setIsHoveredAddUser] = useState(false);
    const [isHoveredDelete, setIsHoveredDelete] = useState(false);
    const [teamZIndex, setTeamZIndex] = useState(1);
    const [manageIsClicked, setManage] = useState(false);
    const [deleteIsClicked, setDelete] = useState(false);
    const [addIsClicked, setAdd] = useState(false);
    const [rolesIsClicked, setRoles] = useState(false);
    const [teamData, setTeamData] = useState([]);
    const [createdBy, setCreatedBy] = useState('');
    const [teamMemberId, setTeamMemberId] = useState();
    const user_id = parseInt(sessionStorage.getItem('user_id'));
    const [hoveredTeam, setHoveredTeam] = useState(null);
    const [showIconContainer, setShowIconContainer] = useState(false);
    const [iconContainerPosition, setIconContainerPosition] = useState({ x: 0, y: 0 });
    const [profileImageUrl, setProfileImageUrl] = useState(
        'https://www.pngitem.com/pimgs/m/30-307416_profile-icon-png-image-free-download-searchpng-employee.png'
    );

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
        setIsHoveredEdit(false);
    }

    function handleDeleteButton() {
        setDelete(!deleteIsClicked);
        setIsHoveredDelete(false);
    }

    function handleAddButton() {
        setAdd(!addIsClicked);
        setIsHoveredAddUser(false);
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

    const handleMouseEnterOnTeam = (teamId) => {
        setHoveredTeam(teamId);
    };

    const handleMouseLeaveOnTeam = () => {
        setHoveredTeam(null);
    };

    const handleDotsClick = (event, teamID) => {
        const buttonRect = event.target.getBoundingClientRect();
        const newX = buttonRect.right + 20;
        const newY = buttonRect.top;

        // Set the icon-container's position and show it
        setIconContainerPosition({ x: newX, y: newY });
        setShowIconContainer(!showIconContainer);

        teamZIndex === 1 ? setTeamZIndex(100) : setTeamZIndex(1);
    };

    return data.team_members.length === 0 ? (
        <Loader />
    ) : (
        <div className='teamcard'>
            <div
                className='teamcard-header'
                onMouseEnter={() => handleMouseEnterOnTeam(data.team_id)}
                onMouseLeave={handleMouseLeaveOnTeam}
            >
                <div
                    className='team-name-container'
                    style={{
                        zIndex: teamZIndex,
                    }}
                >
                    <h2>{data.name}</h2>
                </div>
                <span
                    className='dots'
                    onClick={(e) => handleDotsClick(e, data.team_id)}
                    style={{
                        visibility: hoveredTeam === data.team_id ? 'visible' : 'hidden',
                        transition: 'visibility 0.1s ease',
                    }}
                >
                    {dotsIcon}
                </span>
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
                                    src={member.user.user_image ? member.user.user_image : profileImageUrl}
                                    alt='profile'
                                />
                            </div>
                            <p>{member.user.username}</p>
                            <div className='team-member-card-body'>
                                <div className='team-member-card-body-data'>
                                    <div className='data'>
                                        <p>Name: </p>
                                        <p>
                                            {member.user.first_name} {member.user.last_name}
                                        </p>
                                    </div>
                                    <div className='data'>
                                        <p>Birth date: </p>
                                        <p>{member.user.birth_date}</p>
                                    </div>
                                    <div className='data'>
                                        <p>Address: </p>
                                        <p>{member.user.address}</p>
                                    </div>
                                    <div className='data'>
                                        <p>Email: </p>
                                        <p>{member.user.email}</p>
                                    </div>
                                    <div className='data'>
                                        <p>Phone number: </p>
                                        <p>{member.user.phone_number}</p>
                                    </div>
                                </div>
                                <div className='team-member-card-body-roles-container'>
                                    <p>Roles:</p>
                                    <div className='team-member-card-body-roles'>
                                        {member.roles.length !== 0 ? (
                                            member.roles.map((role) => (
                                                <ul className='role' key={role.team_members_role_id}>
                                                    <li>
                                                        {role.board_id !== null
                                                            ? role.name + ' in ' + role.board.name
                                                            : role.name}
                                                    </li>
                                                    {checkPermissonToManageTeam(data.team_id) && (
                                                        <div>
                                                            {checkPermissionToDeleteRoles(role) && (
                                                                <span
                                                                    className='trash-icon'
                                                                    onClick={() =>
                                                                        handleDeleteRole(
                                                                            role.team_members_role_id,
                                                                            role.board_id,
                                                                            data.team_id,
                                                                            member.user.user_id
                                                                        )
                                                                    }
                                                                    data-hover='Delete role'
                                                                >
                                                                    {trashIcon}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </ul>
                                            ))
                                        ) : (
                                            <p>No roles</p>
                                        )}
                                    </div>
                                </div>
                                <div className='team-member-card-body-actions-container'>
                                    {checkPermissonToManageTeamMembers(data.team_id) && (
                                        <div className='teamcard-actions'>
                                            {parseInt(member.user.user_id) !== user_id && (
                                                <button
                                                    className='delete-button'
                                                    onClick={() =>
                                                        deleteUserFromTeam(data.team_id, member.user.user_id)
                                                    }
                                                >
                                                    Remove user
                                                </button>
                                            )}
                                            {checkPermissonToManageTeam(data.team_id) && (
                                                <button
                                                    className='add-button'
                                                    onClick={() => handleRolesButton(member.team_members_id)}
                                                >
                                                    Add role
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {showIconContainer && (
                    <div
                        className='overlay darken'
                        onClick={() => {
                            setShowIconContainer(false);
                            setTeamZIndex(1);
                        }}
                    >
                        <div
                            className='icon-container'
                            style={{
                                position: 'fixed',
                                left: iconContainerPosition.x + 'px',
                                top: iconContainerPosition.y + 'px',
                            }}
                        >
                            <div
                                className='option'
                                onMouseEnter={() => setIsHoveredEdit(true)}
                                onMouseLeave={() => setIsHoveredEdit(false)}
                                onClick={ManageTeam}
                            >
                                {checkPermissonToManageTeam(data.team_id) && (
                                    <>
                                        <span
                                            className='edit-button'
                                            style={{
                                                animation: isHoveredEdit ? 'rotate 0.5s' : 'none',
                                            }}
                                        >
                                            {pencilIcon}
                                        </span>
                                        <p>Edit Name</p>
                                    </>
                                )}
                            </div>
                            <div
                                className='option'
                                onMouseEnter={() => setIsHoveredAddUser(true)}
                                onMouseLeave={() => setIsHoveredAddUser(false)}
                                onClick={handleAddButton}
                            >
                                <span
                                    className='add-user-button'
                                    style={{
                                        color: isHoveredAddUser ? 'var(--light-blue)' : '',
                                    }}
                                >
                                    {addUserIcon}
                                </span>
                                <p>Add Users</p>
                            </div>
                            <div
                                className='option'
                                onMouseEnter={() => setIsHoveredDelete(true)}
                                onMouseLeave={() => setIsHoveredDelete(false)}
                                onClick={handleDeleteButton}
                            >
                                {checkPermissonToManageTeam(data.team_id) && (
                                    <>
                                        <span
                                            className='delete-task-button'
                                            style={{ color: isHoveredDelete ? 'var(--important)' : '' }}
                                        >
                                            {trashIcon}
                                        </span>
                                        <p>Delete</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
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
