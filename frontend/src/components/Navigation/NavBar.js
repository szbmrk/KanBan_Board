import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../auth/AuthContext';
import '../../styles/navbar.css';
import '../../styles/popup.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBell,
    faUser,
    faBars,
    faSignOutAlt,
    faUserPen,
    faMagnifyingGlass,
    faCircleHalfStroke,
} from '@fortawesome/free-solid-svg-icons';

const notificationIcon = <FontAwesomeIcon icon={faBell} />;
const profileIcon = <FontAwesomeIcon icon={faUser} />;
const menuIcon = <FontAwesomeIcon icon={faBars} />;
const signOutIcon = <FontAwesomeIcon icon={faSignOutAlt} />;
const editProfileIcon = <FontAwesomeIcon icon={faUserPen} />;
const searchIcon = <FontAwesomeIcon icon={faMagnifyingGlass} />;
const displayModeIcon = <FontAwesomeIcon icon={faCircleHalfStroke} />;

const Navbar = () => {
    const { isLoggedIn, onLogout } = React.useContext(AuthContext);
    const [sidebarIsClosed, setSidebarIsClosed] = useState(false);
    const [menuIconClicked, setMenuIconClicked] = useState(false);

    const toggleSidebar = () => {
        const sidebar = document.querySelector('.sidebar');
        const content = document.querySelector('.content');

        if (menuIconClicked) {
            sidebar.classList.toggle('sidebar-hidden');
            sidebar.classList.toggle('sidebar-visible');
        }

        if (sidebarIsClosed) {
            sidebar.classList.remove('sidebar-visible');
            sidebar.classList.add('sidebar-hidden');
        } else {
            sidebar.classList.remove('sidebar-hidden');
            sidebar.classList.add('sidebar-visible');
        }

        if (sidebar.classList.contains('sidebar-hidden')) {
            sidebar.style.transform = 'translateX(-231px)';
            sidebar.style.transition = 'transform 0.5s ease-in-out';
            setTimeout(() => {
                sidebar.classList.remove('col-2');
                content.classList.remove('col-10');
                content.classList.add('col-12');
                content.style.maxWidth = '100%';
                sidebar.style.display = 'none';
            }, 500);
        } else {
            sidebar.classList.add('col-2');
            content.classList.remove('col-12');
            content.classList.add('col-10');
            content.style.maxWidth = 'calc(100% - 231px)';
            content.style.transition = 'max-width 0.5s ease-in-out';
            setTimeout(() => {
                sidebar.style.display = 'block';
                sidebar.style.transform = 'translateX(0px)';
                sidebar.style.transition = 'transform 0.5s ease-in-out';
            }, 500);
        }
        setMenuIconClicked(false);
    };

    useEffect(() => {
        const maxWidth = window.matchMedia('(min-width: 980px)');

        const closeSidebar = (e) => {
            setSidebarIsClosed(e.matches);
            toggleSidebar();
        };
        maxWidth.addEventListener('change', closeSidebar);

        return () => {
            maxWidth.removeEventListener('change', closeSidebar);
        };
    }, [sidebarIsClosed]);

    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    async function handleSearch(e) {
        console.log('Search not implemented yet');
    }

    const handleClick = () => {
        setMenuIconClicked(true);
        toggleSidebar();
    };

    return (
        <>
            <div className='navbar col-12'>
                <div className='navbar-menu'>
                    <button id='menu-btn' onClick={handleClick}>
                        {menuIcon}
                    </button>
                    <ul>
                        <li
                            style={{
                                visibility: 'hidden',
                            }}
                        >
                            <form className='search-form' onSubmit={(e) => handleSearch()}>
                                <input type='text' placeholder='Search..'></input>
                                <button type='submit'>{searchIcon}</button>
                            </form>
                        </li>
                        <li>
                            <span>{displayModeIcon}</span>
                        </li>
                        <li>
                            <Link to='/notifications'>
                                <span>{notificationIcon}</span>
                            </Link>
                        </li>
                        <li>
                            <span onClick={toggleDropdown}>{profileIcon}</span>
                        </li>
                    </ul>
                </div>
            </div>
            {isOpen && (
                <div className='profile-submenu' onMouseLeave={() => setIsOpen(false)}>
                    <p className='profile-menu-title'> Profile </p>
                    <ul className='profile-menu'>
                        <li>
                            <Link to='/profile' onClick={toggleDropdown}>
                                <span>{editProfileIcon}</span>
                                <span>Edit Profile</span>
                            </Link>
                        </li>
                        <li>
                            <Link to='/login' onClick={onLogout} className='logout'>
                                <span>{signOutIcon}</span>
                                <span>Sign Out</span>
                            </Link>
                        </li>
                    </ul>
                </div>
            )}
        </>
    );
};

export default Navbar;
