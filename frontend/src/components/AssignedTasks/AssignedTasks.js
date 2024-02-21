import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import TaskCard from "./TaskCard";
import Loader from "../Loader";
import Error from "../Error";

const AssignedTasks = () => {
  const [theme, setTheme] = useState(localStorage.getItem("darkMode"));
  const [tasks, setTasks] = useState(null);
  const [redirect, setRedirect] = useState(false);
  const [error, setError] = useState(false);

  const token = sessionStorage.getItem("token");
  const user_id = sessionStorage.getItem("user_id");

  useEffect(() => {
    document.title = "Assigned Tasks";
    getAssignedTasks();
    const ResetTheme = () => {
      setTheme(localStorage.getItem("darkMode"));
    };

    console.log("Darkmode: " + localStorage.getItem("darkMode"));
    window.addEventListener("ChangingTheme", ResetTheme);

    return () => {
      window.removeEventListener("ChangingTheme", ResetTheme);
    };
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
    <div className="content col-10" data-theme={theme}>
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
        <div className="scrollable-container">
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
