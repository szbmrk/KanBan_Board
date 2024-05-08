import React, { useEffect, useState, useRef } from "react";
import axios from "../../api/axios";
import { Link } from "react-router-dom";
import { AuthContext } from "../../auth/AuthContext";
import "../../styles/navbar.css";
import "../../styles/popup.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faUser,
  faBars,
  faSignOutAlt,
  faUserPen,
  faMagnifyingGlass,
  faCircleHalfStroke,
  faImage,
} from "@fortawesome/free-solid-svg-icons";
import Echo from "laravel-echo";
import {
  REACT_APP_PUSHER_KEY,
  REACT_APP_PUSHER_CLUSTER,
} from "../../api/config.js";

const notificationIcon = <FontAwesomeIcon icon={faBell} />;
const profileIcon = <FontAwesomeIcon icon={faUser} />;
const menuIcon = <FontAwesomeIcon icon={faBars} />;
const signOutIcon = <FontAwesomeIcon icon={faSignOutAlt} />;
const editProfileIcon = <FontAwesomeIcon icon={faUserPen} />;
const searchIcon = <FontAwesomeIcon icon={faMagnifyingGlass} />;
const displayModeIcon = <FontAwesomeIcon icon={faCircleHalfStroke} />;
const backgroundChangeIcon = <FontAwesomeIcon icon={faImage} />;

const Navbar = () => {
  const { isLoggedIn, onLogout } = React.useContext(AuthContext);
  const [isSidebarClosable, setIsSidebarClosable] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [menuIconClicked, setMenuIconClicked] = useState(false);
  const [isSidebarOnTop, setIsSidebarOnTop] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const [error, setError] = useState(false);
  const token = sessionStorage.getItem("token");
  const userId = sessionStorage.getItem("user_id");
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const unreadNotificationCountRef = useRef(unreadNotificationCount);

  useEffect(() => {
    loadUnreadNotificationCount();
  }, []);

  useEffect(() => {
    unreadNotificationCountRef.current = unreadNotificationCountRef;
  }, [unreadNotificationCount]);

  useEffect(() => {
    window.Pusher = require("pusher-js");
    window.Pusher.logToConsole = true;

    const echo = new Echo({
      broadcaster: "pusher",
      key: REACT_APP_PUSHER_KEY,
      cluster: REACT_APP_PUSHER_CLUSTER,
      forceTLS: true,
    });

    const channel = echo.channel(`UnreadNotificationCountChange`);

    channel.listen(
      `.user.${userId}`,
      (e) => {
        handleWebSocket(e);
      },
      []
    );

    return () => {
      console.log("Cleanup");
      channel.unsubscribe();
    };
  }, []);

  const handleWebSocket = async (websocket) => {
    console.log("COUNT");
    console.log(websocket.count);
    setUnreadNotificationCount(websocket.count);
  };

  const [theme, setTheme] = useState(localStorage.getItem("darkMode"));
  useEffect(() => {
    DarkMode();
    //ez
    const ResetTheme = () => {
      setTheme(localStorage.getItem("darkMode"));
    };

    console.log("Darkmode: " + localStorage.getItem("darkMode"));
    window.addEventListener("ChangingTheme", ResetTheme);

    return () => {
      window.removeEventListener("ChangingTheme", ResetTheme);
    };
    //eddig
  }, []);

  function DarkMode() {
    console.log(localStorage.getItem("darkMode"));
    if (localStorage.getItem("darkMode") == "dark") {
      console.log("Switching to light mode");
      localStorage.setItem("darkMode", "light");
    } else {
      console.log("Switching to dark mode");
      localStorage.setItem("darkMode", "dark");
    }
    const event = new Event("ChangingTheme");
    window.dispatchEvent(event);
  }

  const loadUnreadNotificationCount = async () => {
    try {
      const res = await axios.get(`/users/${userId}/unreadNotificationCount`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("NOTIFICATION COUNT");
      console.log(res.data);
      setUnreadNotificationCount(res.data);
    } catch (e) {
      console.log(e);
      if (e?.response?.status === 401 || e?.response?.status === 500) {
        setError({
          message: "You are not logged in! Redirecting to login page...",
        });
        setRedirect(true);
      } else if (e?.response?.status === 404) {
        setError({ message: "No notifications found!" });
      } else {
        setError(e);
      }
    }
  };

  const toggleSidebar = () => {
    const sidebar = document.querySelector(".sidebar");
    const content = document.querySelector(".content");

    sidebar.classList.toggle("sidebar-hidden");
    sidebar.classList.toggle("sidebar-visible");
    if (sidebar.classList.contains("sidebar-hidden")) {
      sidebar.style.transform = isSidebarOnTop
        ? "translateY(-253px)"
        : "translateX(-231px)";
      sidebar.style.transition = "transform 0.4s ease-in-out";
      content.style.transition =
        "transform 0.4s ease-in-out, width 0.4s ease-in-out";
      setIsSidebarVisible(false);
      content.style.maxWidth = "100%";
      content.classList.remove("col-10");
      content.classList.add("col-12");
      sidebar.classList.remove("col-2");
      sidebar.style.display = "none";
    } else {
      //sidebar.style.transition = "transform 0.5s ease-in-out";
      //content.style.transition = "max-width 0.5s ease-in-out";
      setIsSidebarVisible(true);
      sidebar.style.display = "block";
      sidebar.classList.add("col-2");
      content.classList.remove("col-12");
      content.classList.add("col-10");
      content.style.maxWidth = isSidebarOnTop ? "100%" : "calc(100% - 231px)";
      sidebar.style.transform = "translateX(0px)";
    }
    setMenuIconClicked(false);
  };

  useEffect(() => {
    const maxWidth = window.matchMedia("(min-width: 980px)");

    const closeSidebar = (e) => {
      setIsSidebarClosable(!e.matches);
      toggleSidebar();
    };

    maxWidth.addEventListener("change", closeSidebar);

    return () => {
      maxWidth.removeEventListener("change", closeSidebar);
    };
  }, [isSidebarClosable]);

  useEffect(() => {
    const sidebarVisibleOnTop = window.matchMedia("(max-width: 600px)");

    const content = document.querySelector(".content");

    const setSidebarOnTop = (e) => {
      if (e.matches) {
        content.style.maxWidth = "100%";
        content.style.transition = "max-width 0.4s ease-in-out";
      } else {
        content.style.maxWidth = "calc(100% - 231px)";
        content.style.transition = "max-width 0.4s ease-in-out";
      }
      setIsSidebarOnTop(e.matches);
    };

    sidebarVisibleOnTop.addEventListener("change", setSidebarOnTop);

    return () => {
      sidebarVisibleOnTop.removeEventListener("change", setSidebarOnTop);
    };
  }, [isSidebarOnTop]);

  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleClick = () => {
    setMenuIconClicked(true);
    toggleSidebar();
  };

  return (
    <>
      <div className="navbar col-12" data-theme={theme}>
        <div className="navbar-menu">
          <button id="menu-btn" onClick={handleClick}>
            {menuIcon}
          </button>
          <ul>
            <li>
              <span onClick={DarkMode}>{displayModeIcon}</span>
            </li>
            <li>
              <Link to="/notifications">
                <span>
                  {notificationIcon}
                  <span className="unread-notification-count">
                    {unreadNotificationCount > 0 ? unreadNotificationCount : ""}
                  </span>
                </span>
              </Link>
            </li>
            <li>
              <span onClick={toggleDropdown}>{profileIcon}</span>
            </li>
          </ul>
        </div>
      </div>
      {isOpen && (
        <div className="profile-submenu" onMouseLeave={() => setIsOpen(false)}>
          <p className="profile-menu-title"> Profile </p>
          <ul className="profile-menu">
            <li>
              <Link to="/profile" onClick={toggleDropdown}>
                <span>{editProfileIcon}</span>
                <span>Edit Profile</span>
              </Link>
            </li>
            <li>
              <Link to="/login" onClick={onLogout} className="logout">
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
