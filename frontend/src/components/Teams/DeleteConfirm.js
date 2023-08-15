import React from 'react'
import '../../styles/teams.css'; // Import the CSS file for styling
import axios from '../../api/axios';
import { useEffect, useState } from 'react';


const DeleteConfirm = ({ teamID, OnClose }) => {


    async function DeleteTeam() {
        const token = sessionStorage.getItem('token');
        try {
              await axios.delete(`/dashboard/teams/${teamID}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              }
            });
        }
        catch (error) {
          console.log(error.response);
        }
        window.location.reload();
      }

  return (
    <div className="overlay">
      <div className='popup'> 
        <div className="popup-content">
          <button className="close-btn" onClick = {OnClose}>
            Close
          </button>
            <p>Are you sure you want delete this team?</p>
          <table>
            <tbody>
                <tr>
                    <td>
                        <button onClick={OnClose}>Cancel</button>
                    </td>
                    <td>
                    <button className='delete-button-popup' onClick={DeleteTeam}>Delete</button>
                    </td>
                </tr>
            </tbody>
          </table>
        </div>
      </div>
      </div>
  )
}

export default DeleteConfirm;
