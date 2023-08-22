import React, { useEffect, useState } from 'react'
import axios from '../../api/axios';


export default function RolesManager( {OnClose, team_id} ) {
    const token = sessionStorage.getItem('token');

    const [boardsForTeam, setBoardsForTeam] = useState([]);

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
        console.log(response.data);
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
        console.log(response);
} catch (error) {
    console.log(error);
}
}

function handleChange(e) {
    GetRoles(e.target.value);    
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
                    {boardsForTeam.map((board) => (
                        <option value={board.board_id}>{board.name}</option>
                    ))}
                </select>
                {
                    (
                        <div>
                            <p>Select role:</p>
                            <select>
                                <option value="team_member">Team member</option>
                                <option value="team_manager">Team manager</option>
                            </select>
                        </div>
                    )
                }
              <button>Add Users</button>
            </div>
          </div>
        </div>
      )
    }
