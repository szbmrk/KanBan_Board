// Sidebar component that using among the application
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/sidebar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../auth/AuthContext';

const homeIcon = <FontAwesomeIcon icon={faHome} />;
const userIcon = <FontAwesomeIcon icon={faUser} />;
const signOutIcon = <FontAwesomeIcon icon={faSignOutAlt} />;
const Sidebar = () => {
    const { isLoggedIn, onLogout } = React.useContext(AuthContext);
    return (
        <div className="sidebar">
            <div className="sidebar-header col-12 col-s-12">
                <h3>KanBan Board</h3>
            </div>
            <div className="sidebar-menu col-2 col-s-2">
                <ul>
                    <li>
                        <Link to="/dashboard">
                            {homeIcon}
                            <span>Dashboard</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/board">
                            {userIcon}
                            <span>Board</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/login" onClick={onLogout}>
                            {signOutIcon}
                            <span>Logout</span>
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Sidebar;