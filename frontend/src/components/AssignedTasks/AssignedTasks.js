import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import TaskCard from "./TaskCard";
import '../../styles/taskcard.css'; // Import the CSS file for styling
import Loader from "../Loader";

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
            tempData.map((task, index) => {
                tempData[index] = task.task
            });

            tempData.map((task, index) => {
                if (task.parent_task_id !== null) {
                    tempData.splice(index, 1);
                }
            });

            console.log(tempData);
            setTasks(tempData);
        }
        catch (error) {
            console.log(error.response);
        }
    }

    return (
        <div className="content">
            {tasks.length === 0 ? <Loader /> : <div className="scrollable-container">
                {tasks.map((task, index) => (
                    <TaskCard key={index} task={task} />
                ))}
            </div>}
        </div>
    )
}
export default AssignedTasks;