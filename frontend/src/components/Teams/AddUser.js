import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';

const AddUser = ({ teamID, OnClose, AddUsers }) => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    getUsers();
  }, []);

  async function getUsers() {
    const token = sessionStorage.getItem('token');
    try {
      const response = await axios.get(`team/${teamID}/management/no_members`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data.users);
    } catch (error) {
      console.log(error.response);
    }
  }

  function toggleUserSelection(user_id) {
    if (selectedUsers.includes(user_id)) {
      setSelectedUsers(selectedUsers.filter(id => id !== user_id));
    } else {
      setSelectedUsers([...selectedUsers, user_id]);
    }
  }

  function handleAddUsers() {
    AddUsers(selectedUsers, teamID);
    OnClose();
  }

  return (
    <div className="overlay">
      <div className="popup">
        <div className="popup-content">
          <button className="close-btn" onClick={OnClose}>
            Close
          </button>
          <p>Select the users: </p>
          <table>
            <tbody>
              {users.map((user) => (
                <tr key={user.user_id} onClick={() => toggleUserSelection(user.user_id)} className={selectedUsers.includes(user.user_id) ? 'selected' : ''}>
                  <td>{user.username}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={handleAddUsers}>Add Users</button>
        </div>
      </div>
    </div>
  );
};

export default AddUser;