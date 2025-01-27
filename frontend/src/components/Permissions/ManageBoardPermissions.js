import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import { Link } from "react-router-dom";
import Loader from "../Loader";
import Error from "../Error";
import { SetRoles, checkIfAdmin, checkPermissionForBoard, checkPermisson } from "../../roles/Roles";
import "../../styles/boards.css";

export default function ManageBoardPermissions() {
    const [userID, setUserID] = useState(null);
    const [teams, setTeams] = useState(null);
    const [error, setError] = useState(false);
    const token = sessionStorage.getItem("token");
    const user_id = sessionStorage.getItem("user_id");


    useEffect(() => {
        document.title = "KanBan | Permissions";
        fetchBoardsData();
    }, []);

    const fetchBoardsData = async () => {
        try {
            await SetRoles(token);

            if (checkIfAdmin()) {
                const response = await axios.get("/boards/boards", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const teamData = response.data.teams;
                setTeams(teamData);
            }

            else {
                const response = await axios.get("/boards", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const teamData = response.data.teams;
                setTeams(teamData);
            }
        } catch (e) {
            handleFetchError(e);
        }
    };

    const handleFetchError = (e) => {
        console.error(e);
        const errorMessage =
            e?.response?.status === 401 || e?.response?.status === 500
                ? "You are not logged in! Redirecting to login page..."
                : e;
        setError(errorMessage);
    };

    const renderBoards = () => {
        if (!teams) {
            return <Loader data_to_load={teams} text_if_cant_load={"No boards found to manage!"} />;
        }
        if (error) {
            return <Error error={error} redirect={error} />;
        }
        return (
            <>
                <h1 className="header">Boards you can manage</h1>
                {teams.length === 0 ? (
                    <p className="text">No boards found to manage!</p>
                ) : (
                    <div>
                        <div className="teams">
                            {teams.map(team => renderTeam(team))}
                        </div>
                    </div>
                )}
            </>
        );
    };

    const renderTeam = (team) => {
        if (team.boards.length === 0) return null;
        return (
            <div className="team" key={team.team_id}>
                <h3 className="team-title">{team.name}</h3>
                <div className="boards">
                    {team.boards.map(board => renderBoard(board, team))}
                </div>
            </div>
        );
    };

    const renderBoard = (board, team) => {
        const canManagePermissions =
            checkPermissionForBoard(board.board_id, team.team_id, "roles_permissions_management") ||
            checkPermisson(team.team_id) ||
            checkPermissionForBoard(board.board_id, team.team_id, "role_management");

        if (!canManagePermissions) return null;

        return (
            <div className="board" key={board.board_id}>
                <Link to={`/permissions/${team.team_id}/${board.board_id}`} className="board-title">
                    <p>{board.name}</p>
                </Link>
            </div>
        );
    };

    return (
        <div className="content col-10" >
            {renderBoards()}
        </div>
    );
}
