import { useState } from 'react';
import { formatDate } from '../../utils/DateFormat';

const LogComponent = ({ logs, theme }) => {
    const [selectedUser, setSelectedUser] = useState('All');

    // Extract the action from log details
    const getActionFromDetails = (details) => {
        if (details.includes('Created a TASK') || details.includes('Created a SUBTASK')) return 'CreatedTask';
        if (details.includes('Moved a TASK') || details.includes('Moved a SUBTASK')) return 'MovedTask';
        if (details.includes('Finished a TASK') || details.includes('Finished a SUBTASK')) return 'FinishedTask';
        if (details.includes('Deleted a TASK') || details.includes('Deleted a SUBTASK')) return 'DeletedTask';
        if (details.includes('Created a COLUMN')) return 'CreatedColumn';
        if (details.includes('Moved a COLUMN')) return 'MovedColumn';
        if (details.includes('Deleted a COLUMN')) return 'DeletedColumn';
        return 'Unknown';
    };

    // Filter logs based on selected user
    const filteredLogs = selectedUser === 'All'
        ? logs
        : logs.filter((log) => log.user.username === selectedUser);

    // Count the types of actions
    const createdTaskCount = filteredLogs.filter(log => getActionFromDetails(log.details) === 'CreatedTask').length;
    const movedTaskCount = filteredLogs.filter(log => getActionFromDetails(log.details) === 'MovedTask').length;
    const finishedTaskCount = filteredLogs.filter(log => getActionFromDetails(log.details) === 'FinishedTask').length;
    const deletedTaskCount = filteredLogs.filter(log => getActionFromDetails(log.details) === 'DeletedTask').length;
    const createdColumnCount = filteredLogs.filter(log => getActionFromDetails(log.details) === 'CreatedColumn').length;
    const movedColumnCount = filteredLogs.filter(log => getActionFromDetails(log.details) === 'MovedColumn').length;
    const deletedColumnCount = filteredLogs.filter(log => getActionFromDetails(log.details) === 'DeletedColumn').length;

    return (
        <div className="log-submenu" data-theme={theme}>
            <div className="log-header">
                <p className="log-menu-title">Log</p>

                {/* Filter dropdown */}
                <div className="log-filter">
                    <label htmlFor="userFilter">Filter by user: </label>
                    <select
                        id="userFilter"
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                    >
                        <option value="All">All</option>
                        {[...new Set(logs.map((log) => log.user.username))].map((user, index) => (
                            <option key={index} value={user}>
                                {user}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Activity count */}
                <p className="log-activity-count">
                    {selectedUser === 'All'
                        ? `Total logs: ${logs.length}`
                        : `Logs by ${selectedUser}: ${filteredLogs.length}`}
                </p>
                <p className="log-activity-count">
                    Tasks - Created: {createdTaskCount} | Moved: {movedTaskCount} | Finished: {finishedTaskCount} | Deleted: {deletedTaskCount}
                </p>
                <p className="log-activity-count">
                    Columns - Created: {createdColumnCount} | Moved: {movedColumnCount} | Deleted: {deletedColumnCount}
                </p>

                <div className="log-info">
                    <p>Username</p>
                    <p>Details</p>
                    <p>Created at</p>
                </div>
            </div>

            {filteredLogs && filteredLogs.length > 0 ? (
                <ul className="log-container">
                    {filteredLogs.map((log, index) => (
                        <li key={index} className="log-item">
                            <div className="log">
                                <p className="log-creator">{log.user.username}:</p>
                                <p className="log-details">{log.details}</p>
                                <p className="log-date">{formatDate(log.created_at)}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No logs available for the selected user.</p>
            )}
        </div>
    );
};

export default LogComponent;
