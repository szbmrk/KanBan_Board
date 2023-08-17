import React from 'react'

const DeleteConfirm = ({ teamID, OnClose, DeleteTeam }) => {

  function DeleteTeamConfirm(teamID) {
    DeleteTeam(teamID);
    OnClose();
  }

  return (
    <div className="overlay">
      <div className='popup'>
        <div className="popup-content">
          <button className="close-btn" onClick={OnClose}>
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
                  <button className='delete-button-popup' onClick={() => DeleteTeamConfirm(teamID)}>Delete</button>
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
