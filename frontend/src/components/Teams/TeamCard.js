import React, { useState } from 'react';
import axios from '../../api/axios';
import TeamManager from './TeamManager';

const TeamCard = ({ data }) => {

  const [manageIsClicked, setManage] = useState(false);
  const [teamData, setTeamData]=useState([]);

  async function ManageTeam() {
      setTeamData(data);
      setManage(!manageIsClicked);
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2>{data.name}</h2>
        <p>Created by User {data.created_by}</p>
      </div>
      <div className="card-content">
        <p>Created at: {data.created_at}</p>
        <p>Team ID: {data.team_id}</p>
        <p>Parent Team ID: {data.parent_team_id !== null ? data.parent_team_id : 'None'}</p>
        <h3>Team Members:</h3>
        <ul>
          {data.team_members.map((member, index) => (
            <li key={index}>User {member.user_id}</li>
          ))}
        </ul>
        {data.created_by === data.pivot.user_id ? <button onClick={ManageTeam}>Manage team</button> : <></>}
      </div>
      {manageIsClicked && 
        <TeamManager teamData={teamData} onClose={ManageTeam} />
      }
    </div>
  );
};

export default TeamCard;