import React, { useEffect, useState } from "react";
import axios from "../../api/axios";

const Teams = () => {
  const [teams, setTeams] = useState([]);
  useEffect(() => {
    getTeams();

  }, []);

  const getTeams = async () => {

    const token = sessionStorage.getItem('token');
        const user_id = sessionStorage.getItem('user_id');

        try {
            const response = await axios.get(`/user/${user_id}/teams`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const tempData = response;
            console.log(tempData);
            setTeams(tempData);
        }
        catch (error) {
            console.log(error.response);
        }

  }
  return (
    <div>
       
    </div>
  )}

  export default Teams;