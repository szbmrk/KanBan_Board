import { React, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStarHalfStroke } from "@fortawesome/free-solid-svg-icons";

import axios from "../../api/axios";
import Error from "../Error";
import Loader from "../Loader";
import ConfirmationPopup from "../Board/ConfirmationPopup";

export default function FavouriteBoards() {
    const [ boards, setBoards ] = useState(null);
    const [ theme, setTheme ] = useState(localStorage.getItem("darkMode"));
    const [ error, setError ] = useState(null);
    const [ redirect, setRedirect ] = useState(false);
    const [ hoveredBoardId, setHoveredBoardId ] = useState(null);
    const [ showUnfavouriteBoardConfirmation, setShowUnfavouriteBoardConfirmation ] =
        useState(false);
    const [selectedBoardId, setSelectedBoardId] = useState(null);

    const token = sessionStorage.getItem("token");
    const userId = sessionStorage.getItem("user_id");

    const UnfavouriteIcon = <FontAwesomeIcon icon={faStarHalfStroke} />

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

        console.error(selectedBoardId);

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

    async function deleteBoardFromTeam() {
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

    useEffect(() => {
        document.title = "KanBan | Favourite Boards";
        fetchFavouriteBoards();

        const ResetTheme = () => {
            setTheme(localStorage.getItem("darkMode"));
        };

        window.addEventListener("ChangingTheme", ResetTheme);
    });

    return (
        <div className="content col-10" data-theme={theme}>
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
                                {showUnfavouriteBoardConfirmation && (
                                    <ConfirmationPopup
                                        action="Unfavourite"
                                        text={getBoardNameBySelectedTeamIdAndSelectedBoardId()}
                                        onConfirm={deleteBoardFromTeam}
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

