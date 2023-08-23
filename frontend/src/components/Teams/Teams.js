import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import TeamCard from './TeamCard';
import TeamManager from './TeamManager';
import Loader from '../Loader';
import Error from '../Error';
import { SetRoles } from '../../roles/Roles';

const Teams = () => {
    const token = sessionStorage.getItem('token');
    const user_id = sessionStorage.getItem('user_id');
    const [ownPermissions, setOwnPermissions] = useState([]);
    const [teamPermissions, setTeamPermissions] = useState([]);
    const [redirect, setRedirect] = useState(false);
    const [error, setError] = useState(false);

    const [teams, setTeams] = useState([]);
    const [manageIsClicked, setManage] = useState(false);

    useEffect(() => {
        document.title = 'Teams';
        getTeams();
    }, []);

    useEffect(() => {
        ResetRoles();
    }, [teams]);

    async function ResetRoles() {
        await SetRoles(token);
        setTeamPermissions(JSON.parse(sessionStorage.getItem('permissions')).teams);
        setOwnPermissions(JSON.parse(sessionStorage.getItem('permissions')).general_role);
    }

    function addTeam() {
        setManage(!manageIsClicked);
    }

    async function DeleteTeam(teamId) {
        try {
            await axios.delete(`/dashboard/teams/${teamId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log(teamId);
            const newTeamData = teams.filter((team) => team.team_id !== teamId);
            setTeams(newTeamData);
        } catch (e) {
            console.log(e.response);
            if (e.response.status === 401 || e.response.status === 500) {
                setError('You are not logged in! Redirecting to login page...');
                setRedirect(true);
            } else {
                setError(e.message);
            }
        }
    }

    async function AddUsers(user_ids, team_id) {
        try {
            const response = await axios.post(
                `/team/${team_id}/management`,
                { user_ids: user_ids },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const newTeamData = teams.map((team) => {
                if (team.team_id === team_id) {
                    team.team_members = [...team.team_members, ...response.data.added_members];
                }
                return team;
            });
            setTeams(newTeamData);
            console.log(response.data.added_members);
        } catch (e) {
            console.log(e.response);
            if (e.response.status === 401 || e.response.status === 500) {
                setError('You are not logged in! Redirecting to login page...');
                setRedirect(true);
            } else {
                setError(e.message);
            }
        }
    }

    async function AddTeam(teamName) {
        try {
            const response = await axios.post(
                `/dashboard/teams/`,
                { name: teamName },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log(response.data.team);
            const newTeamData = [...teams];
            newTeamData.push(response.data.team);
            console.log(newTeamData);
            setTeams(newTeamData);
            ResetRoles();
        } catch (e) {
            console.log(e.response);
            if (e.response.status === 401 || e.response.status === 500) {
                setError('You are not logged in! Redirecting to login page...');
                setRedirect(true);
            } else {
                setError(e.message);
            }
        }
    }

    async function ChangeTeamName(team_id, name) {
        try {
            const response = await axios.put(
                `/dashboard/teams/${team_id}`,
                { name: name },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const newTeamData = teams.map((team) => {
                if (team.team_id === team_id) {
                    team.name = name;
                }
                return team;
            });
            setTeams(newTeamData);
            console.log(response);
        } catch (e) {
            console.log(e.response);
            if (e.response.status === 401 || e.response.status === 500) {
                setError('You are not logged in! Redirecting to login page...');
                setRedirect(true);
            } else {
                setError(e.message);
            }
        }
    }

    async function deleteUserFromTeam(team_id, user_id) {
        const token = sessionStorage.getItem('token');
        try {
            await axios.delete(`/team/${team_id}/management/${user_id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const newTeamData = teams.map((team) => {
                if (team.team_id === team_id) {
                    const newTeamMembers = team.team_members.filter((member) => member.user_id !== user_id);
                    team.team_members = newTeamMembers;
                }
                return team;
            });
            setTeams(newTeamData);
        } catch (e) {
            console.log(e.response);
            if (e.response.status === 401 || e.response.status === 500) {
                setError('You are not logged in! Redirecting to login page...');
                setRedirect(true);
            } else {
                setError(e.message);
            }
        }
    }

    const getTeams = async () => {
        try {
            const response = await axios.get(`/user/${user_id}/teams`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const tempData = response.data.teams;
            console.log(response.data.teams);
            setTeams(tempData);
        } catch (error) {
            console.log(error.response);
        }
    };

    const handleDeleteRole = async (role_id, board_id, team_id, user_id) => {
        const token = sessionStorage.getItem('token');
        try {
            const response = await axios.delete(`/boards/${board_id}/team-member-roles/${role_id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log(response);
            const newTeamData = teams.map((team) => {
                if (team.team_id === team_id) {
                    const newTeamMembers = team.team_members.map((member) => {
                        if (member.user_id === user_id) {
                            const newRoles = member.roles.filter((role) => role.team_members_role_id !== role_id);
                            member.roles = newRoles;
                        }
                        return member;
                    });
                    team.team_members = newTeamMembers;
                }
                return team;
            });
            setTeams(newTeamData);

        } catch (error) {
            console.log(error.response);
        }
    }

    async function AddRoleToUser(board_id, team_member_id, role_id) {
        try {
            const response = await axios.post(`/boards/${board_id}/team-member-roles`, { team_member_id: team_member_id, role_id: role_id },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
            console.log(response);
            const newTeamMember = response.data.team_member;
            const newTeamData = teams.map((team) => {
                if (team.team_id === newTeamMember.team_id) {
                    const newTeamMembers = team.team_members.map((member) => {
                        if (member.user_id === newTeamMember.user_id) {
                            member.roles = newTeamMember.roles;
                        }
                        return member;
                    });
                    team.team_members = newTeamMembers;
                }
                return team;
            });
            setTeams(newTeamData);
        }
        catch (error) {
            console.log(error);
        }
    }

    return (
        <div className='content'>
            {teams.length === undefined ? (
                error ? (
                    <Error error={error} redirect={redirect} />
                ) : (
                    <Loader />
                )
            ) : (
                <div className='teams-container'>
                    {teams.length === 0 ? (
                        <div>
                            No teams yet
                            <div className='board add-board' onClick={() => addTeam()}>
                                <span>Add new team</span>
                            </div>
                            {manageIsClicked && (
                                <TeamManager
                                    teamData={[]}
                                    onClose={addTeam}
                                    ChangeTeamName={ChangeTeamName}
                                    addTeam={AddTeam}
                                />
                            )}
                        </div>
                    ) : (
                        <>
                            {teams.map((team, index) => (
                                <TeamCard
                                    key={index}
                                    data={team}
                                    deleteUserFromTeam={deleteUserFromTeam}
                                    ChangeTeamName={ChangeTeamName}
                                    AddUsers={AddUsers}
                                    DeleteTeam={DeleteTeam}
                                    ownPermissions={ownPermissions}
                                    teamPermissions={teamPermissions}
                                    AddRoleToUser={AddRoleToUser}
                                    handleDeleteRole={handleDeleteRole}
                                />
                            ))}

                            <div className='board add-board' onClick={() => addTeam()}>
                                <span>Add new team</span>
                            </div>
                            {manageIsClicked && (
                                <TeamManager
                                    teamData={[]}
                                    onClose={addTeam}
                                    ChangeTeamName={ChangeTeamName}
                                    addTeam={AddTeam}
                                />
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default Teams;
