import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/navbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faUser, faBars } from '@fortawesome/free-solid-svg-icons';

const notificationIcon = <FontAwesomeIcon icon={faBell} />;
const profileIcon = <FontAwesomeIcon icon={faUser} />;
const menuIcon = <FontAwesomeIcon icon={faBars} />;

const Navbar = () => {
    return (
        <div className="navbar">
            <div className="navbar-menu col-12 col-s-12">
                <button id="menu-btn">{menuIcon}</button>
                <ul>
                    <li>
                        <Link to="/notifications">
                            <span>{notificationIcon}</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/profile">
                            <span>{profileIcon}</span>
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Navbar;