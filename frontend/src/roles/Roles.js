import axios from "../api/axios";
//const token=sessionStorage.getItem('token');

export const SetRoles = async (token) => {
    try {
        const response = await axios.get('/user/permissions', {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        sessionStorage.setItem('permissions', roleHandler(response.data));
    } catch (error) {
        console.log(error);
    }
}


function roleHandler(data) {
    console.log(data);
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
    console.log(roles)
    return JSON.stringify(roles);
    //comment
}