import { useEffect, useState } from 'react';
import '../../styles/dashboard.css';

export default function Dashboard() {
    const [userID, setUserID] = useState(null);
    const [teams, setTeams] = useState([]);
    const [showAddBoardPopup, setShowAddBoardPopup] = useState(false);
    const [selectedTeamId, setSelectedTeamId] = useState(null);
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

        setTeams([
            {
                team_id: 1,
                team_name: 'Team A',
                boards: [
                    {
                        board_id: 1,
                        board_name: 'Board 1',
                    },
                    {
                        board_id: 2,
                        board_name: 'Board 2',
                    },
                ],
            },
            {
                team_id: 2,
                team_name: 'Team B',
                boards: [
                    {
                        board_id: 3,
                        board_name: 'Board 1',
                    },
                    {
                        board_id: 4,
                        board_name: 'Board 2',
                    },
                ],
            },
        ]);
    }, []);

    // Function to add a new board to a team
    const addBoardToTeam = (teamId, newBoardName) => {
        setTeams((prevTeams) => {
            return prevTeams.map((team) => {
                if (team.team_id === teamId) {
                    return {
                        ...team,
                        boards: [
                            ...team.boards,
                            {
                                board_id: team.boards.length + 1,
                                board_name: newBoardName,
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

    const openAddBoardPopup = (teamId) => {
        setSelectedTeamId(teamId);
        setShowAddBoardPopup(true);
        setInitialCursorPosition({ x: containerPosition.x, y: containerPosition.y });
    };

    const closeAddBoardPopup = () => {
        setSelectedTeamId(null);
        setShowAddBoardPopup(false);
    };

    const handleSaveBoard = (newBoardName) => {
        if (selectedTeamId && newBoardName) {
            addBoardToTeam(selectedTeamId, newBoardName);
            setShowAddBoardPopup(false);
        }
    };

    const popupStyle = {
        position: 'fixed',
        top: initialCursorPosition.y + 50,
        left: initialCursorPosition.x,
        transform: 'translate(-50%, -50%)',
        with: '50px',
    };

    return (
        <div className="container">
            <h1 className="header">Dashboard</h1>
            {userID && (
                <div>
                    <div className="teams">
                        {teams.map((team) => (
                            <div className="team" key={team.team_id}>
                                <h3>{team.team_name}</h3>
                                <div className="boards">
                                    {team.boards.map((board) => (
                                        <div className="board" key={board.board_id}>
                                            <h4>{board.board_name}</h4>
                                            <button
                                                className="delete-board"
                                                onClick={() =>
                                                    deleteBoardFromTeam(team.team_id, board.board_id)
                                                }
                                            >
                                                Delete board
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button className="add-board" onClick={() => openAddBoardPopup(team.team_id)}>
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
}

const AddBoardPopup = ({ onClose, onSave }) => {
    const [newBoardName, setNewBoardName] = useState('');

    const handleSave = () => {
        onSave(newBoardName);
        setNewBoardName('');
    };

    return (
        <div className="popup-content" style={{ width: "85%" }}>
            <input
                type="text"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                placeholder="New board name"
            />
            <button onClick={handleSave}>Save</button>
            <button onClick={onClose}>Cancel</button>
        </div>
    );
};