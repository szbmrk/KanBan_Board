import { useEffect, useState } from 'react';
import '../../styles/dashboard.css';
import '../../styles/popup.css';
import axios from '../../api/axios';
import { Link } from 'react-router-dom';

export default function Dashboard() {
    const [userID, setUserID] = useState(null);
    const [teams, setTeams] = useState([]);
    const [showAddBoardPopup, setShowAddBoardPopup] = useState(false);
    const [selectedTeamId, setSelectedTeamId] = useState(null);
    const [selectedBoardId, setSelectedBoardId] = useState(null);
    const [containerPosition, setContainerPosition] = useState({ x: 0, y: 0 });
    const [initialCursorPosition, setInitialCursorPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            setContainerPosition({ x: e.clientX, y: e.clientY });
        };

        document.addEventListener('mousemove', handleMouseMove);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);


    useEffect(() => {
        const user_id = sessionStorage.getItem('user_id');
        if (user_id) {
            setUserID(user_id);
        }


        //backendről fetchelés
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        const token = sessionStorage.getItem('token');

        try {
            const response = await axios.get('/dashboard', {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            setTeams(response.data.teams);
        }
        catch (e) {
            console.error(e)
        }
    };

    // Function to add a new board to a team
    const addBoardToTeam = async (teamId, newBoardName) => {
        const token = sessionStorage.getItem('token');

        try {
            const response = await axios.post('/dashboard/board', {
                team_id: teamId,
                name: newBoardName,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

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
        } catch (error) {
            console.error(error);
        }
    };


    // Function to delete a board from a team
    const deleteBoardFromTeam = async (teamId, boardId) => {
        const token = sessionStorage.getItem('token');

        try {
            await axios.delete(`/dashboard/board/${boardId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
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
        const token = sessionStorage.getItem('token');

        try {
            await axios.put(`/dashboard/board/${boardId}`, {
                name: updatedBoardName,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

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
        setInitialCursorPosition({ x: containerPosition.x, y: containerPosition.y });
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
        }
        else {
            addBoardToTeam(selectedTeamId, newBoardName);
            setShowAddBoardPopup(false);
        }
    };

    const popupStyle = {
        position: 'fixed',
        top: initialCursorPosition.y + 50,
        left: initialCursorPosition.x,
        transform: 'translate(-50%, -50%)',
    };

    return (
        <div className="content col-10">
            <h1 className="header">Dashboard</h1>
            {userID && (
                <div>
                    <div className="teams">
                        {teams.map((team) => (
                            <div className="team" key={team.team_id}>
                                <h3>{team.name}</h3>
                                <div className="boards">
                                    {team.boards.map((board) => (
                                        <div className="board" key={board.board_id}>
                                            <Link to={`/board/${board.board_id}`}>{board.name}</Link>
                                            <div className="board-actions">
                                                <button
                                                    className="edit-board"
                                                    onClick={() => openAddBoardPopup(team.team_id, board.board_id)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="delete-board"
                                                    onClick={() =>
                                                        deleteBoardFromTeam(team.team_id, board.board_id)
                                                    }
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button className="add-board" onClick={() => openAddBoardPopup(team.team_id, null)}>
                                    Add board
                                </button>
                            </div>
                        ))}
                    </div>
                    {showAddBoardPopup && (
                        <>
                            <div className="overlay_mini" />
                            <div className="popup_mini" style={popupStyle}>
                                <AddBoardPopup
                                    teamId={selectedTeamId}
                                    boardId={selectedBoardId} // Use 'boardId' instead of 'selectedBoardId'
                                    onClose={closeAddBoardPopup}
                                    onSave={handleSaveBoard}
                                />
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

//ez maga a popup componens az addnál és editnél
const AddBoardPopup = ({ teamId, boardId, onClose, onSave }) => {
    const [boardName, setBoardName] = useState('');

    useEffect(() => {
        // If a board ID is passed, fetch the existing board name for editing
        if (boardId) {
            fetchDashboardData();
        }
    }, [boardId]);

    const fetchDashboardData = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.get(`/boards/${boardId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            setBoardName(response.data.board.name);
        }
        catch (error) {
            console.error(error);
        }
    };

    const handleSave = (e) => {
        e.preventDefault();
        onSave(teamId, boardId, boardName);
        setBoardName('');
    };

    return (
        <form className="popup-content_mini" onSubmit={handleSave}>
            <input
                type="text"
                value={boardName}
                onChange={(e) => setBoardName(e.target.value)}
                placeholder="Board name"
                className="board-input_mini"
                required
            />
            <div className="button-container_mini">
                <button type="submit" className="save-button">
                    Save
                </button>
                <button onClick={onClose} className="cancel-button">
                    Cancel
                </button>
            </div>
        </form>
    );
};