import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import '../../styles/rolesmanager.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

const closeIcon = <FontAwesomeIcon icon={faXmark} />;

export default function RolesManager({ OnClose, team_id, team_member_id, AddRoleToUser }) {
    const token = sessionStorage.getItem('token');
    const [boardsForTeam, setBoardsForTeam] = useState([]);
    const [boardIsSelected, setBoardIsSelected] = useState(false);
    const [boardRoles, setBoardRoles] = useState([]);
    const [role_id, setRoleId] = useState();
    const [board_id, setBoardID] = useState();

    useEffect(() => {
        getBoards();
    }, []);

    async function getBoards() {
        try {
            const response = await axios.get('/dashboard', {
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
            console.error(e);
        }
    }

    async function GetRoles(board_id) {
        try {
            const response = await axios.get(`/boards/${board_id}/available-team-member-roles/${team_member_id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setBoardRoles(response.data.roles);
            console.log(response.data);
        } catch (error) {
            console.log(error);
        }
    }

    function handleAddRolesToUser() {
        AddRoleToUser(board_id, team_member_id, role_id);
        OnClose();
    }

    function handleChange(e) {
        GetRoles(e.target.value);
        setBoardIsSelected(true);
        setBoardID(e.target.value);
    }

    function RoleSelection(e) {
        setRoleId(e.target.value);
    }

    return (
        <div className='overlay'>
            <div className='popup popup-mini'>
                <span className='close-btn' onClick={OnClose}>
                    {closeIcon}
                </span>
                <div className='selector-container'>
                    <p>Select board:</p>
                    <select onChange={handleChange}>
                        <option value='-1' inactive>
                            Select board
                        </option>
                        {boardsForTeam.map((board) => (
                            <option value={board.board_id}>{board.name}</option>
                        ))}
                    </select>
                </div>
                {boardIsSelected && (
                    <div className='selector-container'>
                        <p>Select role:</p>
                        <select onChange={RoleSelection}>
                            <option value='-1'>Select role</option>
                            {boardRoles.map((role) => (
                                <option value={role.role_id}>{role.name}</option>
                            ))}
                        </select>
                    </div>
                )}
                <button className='add-button' onClick={handleAddRolesToUser}>
                    Add role to user
                </button>
            </div>
        </div>
    );
}
