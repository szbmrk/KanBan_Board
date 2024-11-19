import React, { useEffect, useRef, useState } from "react";
import axios from "../../api/axios";
import TaskCard from "./TaskCard";
import Loader from "../Loader";
import Error from "../Error";
import Echo from "laravel-echo";
import {
    REACT_APP_PUSHER_KEY,
    REACT_APP_PUSHER_CLUSTER,
    REACT_APP_PUSHER_PORT,
    REACT_APP_PUSHER_HOST,
    REACT_APP_PUSHER_PATH
} from "../../api/config.js";

const AssignedTasks = () => {

    const [tasks, setTasks] = useState(null);
    const tasksRef = useRef(tasks);
    const [redirect, setRedirect] = useState(false);
    const [error, setError] = useState(false);

    const token = sessionStorage.getItem("token");
    const user_id = sessionStorage.getItem("user_id");

    useEffect(() => {
        tasksRef.current = tasks;
    }, [tasks]);

    useEffect(() => {
        window.Pusher = require("pusher-js");
        window.Pusher.logToConsole = true;

        const echo = new Echo({
            broadcaster: "pusher",
            key: REACT_APP_PUSHER_KEY,
            cluster: REACT_APP_PUSHER_CLUSTER,
            wsHost: REACT_APP_PUSHER_HOST || window.location.hostname,
            wsPort: REACT_APP_PUSHER_PORT || 6001,
            wssPort: 443,
            wsPath: REACT_APP_PUSHER_PATH || '',
            enableStats: false,
            forceTLS: false,
            enabledTransports: ["ws", "wss"],
        });

        const channel = echo.channel(`AssignedTaskChange`);

        channel.listen(
            `.user.${user_id}`,
            (e) => {
                handleWebSocket(e);
            },
            []
        );

        return () => {
            window.log("Cleanup");
            channel.unsubscribe();
        };
    }, []);

    const handleWebSocket = async (websocket) => {
        window.log("DATA");
        window.log(websocket.data);
        switch (websocket.changeType) {
            case "ASSIGNED_TO_TASK":
                webSocketAssignedToTask(websocket.data);
                break;
            case "CREATED_SUBTASK_FOR_ASSIGNED_TASK":
                webSocketCreatedSubtaskForAssignedTask(websocket.data);
                break;
            case "DELETED_SUBTASK_FOR_ASSIGNED_TASK":
                webSocketDeletedSubtaskForAssignedTask(websocket.data);
                break;
            case "UPDATED_ASSIGNED_TASK_OR_SUBTASK":
                webSocketUpdatedAssignedTask(websocket.data);
                break;
            case "UNASSIGNED_FROM_TASK":
                webSocketUnassignedFromTask(websocket.data);
                break;
            case "CREATED_TASK_TAG":
                webSocketCreateTaskTag(websocket.data);
                break;
            case "DELETED_TASK_TAG":
                webSocketDeleteTaskTag(websocket.data);
                break;
            case "UPDATED_TAG":
                webSocketUpdateTag(websocket.data);
                break;
            case "DELETED_TAG":
                webSocketDeleteTag(websocket.data);
                break;
            case "CREATED_COMMENT":
                webSocketCreateComment(websocket.data);
                break;
            case "DELETED_COMMENT":
                webSocketDeleteComment(websocket.data);
                break;
            case "CREATED_ATTACHMENT":
                webSocketCreateAttachment(websocket.data);
                break;
            case "DELETED_ATTACHMENT":
                webSocketDeleteAttachment(websocket.data);
                break;
            case "CREATED_MULTIPLE_ATTACHMENT":
                webSocketCreateMultipleAttachment(websocket.data);
                break;
            default:
                break;
        }
    };

    const webSocketAssignedToTask = async (data) => {
        const newTaskData = [...tasksRef.current];
        newTaskData.push(data.task);
        setTasks(newTaskData);
    };

    const webSocketCreatedSubtaskForAssignedTask = async (data) => {
        const newTaskData = [...tasksRef.current];
        newTaskData.forEach((currentTask) => {
            if (currentTask.task_id === data.subtask.parent_task_id) {
                if (currentTask.subtasks) {
                    currentTask.subtasks.push(data.subtask);
                } else {
                    currentTask.subtasks = [data.subtask];
                }
            }
        });
        setTasks(newTaskData);
    };

    const webSocketDeletedSubtaskForAssignedTask = async (data) => {
        const newTaskData = [...tasksRef.current];
        newTaskData.forEach((currentTask) => {
            if (currentTask.task_id === data.subtask.parent_task_id) {
                currentTask.subtasks = currentTask.subtasks.filter(
                    (currentSubtask) => currentSubtask.task_id !== data.subtask.task_id
                );
            }
        });
        setTasks(newTaskData);
    };

    const webSocketUpdatedAssignedTask = async (data) => {
        const updatedTasks = updateTask(
            tasksRef.current,
            data.task.task_id,
            data.task
        );
        setTasks(updatedTasks);
    };

    const updateTask = (tasks, taskId, newData) => {
        return tasks.map((task) => {
            if (task.task_id === taskId) {
                // If the task_id matches, update the task with new data
                return { ...task, ...newData };
            } else if (task.subtasks) {
                // If the task has subtasks, recursively update them
                const updatedSubtasks = updateTask(task.subtasks, taskId, newData);
                // Return the updated task with updated subtasks
                return { ...task, subtasks: updatedSubtasks };
            }
            // If the task_id doesn't match and there are no subtasks, return the original task
            return task;
        });
    };

    const webSocketUnassignedFromTask = async (data) => {
        let newTaskData = [...tasksRef.current];
        newTaskData = newTaskData.filter(
            (currentTask) => currentTask.task_id !== data.task.task_id
        );
        setTasks(newTaskData);
    };

    const webSocketCreateTaskTag = async (data) => {
        let newTaskData = [...tasksRef.current];
        newTaskData.forEach((currentTask) => {
            if (currentTask.task_id === data.task.task_id) {
                if (currentTask.tags) {
                    currentTask.tags.push(data.tag);
                } else {
                    currentTask.tags = [data.tag];
                }
            }
        });
        setTasks(newTaskData);
    };

    const webSocketDeleteTaskTag = async (data) => {
        let newTaskData = [...tasksRef.current];
        newTaskData.forEach((currentTask) => {
            if (currentTask.task_id === data.task.task_id) {
                currentTask.tags = currentTask.tags.filter(
                    (currentTag) => currentTag.tag_id !== data.tag.tag_id
                );
            }
        });
        setTasks(newTaskData);
    };

    const webSocketUpdateTag = async (data) => {
        let newTaskData = [...tasksRef.current];
        newTaskData.forEach((currentTask) => {
            if (currentTask.tags) {
                currentTask.tags = currentTask.tags.map((currentTag) => {
                    if (currentTag.tag_id === data.tag.tag_id) {
                        return { ...currentTag, ...data.tag };
                    }
                    return currentTag;
                });
            }
        });
        setTasks(newTaskData);
    };

    const webSocketDeleteTag = async (data) => {
        let newTaskData = [...tasksRef.current];
        newTaskData.forEach((currentTask) => {
            currentTask.tags = currentTask.tags.filter(
                (currentTag) => currentTag.tag_id !== data.tag.tag_id
            );
        });
        setTasks(newTaskData);
    };

    const webSocketCreateComment = async (data) => {
        let newTaskData = [...tasksRef.current];
        newTaskData.forEach((currentTask) => {
            if (currentTask.task_id === data.task.task_id) {
                if (currentTask.comments) {
                    currentTask.comments.push(data.comment);
                } else {
                    currentTask.comments = [data.comment];
                }
            }
        });
        setTasks(newTaskData);
    };

    const webSocketDeleteComment = async (data) => {
        let newTaskData = [...tasksRef.current];
        newTaskData.forEach((currentTask) => {
            if (currentTask.task_id === data.task.task_id) {
                currentTask.comments = currentTask.comments.filter(
                    (currentComment) =>
                        currentComment.comment_id !== data.comment.comment_id
                );
            }
        });
        setTasks(newTaskData);
    };

    const webSocketCreateAttachment = async (data) => {
        let newTaskData = [...tasksRef.current];
        newTaskData.forEach((currentTask) => {
            if (currentTask.task_id === data.task.task_id) {
                if (currentTask.attachments) {
                    currentTask.attachments.push(data.attachment);
                } else {
                    currentTask.attachments = [data.attachment];
                }
            }
        });
        setTasks(newTaskData);
    };

    const webSocketDeleteAttachment = async (data) => {
        let newTaskData = [...tasksRef.current];
        newTaskData.forEach((currentTask) => {
            if (currentTask.task_id === data.task.task_id) {
                currentTask.attachments = currentTask.attachments.filter(
                    (currentAttachment) =>
                        currentAttachment.attachment_id !== data.attachment.attachment_id
                );
            }
        });
        setTasks(newTaskData);
    };

    const webSocketCreateMultipleAttachment = async (data) => {
        let newTaskData = [...tasksRef.current];
        newTaskData.forEach((currentTask) => {
            if (currentTask.task_id === data.task.task_id) {
                if (currentTask.attachments) {
                    currentTask.attachments.push(...data.attachments);
                } else {
                    currentTask.attachments = data.attachments;
                }
            }
        });
        setTasks(newTaskData);
    };

    useEffect(() => {
        document.title = "KanBan | Assigned Tasks";
        getAssignedTasks();
    }, []);

    const getAssignedTasks = async () => {
        try {
            const response = await axios.get(`/user/${user_id}/tasks`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            let tempData = response.data.assigned_tasks;
            tempData.map((task, index) => {
                tempData[index] = task.task;
            });

            window.log(tempData);
            tempData = tempData.filter((task) => task.completed === 0);

            setTasks(tempData);
        } catch (e) {
            if (e?.response?.status === 401 || e?.response?.status === 500) {
                setError({
                    message: "You are not logged in! Redirecting to login page...",
                });
                setRedirect(true);
            } else {
                setError(e);
            }
        }
    };

    return (
        <div className="content col-10" >
            {tasks === null ? (
                error ? (
                    <Error error={error} redirect={redirect} />
                ) : (
                    <Loader
                        data_to_load={tasks}
                        text_if_cant_load={"No assigned task yet!"}
                    />
                )
            ) : (
                <div className="grid-container">
                    {tasks.length === 0 ? (
                        <h2 className="no-data">No assigned task yet!</h2>
                    ) : (
                        tasks.map((task, index) => <TaskCard key={index} task={task} />)
                    )}
                </div>
            )}
        </div>
    );
};
export default AssignedTasks;
