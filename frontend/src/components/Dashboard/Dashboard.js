import React, { useEffect, useState } from "react";
import "../../styles/dashboard.css";
import axios from "../../api/axios";
import { Link } from "react-router-dom";
import Loader from "../Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faPencil, faXmark } from "@fortawesome/free-solid-svg-icons";
import { SetRoles, checkPermissionForBoard } from "../../roles/Roles";
import Error from "../Error";
import ErrorWrapper from "../../ErrorWrapper";
import ConfirmationPopup from "../Board/ConfirmationPopup";

const plusIcon = <FontAwesomeIcon icon={faPlus} />;
const pencilIcon = <FontAwesomeIcon icon={faPencil} />;
const closeIcon = <FontAwesomeIcon icon={faXmark} />;

export default function Dashboard() {
    const [userID, setUserID] = useState(null);
    const [teams, setTeams] = useState(null);
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

        return () => {
            window.removeEventListener("ChangingTheme", ResetTheme);
        };
        //eddig
    }, []);

    async function ResetRoles() {
        await SetRoles(token);
    }

    const fetchDashboardData = async () => {
        try {
            const response = await axios.get("/dashboard", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const teamData = response.data.teams;
            setTeams(teamData);
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
        try {
            await axios.delete(`/dashboard/board/${selectedBoardId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Update the state by removing the deleted board
            setTeams((prevTeams) => {
                return prevTeams.map((team) => {
                    if (team.team_id === selectedTeamId) {
                        return {
                            ...team,
                            boards: team.boards.filter(
                                (board) => board.board_id !== selectedBoardId
                            ),
                        };
                    }
                    return team;
                });
            });

            handleBoardDeleteCancel();
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

        return teams
            .filter((actualTeam) => actualTeam.team_id === selectedTeamId)[0]
            .boards.filter(
                (actualBoard) => actualBoard.board_id === selectedBoardId
            )[0].name;
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
