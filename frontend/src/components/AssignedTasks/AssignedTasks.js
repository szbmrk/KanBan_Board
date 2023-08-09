import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import TaskCard from "./TaskCard";

const AssignedTasks = () =>
{
    const [columnPositions, setColumnPositions] = useState([]);
    useEffect(() =>
    {
        
        
    },[]);

    const exampleData = {
        Tasks: [
          {
            Title: "Example Task 1",
            Tags: [{ title: "example" }],
            Priority: "High",
            description: "This is an example task.",
            deadline: "August 15, 2023",
            Users: [{ UserName: "exampleUser" }],
            Attachments: [{link: "example-link"}, {link: "example-link2"}],
            Subtasks: [
              {
                Title: "Example Subtask 1",
              },
              {
                Title: "Example Subtask 2"
              }
            ],
          },
          {
            Title: "Example Task 2",
            Tags: [{ title: "example2" }],
            Priority: "High",
            description: "This is an example task.",
            deadline: "August 15, 2023",
            Users: [{ UserName: "exampleUser" }],
            Attachments: [{link: "example-link"}, {link: "example-link2"}],
            Subtasks: [
            ],
          }
        ],
      };
    
    const getAssignedTasks = async () =>
    {

        //axios.get()
    }

    return(
        <TaskCard tasks={exampleData}/>
    )
}
export default AssignedTasks;