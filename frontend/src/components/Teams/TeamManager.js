import React from "react";
import axios from "../../api/axios";
import { useEffect, useState } from "react";
import "../../styles/popup.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const TeamManager = ({ teamData, onClose, ChangeTeamName, addTeam }) => {
    const [teamName, setTeamName] = useState("");
    const [addedUsers, setAddedUsers] = useState([]);

    const closeIcon = <FontAwesomeIcon icon={faXmark} />;


    useEffect(() => {
        if (teamData.length !== 0) {
            setTeamName(teamData.name);
        }
    }, []);

    async function SubmitTeamName(e) {
        e.preventDefault();
        ChangeTeamName(teamData.team_id, teamName);
        onClose();
    }

    async function AddTeam(e) {
        e.preventDefault();
        addTeam(teamName);
        onClose();
    }

    const handleInputChange = (e) => {
        setTeamName(e.target.value);
    };

    return (
        <>
            {teamData.length !== 0 ? (
                <div className="overlay darken" >
                    <div className="popup popup-mini">
                        <form className="popup-content-form-mini" onSubmit={SubmitTeamName}>
                            <span className="close-btn" onClick={onClose}>
                                {closeIcon}
                            </span>
                            {teamData.team_id ? (
                                <h4>Edit team name:</h4>
                            ) : (
                                <h4>New team name:</h4>
                            )}
                            <input
                                type="text"
                                maxLength={255}
                                value={teamName}
                                onChange={handleInputChange}
                                placeholder="Team name"
                                className="popup-input-mini"
                                required
                            />
                            <button className="board-save-button" type="submit">
                                Save
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="overlay darken">
                    <div className="popup popup-mini">
                        <form className="popup-content-form-mini" onSubmit={AddTeam}>
                            <span className="close-btn" onClick={onClose}>
                                {closeIcon}
                            </span>
                            <h4>New team name:</h4>
                            <input
                                type="text"
                                maxLength={255}
                                value={teamName}
                                onChange={handleInputChange}
                                placeholder="Team name"
                                className="popup-input-mini"
                                required
                            />
                            <button className="board-save-button" type="submit">
                                Save
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default TeamManager;
