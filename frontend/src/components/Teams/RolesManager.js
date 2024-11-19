import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import "../../styles/rolesmanager.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import ErrorWrapper from "../../ErrorWrapper";

const closeIcon = <FontAwesomeIcon icon={faXmark} />;

export default function RolesManager({
    OnClose,
    team_id,
    team_member_id,
    AddRoleToUser,
}) {
    const token = sessionStorage.getItem("token");
    const [boardsForTeam, setBoardsForTeam] = useState([]);
    const [boardIsSelected, setBoardIsSelected] = useState(false);
    const [boardRoles, setBoardRoles] = useState([]);
    const [roleIsSelected, setRoleIsSelected] = useState(false);
    const [role_id, setRoleId] = useState();
    const [board_id, setBoardID] = useState();

    const [error, setError] = useState(null);


    useEffect(() => {
        getBoards();
    }, []);

    async function getBoards() {
        try {
            const response = await axios.get("/boards", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            for (let i = 0; i < response.data.teams.length; i++) {
                if (response.data.teams[i].team_id === team_id) {
                    setBoardsForTeam(response.data.teams[i].boards);
                    break;
                }
            }
        } catch (e) {
            setError(e?.response?.data);
        }
    }

    async function GetRoles(board_id) {
        try {
            const response = await axios.get(
                `/boards/${board_id}/available-team-member-roles/${team_member_id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            window.log(response.data.roles.length);
            let newRoles = response.data.roles;
            if (response.data.roles.length === undefined) {
                newRoles = [response.data.roles[1]];
            }
            setBoardRoles(newRoles);
            window.log(newRoles);
            setBoardIsSelected(true);
        } catch (error) {
            setError(error?.response?.data);
        }
    }

    function handleAddRolesToUser() {
        AddRoleToUser(board_id, team_member_id, role_id);
        OnClose();
    }

    async function handleChange(e) {
        const selectedBoardId = e.target.value;
        if (selectedBoardId === "-1") {
            setBoardIsSelected(false);
            setRoleIsSelected(false);
            setBoardRoles([]);
            setBoardID(null);
        } else {
            await GetRoles(selectedBoardId);
            setBoardID(selectedBoardId);
            setRoleIsSelected(false);
        }
    }

    function RoleSelection(e) {
        setRoleId(e.target.value);
        setRoleIsSelected(true);
    }

    return (
        <div className="overlay" >
            <div className="popup popup-mini">
                <span className="close-btn" onClick={OnClose}>
                    {closeIcon}
                </span>
                <div className="selector-container">
                    <p>Select board:</p>
                    <select onChange={handleChange} defaultValue="-1">
                        <option value="-1" disabled>
                            Select board
                        </option>
                        {boardsForTeam.map((board) => (
                            <option key={board.board_id} value={board.board_id}>
                                {board.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="selector-container">
                    {boardIsSelected && (
                        <div>
                            <p>Select role:</p>
                            <select onChange={RoleSelection} defaultValue="-1">
                                <option value="-1" disabled>
                                    Select role
                                </option>
                                {boardRoles.length > 0 &&
                                    boardRoles.map((role) => (
                                        <option key={role.role_id} value={role.role_id}>
                                            {role.name}
                                        </option>
                                    ))}
                            </select>
                        </div>
                    )}
                </div>
                {boardIsSelected && roleIsSelected && (
                    <button className="add-button" onClick={handleAddRolesToUser}>
                        Add role to user
                    </button>
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
        </div>
    );
}
