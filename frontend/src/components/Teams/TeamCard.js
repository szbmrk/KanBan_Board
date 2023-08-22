import React, { useEffect, useState } from 'react';
import TeamManager from './TeamManager';
import '../../styles/teamcard.css';
import DeleteConfirm from './DeleteConfirm';
import AddUser from './AddUser';
import Loader from '../Loader';

const TeamCard = ({ data, deleteUserFromTeam, ChangeTeamName, AddUsers, DeleteTeam }) => {
    const user_id = parseInt(sessionStorage.getItem('user_id'));
    const team_member = JSON.parse(sessionStorage.getItem('permissions'));
    const ownPermissions = team_member.teams
        .filter((team) => team.team_id === data.team_id)
        .map((permission) => permission.permission_data);

    const [manageIsClicked, setManage] = useState(false);
    const [deleteIsClicked, setDelete] = useState(false);
    const [addIsClicked, setAdd] = useState(false);
    const [teamData, setTeamData] = useState([]);
    const [createdBy, setCreatedBy] = useState('');

    useEffect(() => {
        document.title = 'Teams';
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

    return (
        <>
            {data.team_members.length === 0 ? (
                <Loader />
            ) : (
                <div className='teamcard'>
                    <div className='teamcard-header'>
                        <h2>{data.name}</h2>
                        <div className='teamcard-subheader'>
                            <p>Created by: {createdBy}</p>
                            <p>Created at: {data.created_at}</p>
                        </div>
                    </div>
                    <div className='teamcard-body'>
                        <h3>Team Members:</h3>
                        <div className='team-members'>
                            {data.team_members.map((member, index) => (
                                <>
                                    <h3 key={index}>{member.user.username}</h3>
                                    <div className='teamcard-actions'>
                                        {data.created_by !== member.user.user_id &&
                                            ownPermissions.some((permission) => permission.id === 4) && (
                                                <button
                                                    className='delete_button'
                                                    onClick={() =>
                                                        deleteUserFromTeam(data.team_id, member.user.user_id)
                                                    }
                                                >
                                                    Remove user from team
                                                </button>
                                            )}
                                    </div>
                                </>
                            ))}
                        </div>

                        <div>
                            {ownPermissions.some((permission) => permission.id === 3) && (
                                <div>
                                    <button className='manageButton' onClick={ManageTeam}>
                                        Change team name
                                    </button>
                                    <button className='delete_button' onClick={handleDeleteButton}>
                                        Delete Team
                                    </button>
                                </div>
                            )}
                            {ownPermissions.some((permission) => permission.id === 4) && (
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
                </div>
            )}
        </>
    );
};

export default TeamCard;
