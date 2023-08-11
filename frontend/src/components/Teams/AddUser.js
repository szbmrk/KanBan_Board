import React from 'react'
import '../../styles/teams.css'; // Import the CSS file for styling
import axios from '../../api/axios';
import { useEffect, useState } from 'react';


const AddUser = ({ teamID, OnClose }) => {

    const [users, SetUsers]=useState([]);
    const[usersToTeams, SetUsersToTeams]=useState([]);


    useEffect(() => {
          getUsers();
      }, []);

    async function StoreUsers() {
        const token = sessionStorage.getItem('token');
      try{
        const response = await axios.post(`/team/${teamID}/management`, {user_ids: usersToTeams},
        {
        headers: {
          Authorization: `Bearer ${token}`,
        }
        });
      console.log(response); 
      }
      catch(error)
      {
        console.log(error.response);
      }
      //window.location.reload();
      }

      async function getUsers()
    {
        const token = sessionStorage.getItem('token');
        try {
            const response = await axios.get(`team/${teamID}/management/no_members`,
            {
                headers: {
                  Authorization: `Bearer ${token}`,
                }
              });
            SetUsers(response.data.users);
            }
            catch(error)
            {
                console.log(error.response);
            }
        
    }

    function AddUser(e)
    {
        SetUsersToTeams(prevUsers =>[...prevUsers, e.target.id]);
    }

  return (
    <div className="overlay">
      <div className='popup'> 
        <div className="popup-content">
          <button className="close-btn" onClick = {OnClose}>
            Close
          </button>
            <p>Are you sure you want delete this team?</p>
          <table>
            <tbody>
                {users.map((user) => (
                <tr>
                <td id={user.user_id} onClick={AddUser}>
                    {user.username}
                </td>
                </tr>
            ))}
            </tbody>
          </table>
          <button onClick={StoreUsers}>Add Users</button>
        </div>
      </div>
      </div>
  )
}

export default AddUser;

