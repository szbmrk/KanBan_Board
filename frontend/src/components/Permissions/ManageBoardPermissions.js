import { useEffect, useState } from "react";
import "../../styles/dashboard.css";
import axios from "../../api/axios";
import { Link } from "react-router-dom";
import Loader from "../Loader";
import { SetRoles, checkPermissionForBoard } from "../../roles/Roles";
import Error from "../Error";
import { checkPermisson } from "../../roles/Roles";

export default function ManageBoardPermissions() {
    const [userID, setUserID] = useState(null);
    const [teams, setTeams] = useState(null);
    const [error, setError] = useState(false);
    const [redirect, setRedirect] = useState(false);

    const token = sessionStorage.getItem("token");
    const user_id = sessionStorage.getItem("user_id");

    const [theme, setTheme] = useState(localStorage.getItem("darkMode"));

    useEffect(() => {
        document.title = "KanBan | Permissions";
        if (user_id) {
            setUserID(user_id);
        }
        //backendről fetchelés
        fetchDashboardData();
        //ez
        const ResetTheme = () => {
            setTheme(localStorage.getItem("darkMode"));
        };

        console.log("Darkmode: " + localStorage.getItem("darkMode"));
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
            console.log(response.data);
            const teamData = response.data.teams;
            console.log(teamData);
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

    return (
        <div className="content col-10" data-theme={theme}>
            {teams === null ? (
                error ? (
                    <Error error={error} redirect={redirect}></Error>
                ) : (
                    <Loader
                        data_to_load={teams}
                        text_if_cant_load={"No boards found to manage!"}
                    />
                )
            ) : (
                <>
                    <h1 className="header">Boards you can manage</h1>
                    {teams.length === 0 ? (
                        <p className="text">No boards found to manage!</p>
                    ) : (
                        userID && (
                            <div>
                                <div className="teams">
                                    {teams.map(
                                        (team) =>
                                            team.boards.length > 0 && (
                                                <div className="team" key={team.team_id}>
                                                    <h3 className="team-title">{team.name}</h3>
                                                    <div className="boards">
                                                        {team.boards.map(
                                                            (board) =>
                                                                (checkPermissionForBoard(
                                                                    board.board_id,
                                                                    team.team_id,
                                                                    "roles_permissions_management"
                                                                ) ||
                                                                    checkPermisson(team.team_id) ||
                                                                    checkPermissionForBoard(
                                                                        board.board_id,
                                                                        team.team_id,
                                                                        "role_management"
                                                                    )) && (
                                                                    <div className="board" key={board.board_id}>
                                                                        <Link
                                                                            to={`/permissions/${team.team_id}/${board.board_id}`}
                                                                            className="board-title"
                                                                        >
                                                                            <p>{board.name}</p>
                                                                        </Link>
                                                                    </div>
                                                                )
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                    )}
                                </div>
                            </div>
                        )
                    )}
                </>
            )}
        </div>
    );
}
