import axios from "../api/axios";
//const token=sessionStorage.getItem('token');

export const SetRoles =  async (token) => {
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


function roleHandler(data)
{
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
    return JSON.stringify(roles);
}