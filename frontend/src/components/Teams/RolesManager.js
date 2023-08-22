import React, { useEffect, useState } from 'react'
import axios from '../../api/axios';


export default function RolesManager( {OnClose, team_id, team_member_id} ) {
    const token = sessionStorage.getItem('token');
    const [boardsForTeam, setBoardsForTeam] = useState([]);
    const [boardIsSelected, setBoardIsSelected] = useState(false);
    const [boardRoles, setBoardRoles] = useState([]);
    const[role_id, setRoleId] = useState();
    const[board_id, setBoardID] = useState();

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

async function GetRoles(board_id){
    try {
        const response = await axios.get(`/boards/${board_id}/team-member-roles`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        setBoardRoles(response.data.roles);
        console.log(response.data.roles);
} catch (error) {
    console.log(error);
}
}

async function AddRoleToUser(){
    try {
        const response = await axios.post(`/boards/${board_id}/team-member-roles`, {team_member_id: team_member_id,
             role_id: role_id},
            {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        console.log(response);
    }
    catch (error) {
        console.log(error);
    }
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
        <div className="overlay">
          <div className='popup'>
            <div className="popup-content">
              <button className="close-btn" onClick={ OnClose }>
                Close
              </button>
              <p>Select board:</p>
                <select onChange={handleChange}>
                    <option value= "-1" inactive >Select board</option>
                    {boardsForTeam.map((board) => (
                        <option value={board.board_id}>{board.name}</option>
                    ))}
                </select>
                {boardIsSelected &&
                    (
                        <div>
                            <p>Select role:</p>
                            <select onChange={RoleSelection}>
                                <option value= "-1" >Select role</option>
                                {boardRoles.map((role) => (
                                    <option value={role.role_id}>{role.name}</option>
                                ))}
                            </select>
                        </div>
                    )
                }
              <button onClick={AddRoleToUser}>Add role to user</button>
            </div>
          </div>
        </div>
      )
    }
