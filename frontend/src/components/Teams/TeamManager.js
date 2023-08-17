import React from 'react';
import axios from '../../api/axios';
import { useEffect, useState } from 'react';

const TeamManager = ({ teamData, onClose, ChangeTeamName, addTeam }) => {
    const [teamName, setTeamName] = useState('');
    const [addedUsers, setAddedUsers] = useState([]);

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
                <div className='overlay'>
                    <div className='popup'>
                        <div className='popup-content'>
                            <button className='close-btn' onClick={onClose}>
                                Close
                            </button>
                            <form onSubmit={SubmitTeamName}>
                                <table>
                                    <tbody>
                                        <tr>
                                            <td>Team name:</td>
                                            <td>
                                                <input type='text' value={teamName} onChange={handleInputChange} />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <button className='delete-button-popup' type='submit'>
                                    Apply
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            ) : (
                <div className='overlay'>
                    <div className='popup'>
                        <div className='popup-content'>
                            <button className='close-btn' onClick={onClose}>
                                Close
                            </button>
                            <form onSubmit={AddTeam}>
                                <table>
                                    <tbody>
                                        <tr>
                                            <td>Team name:</td>
                                            <td>
                                                <input type='text' value={teamName} onChange={handleInputChange} />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <button className='delete-button-popup' type='submit'>
                                    Apply
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TeamManager;
