import { useEffect, useState } from 'react';
import '../../styles/dashboard.css';
import axios from '../../api/axios';
import { Link } from 'react-router-dom';
import Loader from '../Loader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPencil, faXmark } from '@fortawesome/free-solid-svg-icons';
import { SetRoles } from '../../roles/Roles';

const plusIcon = <FontAwesomeIcon icon={faPlus} />;
const pencilIcon = <FontAwesomeIcon icon={faPencil} />;
const closeIcon = <FontAwesomeIcon icon={faXmark} />;

export default function Dashboard() {
    const [userID, setUserID] = useState(null);
    const [teams, setTeams] = useState([]);
    const [showAddBoardPopup, setShowAddBoardPopup] = useState(false);
    const [selectedTeamId, setSelectedTeamId] = useState(null);
    const [selectedBoardId, setSelectedBoardId] = useState(null);
    const [hoveredBoardId, setHoveredBoardId] = useState(null);
    const [ownPermissions, setOwnPermissions] = useState([]);
    const [teamPermissions, setTeamPermissions] = useState([]);


    const token = sessionStorage.getItem('token');
    const user_id = sessionStorage.getItem('user_id');

    useEffect(() => {
        document.title = 'Dashboard'
        if (user_id) {
            setUserID(user_id);
        }
        //backendről fetchelés
        fetchDashboardData();
    }, []);

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
        }
    };

    // Function to add a new board to a team
    const addBoardToTeam = async (teamId, newBoardName) => {
        try {
            const response = await axios.post(
                '/dashboard/board',
                {
                    team_id: teamId,
                    name: newBoardName,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Update the state with the newly added board
            setTeams((prevTeams) => {
                return prevTeams.map((team) => {
                    if (team.team_id === teamId) {
                        return {
                            ...team,
                            boards: [
                                ...team.boards,
                                {
                                    board_id: response.data.board.board_id,
                                    name: response.data.board.name,
                                },
                            ],
                        };
                    }
                    return team;
                });
            });
            ResetRoles();
        } catch (error) {
            console.error(error);
        }
    };

    // Function to delete a board from a team
    const deleteBoardFromTeam = async (teamId, boardId) => {
        try {
            await axios.delete(`/dashboard/board/${boardId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Update the state by removing the deleted board
            setTeams((prevTeams) => {
                return prevTeams.map((team) => {
                    if (team.team_id === teamId) {
                        return {
                            ...team,
                            boards: team.boards.filter((board) => board.board_id !== boardId),
                        };
                    }
                    return team;
                });
            });
        } catch (error) {
            console.error(error);
        }
    };

    const editBoardName = async (teamId, boardId, updatedBoardName) => {
        try {
            await axios.put(
                `/dashboard/board/${boardId}`,
                {
                    name: updatedBoardName,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Update the state with the edited board name
            setTeams((prevTeams) => {
                return prevTeams.map((team) => {
                    if (team.team_id === teamId) {
                        return {
                            ...team,
                            boards: team.boards.map((board) => {
                                if (board.board_id === boardId) {
                                    return {
                                        ...board,
                                        name: updatedBoardName,
                                    };
                                }
                                return board;
                            }),
                        };
                    }
                    return team;
                });
            });
        } catch (error) {
            console.error(error);
        }
    };

    const openAddBoardPopup = (teamId, boardId) => {
        setSelectedTeamId(teamId);
        setSelectedBoardId(boardId);
        setShowAddBoardPopup(true);
    };

    const closeAddBoardPopup = () => {
        setSelectedTeamId(null);
        setShowAddBoardPopup(false);
    };

    const handleSaveBoard = (teamId, boardId, newBoardName) => {
        if (boardId) {
            editBoardName(teamId, boardId, newBoardName);
            closeAddBoardPopup();
            setShowAddBoardPopup(false);
        } else {
            addBoardToTeam(teamId, newBoardName);
            setShowAddBoardPopup(false);
        }
    };

    const handleMouseEnterOnBoard = (boardId) => {
        setHoveredBoardId(boardId);
    };

    const handleMouseLeaveOnBoard = () => {
        setHoveredBoardId(null);
    };

    const checkPermissonToManageBoard = (board_id, team_id) => {
        //TODO Refactor
        console.log(teamPermissions);
        if (ownPermissions.includes('system_admin')) {
            return true;
        }
        if (teamPermissions.length === 0) {
            return false;
        }
        for (let i = 0; i < teamPermissions.length; i++) {
            if (teamPermissions[i].team_id === team_id && teamPermissions[i].board_id === board_id) {
                if (teamPermissions[i].permission === 'board_management') {
                    return true;
                }
            }
        }
    }

    return (
        <div className='content'>
            {teams.length === 0 ? (
                <Loader />
            ) : (
                <>
                    <h1 className='header'>Dashboard</h1>
                    {userID && (
                        <div>
                            <div className='teams'>
                                {teams.map((team) => (
                                    <div className='team' key={team.team_id}>
                                        <h3 className='team-title'>{team.name}</h3>
                                        <div className='boards'>
                                            {team.boards.map((board) => (
                                                <div
                                                    className='board'
                                                    key={board.board_id}
                                                    onMouseEnter={() => handleMouseEnterOnBoard(board.board_id)}
                                                    onMouseLeave={() => handleMouseLeaveOnBoard()}
                                                >
                                                    <Link to={`/board/${board.board_id}`} className='board-title'>
                                                        <p>{board.name}</p>
                                                    </Link>
                                                    {checkPermissonToManageBoard(board.board_id, team.team_id) === true &&
                                                        <span
                                                            className='delete-button'
                                                            style={{
                                                                visibility:
                                                                    hoveredBoardId === board.board_id
                                                                        ? 'visible'
                                                                        : 'hidden',
                                                                transition: 'visibility 0.1s ease',
                                                            }}
                                                            onClick={() =>
                                                                deleteBoardFromTeam(team.team_id, board.board_id)
                                                            }
                                                        >
                                                            {closeIcon}
                                                        </span>}
                                                    {checkPermissonToManageBoard(board.board_id, team.team_id) === true &&
                                                        <span
                                                            className='edit-board-button'
                                                            style={{
                                                                display:
                                                                    hoveredBoardId === board.board_id
                                                                        ? 'block'
                                                                        : 'none',
                                                            }}
                                                            onClick={() =>
                                                                openAddBoardPopup(team.team_id, board.board_id)
                                                            }
                                                        >
                                                            {pencilIcon}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                            <div
                                                className='board add-board'
                                                onClick={() => openAddBoardPopup(team.team_id, null)}
                                            >
                                                <span>{plusIcon} Add new board</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {showAddBoardPopup && (
                                <>
                                    <div className='overlay'>
                                        <div className='popup popup-mini'>
                                            <AddBoardPopup
                                                teamId={selectedTeamId}
                                                boardId={selectedBoardId}
                                                onClose={closeAddBoardPopup}
                                                onSave={handleSaveBoard}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

//ez maga a popup componens az addnál és editnél
const AddBoardPopup = ({ teamId, boardId, onClose, onSave }) => {
    const [boardName, setBoardName] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (boardId) {
            fetchDashboardData();
        } else {
            setIsLoading(false);
        }
    }, [boardId]);

    const fetchDashboardData = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.get(`/boards/${boardId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setBoardName(response.data.board.name);
            setIsLoading(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSave = (e) => {
        e.preventDefault();
        onSave(teamId, boardId, boardName);
        setBoardName('');
    };

    return (
        <>
            {isLoading ? (
                <Loader />
            ) : (
                <form className='popup-content-form-mini' onSubmit={handleSave}>
                    <span className='close-btn' onClick={onClose}>
                        {closeIcon}
                    </span>
                    {boardId ? <h4>Edit board name:</h4> : <h4>New board name:</h4>}
                    <input
                        type='text'
                        value={boardName}
                        onChange={(e) => setBoardName(e.target.value)}
                        placeholder='Board name'
                        className='popup-input-mini'
                        required
                    />
                    <button className='board-save-button'>Save</button>
                </form>
            )}
        </>
    );
};
