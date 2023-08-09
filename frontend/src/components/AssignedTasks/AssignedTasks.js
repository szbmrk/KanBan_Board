import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import TaskCard from "./TaskCard";

const AssignedTasks = () =>
{
    const [tasks, setTasks] = useState([]);
    useEffect(() =>
    {
        getAssignedTasks();
        
    },[]);
    
    const getAssignedTasks = async () =>
    {
            const token = sessionStorage.getItem('token');
            const user_id = sessionStorage.getItem('user_id');
    
            try {
                const response = await axios.get(`/user/${user_id}/tasks`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                setTasks(response.data.assigned_tasks);
                console.log(response.data.assigned_tasks);
            }
            catch(error)
            {
                console.log("Error");
            }
    }

    return(
        <div></div>
    )
}
export default AssignedTasks;