import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import TeamCard from "./TeamCard";
import TeamManager from "./TeamManager";
import '../../styles/popup.css';

const Teams = () => {
  const [teams, setTeams] = useState([]);
    const [manageIsClicked, setManage] = useState(false);
  useEffect(() => {
    getTeams();

  }, []);

  function addTeam()
  {
      setManage(!manageIsClicked);
  }

  const getTeams = async () => {

    const token = sessionStorage.getItem('token');
        const user_id = sessionStorage.getItem('user_id');

        try {
            const response = await axios.get(`/user/${user_id}/teams`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const tempData = response.data.teams;
            console.log(tempData);
            setTeams(tempData);
        }
        catch (error) {
            console.log(error.response);
        }

  }
  return (
    <div className="scrollable-container">
        {teams.map((team, index) => (
                <TeamCard key={index} data={team} />
            ))}
          <button onClick={addTeam}>Add team</button>
          {manageIsClicked && 
            <TeamManager teamData={[]} onClose={addTeam} />
      }
    </div>
  )}

  export default Teams;