import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import Loader from '../Loader';

const closeIcon = <FontAwesomeIcon icon={faXmark} />;

const AddUser = ({ teamID, OnClose, AddUsers }) => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [needLoader, setNeedLoader] = useState(false);

  useEffect(() => {
    setNeedLoader(true);
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
      setNeedLoader(false);
    } catch (error) {
      console.log(error.response);
    }
  }

  function toggleUserSelection(user_id) {
    if (selectedUsers.includes(user_id)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== user_id));
    } else {
      setSelectedUsers([...selectedUsers, user_id]);
    }
  }

  function handleAddUsers() {
    AddUsers(selectedUsers, teamID);
    OnClose();
  }

  return (
    <div className='overlay'>
      <div className='popup popup-mini'>
        <span className='close-btn' onClick={OnClose}>
          {closeIcon}
        </span>
        <p className='confirmation-text'>Select Users to Add: </p>
        {needLoader ?
          <Loader /> :
          users.length === 0 ? (
            <div>
              <p>No users to add</p>
            </div>
          ) : (
            <div className='user-select'>
              {users.map((user) => (
                <div
                  key={user.user_id}
                  onClick={() => toggleUserSelection(user.user_id)}
                  className={selectedUsers.includes(user.user_id) ? 'selected' : ''}
                >
                  <p>{user.username}</p>
                </div>
              ))}
            </div>
          )
        }
        <button className='add-button' onClick={handleAddUsers}>
          Add Users
        </button>
      </div>
    </div>
  );
};

export default AddUser;
