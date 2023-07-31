import { useEffect, useState } from 'react';
import '../../styles/popup.css';
import '../../styles/dashboard.css';
import axios from '../../api/axios';

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
            console.log(response.data.teams)
            setTeams(response.data.teams);
        }
        catch (e) {
            console.error(e)
        }
    };

    // Function to add a new board to a team
    const addBoardToTeam = (teamId, newBoardName) => {
        //insert a backenden és adatok ujrafetchelése

        //ez majd nem kell ha backend lesz
        setTeams((prevTeams) => {
            return prevTeams.map((team) => {
                if (team.team_id === teamId) {
                    return {
                        ...team,
                        boards: [
                            ...team.boards,
                            {
                                board_id: team.boards.length + 1,
                                name: newBoardName,
                            },
                        ],
                    };
                }
                return team;
            });
        });
    };

    // Function to delete a board from a team
    const deleteBoardFromTeam = (teamId, boardId) => {
        //delete a backenden és adatok ujrafetchelése

        //ez majd nem kell ha backend lesz
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
    };

    const editBoardName = (teamId, boardId, updatedBoardName) => {
        // Edit the board name on the backend and fetch updated data
        // This part would be implemented when you have backend functionality

        // For now, we'll update the state directly
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
                                            <h4>{board.name}</h4>
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
                            <div className="overlay" />
                            <div className="popup" style={popupStyle}>
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
            // Fetch the board name from the backend based on teamId and boardId
            // This part would be implemented when you have backend functionality
            // For now, we'll update the state directly with the existing board name
            setBoardName(/* fetch board name from the backend */);
        }
    }, [boardId]);

    const handleSave = (e) => {
        e.preventDefault();
        onSave(teamId, boardId, boardName);
        setBoardName('');
    };

    return (
        <form className="popup-content" onSubmit={handleSave}>
            <input
                type="text"
                value={boardName}
                onChange={(e) => setBoardName(e.target.value)}
                placeholder="Board name"
                className="board-input"
                required
            />
            <div className="button-container">
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