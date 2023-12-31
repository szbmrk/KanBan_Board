import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import Loader from '../Loader';
import ErrorWrapper from "../../ErrorWrapper";

const closeIcon = <FontAwesomeIcon icon={faXmark} />;

const AddUser = ({ teamID, OnClose, AddUsers }) => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [needLoader, setNeedLoader] = useState(false);
  const [search, setSearch] = useState('');
  const [searchedUserList, setSearchedUserList]=useState([]);
  const [searchButtonClicked, setSearchButtonClicked] = useState(false);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(sessionStorage.getItem("darkMode"));

  useEffect(() => {
    setNeedLoader(true);
    getUsers();
      //ez
      const ResetTheme = () => {
        setTheme(sessionStorage.getItem("darkMode"))
    }


    console.log("Darkmode: " + sessionStorage.getItem("darkMode"))
    window.addEventListener('ChangingTheme', ResetTheme)

    return () => {
        window.removeEventListener('ChangingTheme', ResetTheme)
    }
    //eddig
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
      console.log(response.data.users);
      setNeedLoader(false);
    } catch (error) {
        setError(error.response.data);
    }
  }

  function toggleUserSelection(user_id) {
    if (selectedUsers.includes(user_id)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== user_id));
    } else {
      setSelectedUsers([...selectedUsers, user_id]);
    }
  }

  function handleSearchUsers(e){
    setSearch(e.target.value);
    console.log(e.target.value);
  }

  function handleAddUsers() {
    AddUsers(selectedUsers, teamID);
    OnClose();
  }
function handleSearchButton(){
    
    const tempSearchedUserList=(users.filter(
      user=>{
        return user.username.toLowerCase().includes(search.toLowerCase());
      }
    )
    )
    setSearchedUserList(tempSearchedUserList);
    setSearchButtonClicked(true);
  }

  return (
    <div className='overlay' data-theme={theme}>
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
          ) :
           !searchButtonClicked ? (
            <div className='user-select'>
              <input className='searchInputCard' name='searchInput' onChange={handleSearchUsers} placeholder='Search users...'/>
              <button className='searchButtonCard' onClick={handleSearchButton}>Search</button>
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
          ) :
          (
            <div className='user-select'>
            <input name='searchInput' onChange={handleSearchUsers} placeholder='Search users...'/>
            <button onClick={handleSearchButton}>Search</button>
            {searchedUserList.map((user) => (
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
      {error && (
        <ErrorWrapper originalError={error} onClose={() => {setError(null);}}/>
      )}
    </div>
  );
};

export default AddUser;
