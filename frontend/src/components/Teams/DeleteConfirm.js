import React from 'react';
import '../../styles/popup.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

const closeIcon = <FontAwesomeIcon icon={faXmark} />;

const DeleteConfirm = ({ teamID, OnClose, DeleteTeam }) => {
    function DeleteTeamConfirm(teamID) {
        DeleteTeam(teamID);
        OnClose();
    }

    return (
        <div className='overlay'>
            <div className='popup popup-mini'>
                <span className='close-btn' onClick={OnClose}>
                    {closeIcon}
                </span>
                <p className='confirmation-text'>Are you sure you want delete this team?</p>
                <div className='button-container'>
                    <button onClick={OnClose}>Cancel</button>
                    <button onClick={() => DeleteTeamConfirm(teamID)}>Delete</button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirm;
