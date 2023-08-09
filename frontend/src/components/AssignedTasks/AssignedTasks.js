import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import TaskCard from "./TaskCard";
import '../../styles/taskcard.css'; // Import the CSS file for styling

const AssignedTasks = () => {
    const [tasks, setTasks] = useState([]);
    useEffect(() => {
        getAssignedTasks();

    }, []);

    const getAssignedTasks = async () => {
        const token = sessionStorage.getItem('token');
        const user_id = sessionStorage.getItem('user_id');

        try {
            const response = await axios.get(`/user/${user_id}/tasks`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const tempData = response.data.assigned_tasks;
            tempData.map((task, index) => tempData[index] = task.task);
            tempData.map((task) => {
                console.log(task.subtasks);
            });

            setTasks(tempData);

            console.log(tempData);
        }
        catch (error) {
            console.log(error.response);
        }
    }

    return (
        <div className="content scrollable-container">
            {tasks.map((task, index) => (
                task.parent_task_id === null ? <TaskCard key={index} task={task} /> : <></>
            ))}
        </div>
    )
}
export default AssignedTasks;