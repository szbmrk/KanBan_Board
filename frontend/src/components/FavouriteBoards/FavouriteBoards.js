import { React, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import Echo from "laravel-echo";

import axios from "../../api/axios";
import Error from "../Error";
import Loader from "../Loader";
import ConfirmationPopup from "../Board/ConfirmationPopup";
import {
    REACT_APP_PUSHER_KEY,
    REACT_APP_PUSHER_CLUSTER,
    REACT_APP_PUSHER_PORT,
    REACT_APP_PUSHER_HOST,
    REACT_APP_PUSHER_PATH
} from "../../api/config.js";

export default function FavouriteBoards() {
    const [boards, setBoards] = useState(null);

    const [error, setError] = useState(null);
    const [redirect, setRedirect] = useState(false);
    const [hoveredBoardId, setHoveredBoardId] = useState(null);
    const [showUnfavouriteBoardConfirmation, setShowUnfavouriteBoardConfirmation] =
        useState(false);
    const [selectedBoardId, setSelectedBoardId] = useState(null);

    const token = sessionStorage.getItem("token");
    const userId = sessionStorage.getItem("user_id");

    const UnfavouriteIcon = <FontAwesomeIcon icon={faTrash} />

    async function fetchFavouriteBoards() {
        try {
            const resp = await axios.get(`/favourite/boards/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const boards = resp.data.favourites;

            if (boards) {
                setBoards(boards);
            } else {
                setBoards([])
            }
        } catch (err) {
            if (err?.response?.status === 401 || err?.response?.status === 500) {
                setError({
                    message: "You are not logged in! Redirecting to login page...",
                });
                setRedirect(true);
            } else {
                setError(err);
            }
        }
    }

    function handleMouseEnterOnBoard(boardId) {
        setHoveredBoardId(boardId);
    }

    function handleMouseLeaveOnBoard() {
        setHoveredBoardId(null);
    }

    function handleUnfavouriteButtonClick(boardId) {
        setShowUnfavouriteBoardConfirmation(true);
        setSelectedBoardId(boardId)
    }

    function getBoardNameBySelectedTeamIdAndSelectedBoardId() {
        if (selectedBoardId < 0) return "";

        const name = boards
            .filter(
                (actualBoard) => actualBoard.board_id === selectedBoardId
            )[0]?.board_name;

        return name || "";
    }

    function handleBoardDeleteCancel() {
        setShowUnfavouriteBoardConfirmation(false);
        setSelectedBoardId(-1);
    };

    async function unfavouriteBoard() {
        handleBoardDeleteCancel();
        try {
            await axios.delete("/favourite/boards", {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                data: {
                    board_id: selectedBoardId
                }
            });
        } catch (err) {
            if (err?.response?.status === 401 || err?.response?.status === 500) {
                setError({
                    message: "You are not logged in! Redirecting to login page...",
                });
                setRedirect(true);
            } else {
                setError(err);
            }
        }
    };

    async function handleWebSocket(websocket) {
        switch (websocket.changeType) {
            case "DELETED_TEAM":
                webSocketDeleteTeam(websocket.data);
                break;
            case "UPDATED_BOARD":
                webSocketUpdateBoard(websocket.data);
                break;
            case "DELETED_BOARD":
                webSocketDeleteBoard(websocket.data);
                break;
            case "THIS_USER_DELETED_FROM_TEAM":
                webSocketUserDeletedFromTeam(websocket.data);
                break;
            default:
                break;
        }
    };

    function webSocketDeleteTeam(data) {
        let newBoards = boards.filter(
            (board) => board.team_id !== data.team.team_id
        );
        setBoards(newBoards)
    };

    function webSocketUpdateBoard(data) {
        let newBoards = boards.slice();
        newBoards.forEach((board, index) => {
            if (board.board_id === data.board.board_id
                && board.board_name !== data.board.name) {
                newBoards[index].board_name = data.board.name;
            }
        });
        setBoards(newBoards);
    }

    function webSocketDeleteBoard(data) {
        let newBoards = boards.filter(
            (board) => board.board_id !== data.board.board_id
        );
        setBoards(newBoards);
    }

    function webSocketUserDeletedFromTeam(data) {
        let newBoards = boards.filter(
            (board) => board.team_id !== data.team.team_id
        );
        setBoards(newBoards);
    }

    useEffect(() => {
        document.title = "KanBan | Favourite Boards";
        fetchFavouriteBoards();

        window.Pusher = require("pusher-js");
        window.Pusher.logToConsole = true;

        const echo = new Echo({
            broadcaster: "pusher",
            key: REACT_APP_PUSHER_KEY,
            cluster: REACT_APP_PUSHER_CLUSTER,
            wsHost: REACT_APP_PUSHER_HOST || window.location.hostname,
            wsPort: REACT_APP_PUSHER_PORT || 6001,
            wssPort: 443,
            wsPath: REACT_APP_PUSHER_PATH || '',
            enableStats: false,
            forceTLS: false,
            enabledTransports: ["ws", "wss"],
        });

        const channel = echo.channel(`BoardsChange`);

        channel.listen(
            `.user.${userId}`,
            (e) => {
                handleWebSocket(e);
            },
            []
        );
    });

    return (
        <div className="content col-10" >
            {boards === null ? (
                error ? (
                    <Error error={error} redirect={redirect}></Error>
                ) : (
                    <Loader
                        data_to_load={boards}
                        text_if_cant_load={"You don't have any favourite boards yet!"}
                    />
                )
            ) : (
                <>
                    <h1 className="header">Favourite Boards</h1>
                    {boards.length === 0 ? (
                        <div>
                            <p>You don't have any favourite boards yet!</p>
                            Link to <Link to="/boards">Boards</Link> page.
                        </div>
                    ) : (
                        userId && (
                            <>
                                <div className="boards">
                                    {boards.map((board) => (
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
                                                <p>{board.board_name}</p>
                                            </Link>
                                            <span
                                                className="favourite-board-button"
                                                style={{
                                                    visibility:
                                                        hoveredBoardId === board.board_id
                                                            ? "visible"
                                                            : "hidden",
                                                    transition: "visibility 0.1s ease",
                                                    zIndex: "99",
                                                }}
                                                onClick={() =>
                                                    handleUnfavouriteButtonClick(
                                                        board.board_id
                                                    )
                                                }
                                                data-hover="Unfavourite Board"
                                            >
                                                {UnfavouriteIcon}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                {showUnfavouriteBoardConfirmation && (
                                    <ConfirmationPopup
                                        action="Unfavourite"
                                        text={getBoardNameBySelectedTeamIdAndSelectedBoardId()}
                                        onConfirm={unfavouriteBoard}
                                        onCancel={handleBoardDeleteCancel}
                                    />
                                )}
                            </>
                        )
                    )}
                </>
            )}
        </div>
    );
}

