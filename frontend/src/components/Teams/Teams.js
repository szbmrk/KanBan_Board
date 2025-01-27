import React, { useEffect, useState, useRef } from "react";
import axios from "../../api/axios";
import TeamCard from "./TeamCard";
import TeamManager from "./TeamManager";
import Loader from "../Loader";
import Error from "../Error";
import { checkIfAdmin, SetRoles } from "../../roles/Roles";
import ErrorWrapper from "../../ErrorWrapper";
import Echo from "laravel-echo";
import {
    REACT_APP_PUSHER_KEY,
    REACT_APP_PUSHER_CLUSTER,
    REACT_APP_PUSHER_PORT,
    REACT_APP_PUSHER_HOST,
    REACT_APP_PUSHER_PATH
} from "../../api/config.js";

const Teams = () => {
    const token = sessionStorage.getItem("token");
    const user_id = sessionStorage.getItem("user_id");
    const [ownPermissions, setOwnPermissions] = useState([]);
    const [teamPermissions, setTeamPermissions] = useState([]);
    const [redirect, setRedirect] = useState(false);
    const [error, setError] = useState(false);

    const [teams, setTeams] = useState(null);
    const teamsRef = useRef(teams);
    const [manageIsClicked, setManage] = useState(false);

    useEffect(() => {
        document.title = "KanBan | Teams";
        ResetRoles();
        getTeams();
    }, []);

    useEffect(() => {
        teamsRef.current = teams;
    }, [teams]);

    useEffect(() => {
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


        const channel = echo.channel(`TeamChange`);

        channel.listen(
            `.user.${user_id}`,
            (e) => {
                handleWebSocket(e);
            },
            []
        );

        return () => {
            window.log("Cleanup");
            channel.unsubscribe();
        };
    }, []);

    const handleWebSocket = async (websocket) => {
        window.log("DATA");
        window.log(websocket.data);
        window.log(websocket.changeType);
        switch (websocket.changeType) {
            case "THIS_USER_ADDED_TO_TEAM":
                webSocketThisUserAddedToTeam(websocket.data);
                break;
            case "USER_ADDED_TO_TEAM":
                webSocketUserAddedToTeam(websocket.data);
                break;
            case "THIS_USER_DELETED_FROM_TEAM":
                webSocketThisUserDeletedFromTeam(websocket.data);
                break;
            case "USER_DELETED_FROM_TEAM":
                webSocketUserDeletedFromTeam(websocket.data);
                break;
            case "CREATED_TEAM":
                webSocketCreateTeam(websocket.data);
                break;
            case "UPDATED_TEAM":
                webSocketUpdateTeam(websocket.data);
                break;
            case "DELETED_TEAM":
                webSocketDeleteTeam(websocket.data);
                break;
            case "CREATED_USER_ROLE":
                webSocketCreateUserRole(websocket.data);
                break;
            case "DELETED_USER_ROLE":
                webSocketDeleteUserRole(websocket.data);
                break;
            case "DELETED_USER":
                webSocketDeleteUser(websocket.data);
                break;
            default:
                break;
        }
    };

    const webSocketThisUserAddedToTeam = (data) => {
        window.log("TEAM");
        window.log(teamsRef.current);
        window.log(data);
        let newTeamData = [...teamsRef.current];
        newTeamData.push(data.team);
        setTeams(newTeamData);
    };

    const webSocketUserAddedToTeam = (data) => {
        let newTeamData = [...teamsRef.current];
        newTeamData.forEach((currentTeam) => {
            if (currentTeam.team_id === data.team.team_id) {
                currentTeam.team_members.push(data.user);
            }
        });
        setTeams(newTeamData);
    };

    const webSocketThisUserDeletedFromTeam = (data) => {
        let newTeamData = [...teamsRef.current];
        newTeamData = newTeamData.filter(
            (currentTeam) => currentTeam.team_id !== data.team.team_id
        );
        setTeams(newTeamData);
    };

    const webSocketUserDeletedFromTeam = (data) => {
        let newTeamData = [...teamsRef.current];
        newTeamData.forEach((currentTeam) => {
            if (currentTeam.team_id === data.team.team_id) {
                currentTeam.team_members = currentTeam.team_members.filter(
                    (currentTeamMember) => currentTeamMember.user_id !== data.user.user_id
                );
            }
        });
        setTeams(newTeamData);
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

    const webSocketCreateUserRole = (data) => {
        let newTeamData = [...teamsRef.current];
        newTeamData.forEach((currentTeam) => {
            if (currentTeam.team_id === data.teamMember.team_id) {
                currentTeam.team_members.forEach((currentTeamMember) => {
                    if (
                        currentTeamMember.team_members_id ===
                        data.teamMember.team_members_id
                    ) {
                        currentTeamMember.roles = data.teamMember.roles;
                    }
                });
            }
        });
        setTeams(newTeamData);
    };

    const webSocketDeleteUserRole = (data) => {
        let newTeamData = [...teamsRef.current];
        newTeamData.forEach((currentTeam) => {
            if (currentTeam.team_id === data.teamMember.team_id) {
                currentTeam.team_members.forEach((currentTeamMember) => {
                    if (
                        currentTeamMember.team_members_id ===
                        data.teamMember.team_members_id
                    ) {
                        currentTeamMember.roles = currentTeamMember.roles.filter(
                            (currentRole) =>
                                currentRole.team_members_role_id !==
                                data.teamMemberRole.team_members_role_id
                        );
                    }
                });
            }
        });
        setTeams(newTeamData);
    };

    const webSocketDeleteUser = (data) => {
        let newTeamData = [...teamsRef.current];
        newTeamData.forEach((currentTeam) => {
            currentTeam.team_members = currentTeam.team_members.filter(
                (currentTeamMember) => currentTeamMember.user_id !== data.user.user_id
            );
        });
        setTeams(newTeamData);
    };

    async function ResetRoles() {
        await SetRoles(token);
    }

    function addTeam() {
        setManage(!manageIsClicked);
    }

    async function DeleteTeam(teamId) {
        try {
            await axios.delete(`/boards/teams/${teamId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        } catch (e) {
            window.log(e.response);
            if (e?.response?.status === 401 || e?.response?.status === 500) {
                setError({
                    message: "You are not logged in! Redirecting to login page...",
                });
                setRedirect(true);
            } else {
                setError(e);
            }
        }
    }

    async function AddUsers(user_ids, team_id) {
        try {
            const response = await axios.post(
                `/team/${team_id}/management`,
                { user_ids: user_ids },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        } catch (e) {
            window.log(e.response);
            if (
                e.response &&
                (e?.response?.status === 401 || e?.response?.status === 500)
            ) {
                setError({
                    message: "You are not logged in! Redirecting to login page...",
                });
                setRedirect(true);
            } else {
                setError(e);
            }
        }
    }

    async function AddTeam(teamName) {
        try {
            const response = await axios.post(
                `/boards/teams/`,
                { name: teamName },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        } catch (e) {
            window.log(e.response);
            if (e?.response?.status === 401 || e?.response?.status === 500) {
                setError({
                    message: "You are not logged in! Redirecting to login page...",
                });
                setRedirect(true);
            } else {
                setError(e);
            }
        }
    }

    async function ChangeTeamName(team_id, name) {
        try {
            const response = await axios.put(
                `/boards/teams/${team_id}`,
                { name: name },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const newTeamData = teams.map((team) => {
                if (team.team_id === team_id) {
                    team.name = name;
                }
                return team;
            });
            setTeams(newTeamData);
            window.log(response);
        } catch (e) {
            window.log(e.response);
            window.log(e);
            if (e.response?.status === 401 || e.response?.status === 500) {
                setError({
                    message: "You are not logged in! Redirecting to login page...",
                });
                setRedirect(true);
            } else {
                setError(e);
            }
        }
    }

    async function deleteUserFromTeam(team_id, user_id) {
        const token = sessionStorage.getItem("token");
        try {
            await axios.delete(`/team/${team_id}/management/${user_id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        } catch (e) {
            window.log(e.response);
            if (e.response?.status === 401 || e.response?.status === 500) {
                setError({
                    message: "You are not logged in! Redirecting to login page...",
                });
                setRedirect(true);
            } else {
                setError(e);
            }
        }
    }

    const getTeams = async () => {
        try {
            await SetRoles(token);
            if (checkIfAdmin()) {
                const response = await axios.get(`/teams`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const tempData = response.data.teams;
                window.log("TEAMS");
                window.log(response.data.teams);
                setTeams(tempData);
            }
            else {
                const response = await axios.get(`/user/${user_id}/teams`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const tempData = response.data.teams;
                window.log("TEAMS");
                window.log(response.data.teams);
                setTeams(tempData);
            }
        } catch (error) {
            setError(error?.response?.data);
        }
    };

    const handleDeleteRole = async (role_id, board_id, team_id, user_id) => {
        const token = sessionStorage.getItem("token");
        try {
            const response = await axios.delete(
                `/boards/${board_id}/team-member-roles/${role_id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            window.log(response);
            const newTeamData = teams.map((team) => {
                if (team.team_id === team_id) {
                    const newTeamMembers = team.team_members.map((member) => {
                        if (member.user_id === user_id) {
                            const newRoles = member.roles.filter(
                                (role) => role.team_members_role_id !== role_id
                            );
                            member.roles = newRoles;
                        }
                        return member;
                    });
                    team.team_members = newTeamMembers;
                }
                return team;
            });
            setTeams(newTeamData);
        } catch (error) {
            setError(error?.response?.data);
        }
    };

    async function AddRoleToUser(board_id, team_member_id, role_id) {
        try {
            const response = await axios.post(
                `/boards/${board_id}/team-member-roles`,
                { team_member_id: team_member_id, role_id: role_id },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            window.log(response);
            const newTeamMember = response.data.team_member;
            const newTeamData = teams.map((team) => {
                if (team.team_id === newTeamMember.team_id) {
                    const newTeamMembers = team.team_members.map((member) => {
                        if (member.user_id === newTeamMember.user_id) {
                            member.roles = newTeamMember.roles;
                        }
                        return member;
                    });
                    team.team_members = newTeamMembers;
                }
                return team;
            });
            setTeams(newTeamData);
        } catch (error) {
            setError(error?.response?.data);
        }
    }

    const [searchTerm, setSearchTerm] = useState("");

    const isTeamInSearch = (searchTerm, team_name) => {
        if (!searchTerm) return true;
        if (!team_name) return false;

        const normalizedSearch = searchTerm.toLowerCase().trim();
        const normalizedTeamName = team_name.toLowerCase().trim();


        return normalizedTeamName.includes(normalizedSearch);
    }

    return (
        <>
            <div className="content col-10" >
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search for a team..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {teams === null ? (
                    error ? (
                        <Error error={error} redirect={redirect} />
                    ) : (
                        <Loader data_to_load={teams} text_if_cant_load={"No teams yet!"} />
                    )
                ) : (
                    <div className="teams-container">
                        {teams.length === 0 ? (
                            <div>
                                No teams yet
                                <div className="board add-board" onClick={() => addTeam()}>
                                    <span>Add new team</span>
                                </div>
                                {manageIsClicked && (
                                    <TeamManager
                                        teamData={[]}
                                        onClose={addTeam}
                                        ChangeTeamName={ChangeTeamName}
                                        addTeam={AddTeam}
                                    />
                                )}
                            </div>
                        ) : (
                            <>
                                {teams.map((team, index) => (
                                    isTeamInSearch(searchTerm, team.name) &&
                                    <TeamCard
                                        key={index}
                                        data={team}
                                        deleteUserFromTeam={deleteUserFromTeam}
                                        ChangeTeamName={ChangeTeamName}
                                        AddUsers={AddUsers}
                                        DeleteTeam={DeleteTeam}
                                        ownPermissions={ownPermissions}
                                        teamPermissions={teamPermissions}
                                        AddRoleToUser={AddRoleToUser}
                                        handleDeleteRole={handleDeleteRole}
                                    />
                                ))}

                                <div className="board add-board" onClick={() => addTeam()}>
                                    <span>Add new team</span>
                                </div>
                                {manageIsClicked && (
                                    <TeamManager
                                        teamData={[]}
                                        onClose={addTeam}
                                        ChangeTeamName={ChangeTeamName}
                                        addTeam={AddTeam}
                                    />
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
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

export default Teams;
