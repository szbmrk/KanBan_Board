import axios from "../api/axios";
import { useState, useEffect } from "react";
let teamPermissions = [];
let ownPermissions = [];

export const SetRoles = async (token) => {
    try {
        const response = await axios.get('/user/permissions', {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        window.log(response.data);
        sessionStorage.setItem('permissions', roleHandler(response.data));
        const rolesData = JSON.parse(sessionStorage.getItem('permissions'));
        teamPermissions = rolesData.teams;
        ownPermissions = rolesData.general_role;
    } catch (error) {
        window.log(error);
    }
}

export const checkIfAdmin = () => {
    if (ownPermissions === undefined) {
        return false;
    }
    if (ownPermissions.includes('system_admin')) {
        return true;
    }
    return false;
}

export const checkPermisson = (team_id, permissionToCheck) => {
    if (teamPermissions === undefined || ownPermissions === undefined) {
        return false;
    }
    //TODO Refactor
    if (ownPermissions.includes('system_admin')) {
        return true;
    }
    if (teamPermissions.length === 0) {
        return false;
    }
    for (let i = 0; i < teamPermissions.length; i++) {
        if (parseInt(teamPermissions[i].team_id) === parseInt(team_id)) {
            if (teamPermissions[i].permission === permissionToCheck) {
                return true;
            }
        }
    }
};

export function checkPermissionForBoard(board_id, team_id, permissionToCheck) {
    if (teamPermissions === undefined || ownPermissions === undefined) {
        return false;
    }
    if (ownPermissions.includes('system_admin')) {
        return true;
    }
    if (teamPermissions.length === 0) {
        return false;
    }
    for (let i = 0; i < teamPermissions.length; i++) {
        if (parseInt(teamPermissions[i].team_id) === parseInt(team_id)) {
            if (teamPermissions[i].permission === permissionToCheck && parseInt(teamPermissions[i].board_id) === parseInt(board_id)) {
                return true;
            }
        }
    }
    return false;
}


function roleHandler(data) {
    window.log(data);
    let team_member = data.permissions;
    let roles = { general_role: [], teams: [] };
    for (let i = 0; i < team_member.length; i++) {
        if (team_member[i].permission === 'user_permission' || team_member[i].permission === 'system_admin') {
            roles.general_role.push(team_member[i].permission);
        }
        else {
            roles.teams.push(team_member[i]);
        }
    }
    window.log(roles)
    return JSON.stringify(roles);
    //comment
}