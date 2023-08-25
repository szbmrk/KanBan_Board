import { useEffect, useState } from 'react';
import '../../styles/dashboard.css';
import axios from '../../api/axios';
import { Link } from 'react-router-dom';
import Loader from '../Loader';
import { SetRoles } from '../../roles/Roles';
import Error from '../Error';

export default function ManageBoardPermissions() {
    const [userID, setUserID] = useState(null);
    const [teams, setTeams] = useState(null);
    const [ownPermissions, setOwnPermissions] = useState([]);
    const [teamPermissions, setTeamPermissions] = useState([]);
    const [error, setError] = useState(false);
    const [redirect, setRedirect] = useState(false);

    const token = sessionStorage.getItem('token');
    const user_id = sessionStorage.getItem('user_id');

    useEffect(() => {
        document.title = 'Permissions';
        if (user_id) {
            setUserID(user_id);
        }
        //backendről fetchelés
        fetchDashboardData();
    }, []);

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
    };

    function checkPermissionToManageRole(board_id, team_id) {
        console.log(teamPermissions);
        if (ownPermissions.includes('system_admin')) {
            return true;
        }
        if (teamPermissions.length === 0) {
            return false;
        }
        for (let i = 0; i < teamPermissions.length; i++) {
            if (teamPermissions[i].team_id === team_id) {
                if (teamPermissions[i].permission === 'role_management' && teamPermissions[i].board_id === board_id) {
                    return true;
                }
            }
        }
        return false;
    }

    function checkPermissionToManageRolesPermission(board_id, team_id) {
        console.log(teamPermissions);
        if (ownPermissions.includes('system_admin')) {
            return true;
        }
        if (teamPermissions.length === 0) {
            return false;
        }
        for (let i = 0; i < teamPermissions.length; i++) {
            if (teamPermissions[i].team_id === team_id) {
                if (teamPermissions[i].permission === 'roles_permissions_management' && teamPermissions[i].board_id === board_id) {
                    return true;
                }
            }
        }
        return false;
    }

    async function ResetRoles() {
        await SetRoles(token);
        setTeamPermissions(JSON.parse(sessionStorage.getItem('permissions')).teams);
        setOwnPermissions(JSON.parse(sessionStorage.getItem('permissions')).general_role);
    }

    const fetchDashboardData = async () => {
        try {
            const response = await axios.get('/dashboard', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log(response.data);
            const teamData = response.data.teams;
            console.log(teamData);
            setTeams(teamData);
            ResetRoles();
        } catch (e) {
            console.error(e);
            if (e.response.status === 401 || e.response.status === 500) {
                setError('You are not logged in! Redirecting to login page...');
                setRedirect(true);
            } else {
                setError(e.message);
            }
        }
    };

    return (
        <div className='content'>
            {teams === null ? (
                error ? (
                    <Error error={error} redirect={redirect}></Error>
                ) : (
                    <Loader data_to_load={teams} text_if_cant_load={"No boards found to manage!"} />
                )
            ) : (
                <>
                    <h1 className='header'>Boards you can manage</h1>
                    {userID && (
                        <div>
                            <div className='teams'>
                                {teams.map((team) => (
                                    team.boards.length > 0 &&
                                    (<div className='team' key={team.team_id}>
                                        <h3 className='team-title'>{team.name}</h3>
                                        <div className='boards'>
                                            {team.boards.map((board) => (
                                                ((checkPermissionToManageRole(board.board_id, team.team_id) || checkPermissonToManageTeam(team.team_id)) || checkPermissionToManageRolesPermission(board.board_id, team.team_id)) && (
                                                    <div
                                                        className='board'
                                                        key={board.board_id}
                                                    >
                                                        <Link to={`/permissions/${team.team_id}/${board.board_id}`} className='board-title'>
                                                            <p>{board.name}</p>
                                                        </Link>
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    </div>)
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
