import React, { useEffect, useState, useRef } from "react";
import "../../styles/dashboard.css";
import axios from "../../api/axios";
import { Link } from "react-router-dom";
import Loader from "../Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faPencil, faXmark } from "@fortawesome/free-solid-svg-icons";
import { SetRoles, checkIfAdmin, checkPermissionForBoard } from "../../roles/Roles";
import Error from "../Error";
import ErrorWrapper from "../../ErrorWrapper";
import ConfirmationPopup from "../Board/ConfirmationPopup";
import Echo from "laravel-echo";
import {
    REACT_APP_PUSHER_KEY,
    REACT_APP_PUSHER_CLUSTER,
    REACT_APP_PUSHER_PORT,
    REACT_APP_PUSHER_HOST,
    REACT_APP_PUSHER_PATH
} from "../../api/config.js";

const plusIcon = <FontAwesomeIcon icon={faPlus} />;
const pencilIcon = <FontAwesomeIcon icon={faPencil} />;
const closeIcon = <FontAwesomeIcon icon={faXmark} />;

export default function Dashboard() {
    const [userID, setUserID] = useState(null);
    const [teams, setTeams] = useState(null);
    const teamsRef = useRef(teams);
    const [showAddBoardPopup, setShowAddBoardPopup] = useState(false);
    const [selectedTeamId, setSelectedTeamId] = useState(null);
    const [selectedBoardId, setSelectedBoardId] = useState(null);
    const [hoveredBoardId, setHoveredBoardId] = useState(null);
    const [error, setError] = useState(false);
    const [redirect, setRedirect] = useState(false);
    const [showDeleteBoardConfirmation, setShowDeleteBoardConfirmation] =
        useState(false);

    const token = sessionStorage.getItem("token");
    const user_id = sessionStorage.getItem("user_id");
    const permissions = JSON.parse(sessionStorage.getItem("permissions"));

    //ez kell még
    const [theme, setTheme] = useState(localStorage.getItem("darkMode"));

    useEffect(() => {
        teamsRef.current = teams;
        ResetRoles();
    }, [teams]);

    useEffect(() => {
        document.title = "KanBan | Dashboard";
        if (user_id) {
            setUserID(user_id);
        }
        //backendről fetchelés
        fetchDashboardData();

        //ez
        const ResetTheme = () => {
            setTheme(localStorage.getItem("darkMode"));
        };

        window.addEventListener("ChangingTheme", ResetTheme);

        window.Pusher = require("pusher-js");
        window.Pusher.logToConsole = true;

        const echo = new Echo({
            broadcaster: 'pusher',
            key: REACT_APP_PUSHER_KEY,
            cluster: REACT_APP_PUSHER_CLUSTER,
            forceTLS: false,
            wsHost: REACT_APP_PUSHER_HOST || window.location.hostname,
            wsPort: REACT_APP_PUSHER_PORT,
            wssPort: REACT_APP_PUSHER_PORT,
            wsPath: REACT_APP_PUSHER_PATH || '',
            enableStats: false,
            enabledTransports: ['ws', 'wss'],
        })

        const channel = echo.channel(`DashboardChange`);

        channel.listen(
            `.user.${user_id}`,
            (e) => {
                handleWebSocket(e);
            },
            []
        );

        return () => {
            channel.unsubscribe();
            window.removeEventListener("ChangingTheme", ResetTheme);
        };
        //eddig
    }, []);

    const handleWebSocket = async (websocket) => {
        console.log("DATA");
        console.log(websocket.data);
        console.log(websocket.changeType);
        switch (websocket.changeType) {
            case "CREATED_TEAM":
                webSocketCreateTeam(websocket.data);
                break;
            case "UPDATED_TEAM":
                webSocketUpdateTeam(websocket.data);
                break;
            case "DELETED_TEAM":
                webSocketDeleteTeam(websocket.data);
                break;
            case "CREATED_BOARD":
                webSocketCreateBoard(websocket.data);
                break;
            case "UPDATED_BOARD":
                webSocketUpdateBoard(websocket.data);
                break;
            case "DELETED_BOARD":
                webSocketDeleteBoard(websocket.data);
                break;
            case "THIS_USER_ADDED_TO_TEAM":
                webSocketUserAddedToTeam(websocket.data);
                break;
            case "THIS_USER_DELETED_FROM_TEAM":
                webSocketUserDeletedToTeam(websocket.data);
                break;
            default:
                break;
        }
    };

    const webSocketCreateTeam = (data) => {
        let newTeamData = [...teamsRef.current];
        newTeamData.push(data.team);
        setTeams(newTeamData);
    };

    const webSocketUpdateTeam = (data) => {
        let newTeamData = [...teamsRef.current];
        newTeamData.forEach((currentTeam) => {
            if (currentTeam.team_id === data.team.team_id) {
                currentTeam.name = data.team.name;
            }
        });
        setTeams(newTeamData);
    };

    const webSocketDeleteTeam = (data) => {
        let newTeamData = [...teamsRef.current];
        newTeamData = newTeamData.filter(
            (currentTeam) => currentTeam.team_id !== data.team.team_id
        );
        setTeams(newTeamData);
    };

    const webSocketCreateBoard = (data) => {
        let newTeamData = [...teamsRef.current];
        newTeamData.forEach((currentTeam) => {
            if (currentTeam.team_id === data.board.team_id) {
                currentTeam.boards.push(data.board);
            }
        });
        setTeams(newTeamData);
    };

    const webSocketUpdateBoard = (data) => {
        let newTeamData = [...teamsRef.current];
        newTeamData.forEach((currentTeam) => {
            currentTeam.boards.forEach((currentBoard, index) => {
                if (currentBoard.board_id === data.board.board_id) {
                    currentTeam.boards[index] = data.board;
                }
            });
        });
        setTeams(newTeamData);
    };

    const webSocketDeleteBoard = (data) => {
        let newTeamData = [...teamsRef.current];
        newTeamData.forEach((currentTeam) => {
            currentTeam.boards = currentTeam.boards.filter(
                (currentBoard) => currentBoard.board_id !== data.board.board_id
            );
        });
        setTeams(newTeamData);
    };

    const webSocketUserAddedToTeam = (data) => {
        let newTeamData = [...teamsRef.current];
        newTeamData.push(data.team);
        setTeams(newTeamData);
    };

    const webSocketUserDeletedToTeam = (data) => {
        let newTeamData = [...teamsRef.current];
        console.log(newTeamData);
        newTeamData = newTeamData.filter(
            (currentTeam) => currentTeam.team_id !== data.team.team_id
        );
        setTeams(newTeamData);
    };

    async function ResetRoles() {
        await SetRoles(token);
    }

    const fetchDashboardData = async () => {
        try {
            await SetRoles(token);

            if (checkIfAdmin()) {
                const response = await axios.get("/dashboard/boards", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const teamData = response.data.teams;
                setTeams(teamData);
            }
            else {
                const response = await axios.get("/dashboard", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const teamData = response.data.teams;
                setTeams(teamData);
            }
        } catch (e) {
            console.error(e);
            if (e?.response?.status === 401 || e?.response?.status === 500) {
                setError({
                    message: "You are not logged in! Redirecting to login page...",
                });
                setRedirect(true);
            } else {
                setError(e);
            }
        }
    };

    // Function to add a new board to a team
    const addBoardToTeam = async (teamId, newBoardName) => {
        try {
            const response = await axios.post(
                "/dashboard/board",
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

            ResetRoles();
        } catch (e) {
            console.error(e);
            if (e?.response?.status === 401 || e?.response?.status === 500) {
                setError({
                    message: "You are not logged in! Redirecting to login page...",
                });
                setRedirect(true);
            } else {
                setError(e);
            }
        }
    };

    const handleDeleteButtonClick = (teamId, boardId) => {
        setShowDeleteBoardConfirmation(true);
        setSelectedTeamId(teamId);
        setSelectedBoardId(boardId);
    };

    // Function to delete a board from a team
    const deleteBoardFromTeam = async () => {
        handleBoardDeleteCancel();
        try {
            await axios.delete(`/dashboard/board/${selectedBoardId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        } catch (e) {
            console.error(e);
            if (e?.response?.status === 401 || e?.response?.status === 500) {
                setError({
                    message: "You are not logged in! Redirecting to login page...",
                });
                setRedirect(true);
            } else {
                setError(e);
            }
        }
    };

    const handleBoardDeleteCancel = () => {
        setShowDeleteBoardConfirmation(false);
        setSelectedTeamId(-1);
        setSelectedBoardId(-1);
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
        } catch (e) {
            console.error(e);
            e?.response?.status === 401 || e?.response?.status === 500
                ? setError({
                    message: "You are not logged in! Redirecting to login page...",
                })
                : setError(e);
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

    const getBoardNameBySelectedTeamIdAndSelectedBoardId = () => {
        if (selectedBoardId < 0 || selectedTeamId < 0) return "";

        const name = teams
            .filter((actualTeam) => actualTeam.team_id === selectedTeamId)[0]
            .boards?.filter(
                (actualBoard) => actualBoard.board_id === selectedBoardId
            )[0]?.name;

        return name || "";
    };

    return (
        <div className="content col-10" data-theme={theme}>
            {teams === null ? (
                error ? (
                    <Error error={error} redirect={redirect}></Error>
                ) : (
                    <Loader
                        data_to_load={teams}
                        text_if_cant_load={"You don't have any teams yet!"}
                    />
                )
            ) : (
                <>
                    <h1 className="header">Dashboard</h1>
                    {teams.length === 0 ? (
                        <div>
                            <p>You don't have any teams yet!</p>
                            Link to <Link to="/teams">Teams</Link> page.
                        </div>
                    ) : (
                        userID && (
                            <div>
                                <div className="teams">
                                    {teams.map((team) => (
                                        <div className="team" key={team.team_id}>
                                            <h3 className="team-title">{team.name}</h3>
                                            <div className="boards">
                                                {team.boards.map((board) => (
                                                    <div
                                                        className="board"
                                                        key={board.board_id}
                                                        onMouseEnter={() =>
                                                            handleMouseEnterOnBoard(board.board_id)
                                                        }
                                                        onMouseLeave={() => handleMouseLeaveOnBoard()}
                                                    >
                                                        <Link
                                                            to={`/board/${board.board_id}`}
                                                            className="board-title"
                                                        >
                                                            <p>{board.name}</p>
                                                        </Link>
                                                        {checkPermissionForBoard(
                                                            board.board_id,
                                                            team.team_id,
                                                            "board_management"
                                                        ) === true && (
                                                                <span
                                                                    className="delete-icon"
                                                                    style={{
                                                                        visibility:
                                                                            hoveredBoardId === board.board_id
                                                                                ? "visible"
                                                                                : "hidden",
                                                                        transition: "visibility 0.1s ease",
                                                                        zIndex: "99",
                                                                    }}
                                                                    onClick={() =>
                                                                        handleDeleteButtonClick(
                                                                            team.team_id,
                                                                            board.board_id
                                                                        )
                                                                    }
                                                                    data-hover="Delete Board"
                                                                >
                                                                    {closeIcon}
                                                                </span>
                                                            )}
                                                        {checkPermissionForBoard(
                                                            board.board_id,
                                                            team.team_id,
                                                            "board_management"
                                                        ) === true && (
                                                                <span
                                                                    className="edit-board-button"
                                                                    style={{
                                                                        display:
                                                                            hoveredBoardId === board.board_id
                                                                                ? "block"
                                                                                : "none",
                                                                    }}
                                                                    onClick={() =>
                                                                        openAddBoardPopup(
                                                                            team.team_id,
                                                                            board.board_id
                                                                        )
                                                                    }
                                                                >
                                                                    {pencilIcon}
                                                                </span>
                                                            )}
                                                    </div>
                                                ))}
                                                <div
                                                    className="board add-board"
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
                                        <div className="overlay">
                                            <div className="popup popup-mini">
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
                                {showDeleteBoardConfirmation && (
                                    <ConfirmationPopup
                                        text={getBoardNameBySelectedTeamIdAndSelectedBoardId()}
                                        onConfirm={deleteBoardFromTeam}
                                        onCancel={handleBoardDeleteCancel}
                                    />
                                )}
                            </div>
                        )
                    )}
                </>
            )}
        </div>
    );
}

//ez maga a popup componens az addnál és editnél
const AddBoardPopup = ({ teamId, boardId, onClose, onSave }) => {
    const [boardName, setBoardName] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [theme, setTheme] = useState(localStorage.getItem("darkMode"));
    const [error, setError] = useState(null);

    useEffect(() => {
        if (boardId) {
            fetchDashboardData();
        } else {
            setIsLoading(false);
        }

        //ez
        const ResetTheme = () => {
            setTheme(localStorage.getItem("darkMode"));
        };

        window.addEventListener("ChangingTheme", ResetTheme);

        return () => {
            window.removeEventListener("ChangingTheme", ResetTheme);
        };
        //eddig
    }, [boardId]);

    const fetchDashboardData = async () => {
        try {
            const token = sessionStorage.getItem("token");
            const response = await axios.get(`/boards/${boardId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setBoardName(response.data.board.name);
            setIsLoading(false);
        } catch (e) {
            e?.response?.status === 401 || e?.response?.status === 500
                ? setError({
                    message: "You are not logged in! Redirecting to login page...",
                })
                : setError(e);
        }
    };

    const handleSave = (e) => {
        e.preventDefault();
        onSave(teamId, boardId, boardName);
        setBoardName("");
    };

    return (
        <>
            {isLoading ? (
                <Loader />
            ) : (
                <form
                    className="popup-content-form-mini"
                    onSubmit={handleSave}
                    data-theme={theme}
                >
                    <span className="close-btn" onClick={onClose}>
                        {closeIcon}
                    </span>
                    {boardId ? <h4>Edit board name:</h4> : <h4>New board name:</h4>}
                    <input
                        type="text"
                        value={boardName}
                        onChange={(e) => setBoardName(e.target.value)}
                        placeholder="Board name"
                        className="popup-input-mini"
                        required
                    />
                    <button className="board-save-button">Save</button>
                </form>
            )}
            {error && (
                <ErrorWrapper
                    originalError={error}
                    onClose={() => {
                        setError(null);
                    }}
                />
            )}
        </>
    );
};
