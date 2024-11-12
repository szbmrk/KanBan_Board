import { useEffect, useState } from 'react';
import { formatDate } from '../../utils/DateFormat';

const LogComponent = ({ logs, theme }) => {
    const [selectedUser, setSelectedUser] = useState('All');

    // Extract the action from log details
    const getActionFromDetails = (details) => {
        if (details.includes('Created a TASK')) return 'CreatedTask';
        if (details.includes('Moved a TASK')) return 'MovedTask';
        if (details.includes('Finished a TASK')) return 'FinishedTask';
        if (details.includes('Deleted a TASK')) return 'DeletedTask';
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
    const [createdTaskCount, setCreatedTaskCount] = useState(0);
    const [movedTaskCount, setMovedTaskCount] = useState(0);
    const [finishedTaskCount, setFinishedTaskCount] = useState(0);
    const [deletedTaskCount, setDeletedTaskCount] = useState(0);
    const [createdColumnCount, setCreatedColumnCount] = useState(0);
    const [movedColumnCount, setMovedColumnCount] = useState(0);
    const [deletedColumnCount, setDeletedColumnCount] = useState(0);
    const [users, setUsers] = useState([])

    useEffect(() => {
        setUsers([...new Set(logs.map((log) => log.user.username))])
    }, [logs])

    useEffect(() =>{
        setCreatedTaskCount(filteredLogs.filter(log => getActionFromDetails(log.details) === 'CreatedTask').length);
        setMovedTaskCount(filteredLogs.filter(log => getActionFromDetails(log.details) === 'MovedTask').length);
        setFinishedTaskCount(filteredLogs.filter(log => getActionFromDetails(log.details) === 'FinishedTask').length);
        setDeletedTaskCount(filteredLogs.filter(log => getActionFromDetails(log.details) === 'DeletedTask').length);
        setCreatedColumnCount(filteredLogs.filter(log => getActionFromDetails(log.details) === 'CreatedColumn').length);
        setMovedColumnCount(filteredLogs.filter(log => getActionFromDetails(log.details) === 'MovedColumn').length);
        setDeletedColumnCount(filteredLogs.filter(log => getActionFromDetails(log.details) === 'DeletedColumn').length);
    },[filteredLogs,getActionFromDetails]);
        
    const getLogCountsForUser = (username) => {
        if (!username)
        {
            return {
                CreatedTask: "",
                 MovedTask: "",
            FinishedTask: "",
            DeletedTask: "",
            CreatedColumn: "",
            MovedColumn: "",
            DeletedColumn: "",

            }
        }
        let logsForUser = logs.filter((log) => log.user.username === username)
        console.error(logsForUser)
        return {
            CreatedTask: logsForUser.filter(log => getActionFromDetails(log.details) === 'CreatedTask').length,
            MovedTask: logsForUser.filter(log => getActionFromDetails(log.details) === 'MovedTask').length,
            FinishedTask: logsForUser.filter(log => getActionFromDetails(log.details) === 'FinishedTask').length,
            DeletedTask: logsForUser.filter(log => getActionFromDetails(log.details) === 'DeletedTask').length,
            CreatedColumn: logsForUser.filter(log => getActionFromDetails(log.details) === 'CreatedColumn').length,
            MovedColumn: logsForUser.filter(log => getActionFromDetails(log.details) === 'MovedColumn').length,
            DeletedColumn: logsForUser.filter(log => getActionFromDetails(log.details) === 'DeletedColumn').length
        }
    }

    return (
        <div className="log-submenu" data-theme={theme}>
            <div className="log-header">
                <p className="log-menu-title">Log</p>

                {/* Filter dropdown */}
                <div className="log-filter">
                    <label htmlFor="userFilter">Filter by user: </label>
                    <select
                        id="userFilter"
                        className='user-filter-select'
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

                {/* Activity count */}{selectedUser === 'All' ? 
          <table className='log-table'>
    <thead>
        <tr>
            <th className='log-th'>Username</th>
            <th className='log-th'>Created-Task</th>
            <th className='log-th'>Moved-Task</th>
            <th className='log-th'>Finished-Task</th>
            <th className='log-th'>Deleted-Task</th>
            <th className='log-th'>Created-Column</th>
            <th className='log-th'>Moved-Column</th>
            <th className='log-th'>Deleted-Column</th>
        </tr>
    </thead>
    <tbody>
        {users.map((user, index) => (
            <tr key={index}>
                <td className="log-td">{user}</td>
                <td className="log-td">{getLogCountsForUser(user).CreatedTask}</td>
                <td className="log-td">{getLogCountsForUser(user).MovedTask}</td>
                <td className="log-td">{getLogCountsForUser(user).FinishedTask}</td>
                <td className="log-td">{getLogCountsForUser(user).DeletedTask}</td>
                <td className="log-td">{getLogCountsForUser(user).CreatedColumn}</td>
                <td className="log-td">{getLogCountsForUser(user).MovedColumn}</td>
                <td className="log-td">{getLogCountsForUser(user).DeletedColumn}</td>
            </tr>
        ))}
    </tbody>
</table>
:
            <div>
                <p className="log-activity-count">
                    
                    {`Logs by ${selectedUser}: ${filteredLogs.length}`}
                </p>
                <p className="log-activity-count">
                    Tasks - Created: {createdTaskCount} | Moved: {movedTaskCount} | Finished: {finishedTaskCount} | Deleted: {deletedTaskCount}
                </p>
                <p className="log-activity-count">
                    Columns - Created: {createdColumnCount} | Moved: {movedColumnCount} | Deleted: {deletedColumnCount}
                </p>
           </div>}
                

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
