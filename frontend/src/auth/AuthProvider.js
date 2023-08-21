import React, { useState } from "react";
import AuthContext from "./AuthContext";
import { useNavigate } from "react-router-dom";

const AuthProvider = (props) => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Function to call when the user logs in
    const loginHandler = (data) => {
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('user_id', data.user.user_id);
        sessionStorage.setItem('username', data.user.username);
        sessionStorage.setItem('email', data.user.email);

        let team_member = data.user.team_members;
        let roles = { general_role: [], teams: [] };
        for (let i = 0; i < team_member.length; i++) {
            if (team_member[i].team_id === null) {
                for (let j = 0; j < team_member[i].roles.length; j++) {
                    for (let k = 0; k < team_member[i].roles[j].permissions.length; k++)
                        roles.general_role.push(team_member[i].roles[j].permissions[k]);
                }
            }
            else {
                for (let j = 0; j < team_member[i].roles.length; j++) {
                    for (let k = 0; k < team_member[i].roles[j].permissions.length; k++) {
                        roles.teams.push({ team_id: team_member[i].team_id, permission_data: team_member[i].roles[j].permissions[k] });
                    }
                }
            }
        }


        console.log(roles);
        sessionStorage.setItem('permissions', JSON.stringify(roles));
        setIsLoggedIn(true);
        navigate('/dashboard');
    };

    // Function to call when the user logs out
    const logoutHandler = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user_id');
        sessionStorage.removeItem('username');
        sessionStorage.removeItem('email');
        setIsLoggedIn(false);
        navigate('/login');
    };

    return (
        <AuthContext.Provider
            value={{
                isLoggedIn: isLoggedIn,
                onLogin: loginHandler,
                onLogout: logoutHandler,
            }}
        >
            {props.children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
