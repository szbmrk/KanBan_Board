import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import TaskCard from './TaskCard';
import Loader from '../Loader';
import Error from '../Error';

const AssignedTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [redirect, setRedirect] = useState(false);
    const [error, setError] = useState(false);

    const token = sessionStorage.getItem('token');
    const user_id = sessionStorage.getItem('user_id');

    useEffect(() => {
        document.title = 'Assigned Tasks';
        getAssignedTasks();
    }, []);

    const getAssignedTasks = async () => {
        try {
            const response = await axios.get(`/user/${user_id}/tasks`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const tempData = response.data.assigned_tasks;
            tempData.map((task, index) => {
                tempData[index] = task.task;
            });

            tempData.map((task, index) => {
                if (task.parent_task_id !== null) {
                    tempData.splice(index, 1);
                }
            });

            console.log(tempData);
            setTasks(tempData);
        } catch (e) {
            console.log(e.response);
            if (e.response.status === 401 || e.response.status === 500) {
                setError('You are not logged in! Redirecting to login page...');
                setRedirect(true);
            } else {
                setError(e.message);
            }
        }
    };

    return (
        <div className='content'>
            {tasks.length === 0 ? (
                error ? (
                    <Error error={error} redirect={redirect} />
                ) : (
                    <Loader />
                )
            ) : (
                <div className='scrollable-container'>
                    {tasks.map((task, index) => (
                        <TaskCard key={index} task={task} />
                    ))}
                </div>
            )}
        </div>
    );
};
export default AssignedTasks;
