import React, { useEffect, useState, useRef } from "react";
import axios from "../../api/axios";
import TeamCard from "./TeamCard";
import TeamManager from "./TeamManager";
import Loader from "../Loader";
import Error from "../Error";
import { SetRoles } from "../../roles/Roles";
import ErrorWrapper from "../../ErrorWrapper";
import Echo from "laravel-echo";
import {
  REACT_APP_PUSHER_KEY,
  REACT_APP_PUSHER_CLUSTER,
} from "../../api/config.js";

const Teams = () => {
  const token = sessionStorage.getItem("token");
  const user_id = sessionStorage.getItem("user_id");
  const [ownPermissions, setOwnPermissions] = useState([]);
  const [teamPermissions, setTeamPermissions] = useState([]);
  const [redirect, setRedirect] = useState(false);
  const [error, setError] = useState(false);

  const [teams, setTeams] = useState([]);
  const teamsRef = useRef(teams);
  const [manageIsClicked, setManage] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("darkMode"));

  useEffect(() => {
    document.title = "KanBan | Teams";
    getTeams();
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

  useEffect(() => {
    teamsRef.current = teams;
    ResetRoles();
  }, [teams]);

  useEffect(() => {
    window.Pusher = require("pusher-js");
    window.Pusher.logToConsole = true;

    const echo = new Echo({
      broadcaster: "pusher",
      key: REACT_APP_PUSHER_KEY,
      cluster: REACT_APP_PUSHER_CLUSTER,
      forceTLS: true,
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
      console.log("Cleanup");
      channel.unsubscribe();
    };
  }, []);

  const handleWebSocket = async (websocket) => {
    console.log("DATA");
    console.log(websocket.data);
    console.log(websocket.changeType);
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
    console.log("TEAM");
    console.log(teamsRef.current);
    console.log(data);
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
      await axios.delete(`/dashboard/teams/${teamId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (e) {
      console.log(e.response);
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
      console.log(e.response);
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
        `/dashboard/teams/`,
        { name: teamName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (e) {
      console.log(e.response);
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
        `/dashboard/teams/${team_id}`,
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
      console.log(response);
    } catch (e) {
      console.log(e.response);
      console.log(e);
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
      console.log(e.response);
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
      const response = await axios.get(`/user/${user_id}/teams`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const tempData = response.data.teams;
      console.log("TEAMS");
      console.log(response.data.teams);
      setTeams(tempData);
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
      console.log(response);
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
      console.log(response);
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

  return (
    <>
      <div className="content col-10" data-theme={theme}>
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
