import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import Loader from "../Loader";
import ErrorWrapper from "../../ErrorWrapper";

const closeIcon = <FontAwesomeIcon icon={faXmark} />;

const AddUser = ({ teamID, OnClose, AddUsers }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [needLoader, setNeedLoader] = useState(false);

  const [error, setError] = useState(null);
  const [filterText, setFilterText] = useState("");
  const [usersLoaded, setUsersLoaded] = useState(false);

  useEffect(() => {
    setNeedLoader(true);
    getUsers();
  }, []);

  async function getUsers() {
    const token = sessionStorage.getItem("token");
    try {
      const response = await axios.get(`team/${teamID}/management/no_members`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("users!!!");
      console.log(response.data.users);
      setUsers(response.data.users);
      setFilteredUsers(response.data.users);
      setNeedLoader(false);
      setUsersLoaded(true);
    } catch (error) {
      setError(error?.response?.data);
    }
  }

  function toggleUserSelection(user_id) {
    if (selectedUsers.includes(user_id)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== user_id));
    } else {
      setSelectedUsers([...selectedUsers, user_id]);
    }
  }

  function handleFilterChange(e) {
    const searchText = e.target.value.toLowerCase();
    setFilterText(searchText);

    const filtered = users.filter(
      (user) =>
        user.username.toLowerCase().includes(searchText) ||
        user.email.toLowerCase().includes(searchText)
    );
    setFilteredUsers(filtered);
  }

  function handleAddUsers() {
    AddUsers(selectedUsers, teamID);
    OnClose();
  }

  return (
    <div className="overlay">
      <div className="popup add-user-popup">
        <span className="close-btn" onClick={OnClose}>
          {closeIcon}
        </span>
        <p className="confirmation-text">Select Users to Add: </p>
        <div>
          <p>Filter by Username:</p>
          <input
            disabled={!usersLoaded}
            className="filter-input"
            type="text"
            placeholder="Search users..."
            value={filterText}
            onChange={handleFilterChange}
          />
        </div>
        {needLoader ? (
          <Loader />
        ) : filteredUsers.length === 0 ? (
          <div>
            <p>No users to add</p>
          </div>
        ) : (
          <div className="user-select">
            {filteredUsers.map((filteredUser) => (
              <div
                key={filteredUser.user_id}
                onClick={() => toggleUserSelection(filteredUser.user_id)}
                className={
                  selectedUsers.includes(filteredUser.user_id) ? "selected" : ""
                }
              >
                <p title={`${filteredUser.username}\n${filteredUser.email}`}>
                  {filteredUser.username.length < 17
                    ? filteredUser.username
                    : filteredUser.username.slice(0, 14) + " ..."}
                  <br />
                  {filteredUser.email.length < 17
                    ? filteredUser.email
                    : filteredUser.email.slice(0, 14) + " ..."}
                </p>
              </div>
            ))}
          </div>
        )}
        <button
          className="add-button"
          disabled={selectedUsers.length === 0}
          onClick={handleAddUsers}
          style={{
            marginTop: "10px",
            marginBottom: "10px",
            width: "100%",
            height: "40px",
          }}
        >
          Add Users
        </button>
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
};

export default AddUser;
