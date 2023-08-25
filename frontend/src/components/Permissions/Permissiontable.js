import { useState, useEffect } from 'react'
import { useParams } from 'react-router';
import axios from '../../api/axios';
import Loader from '../Loader';
import '../../styles/permissions.css';
import '../../styles/teamcard.css';
import { SetRoles } from '../../roles/Roles';

export default function Permissiontable() {
    const { board_id, team_id } = useParams();
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [newRoleName, setNewRoleName] = useState('');
    const [reRender, setReRender] = useState(false);
    const [ownPermissions, setOwnPermissions] = useState([]);
    const [teamPermissions, setTeamPermissions] = useState([]);

    const token = sessionStorage.getItem('token');

    useEffect(() => {
        document.title = 'Permission Table';
        ResetRoles();
        fetchBoardPermissions();
        getAllPermissions();
    }, []);

    async function fetchBoardPermissions() {
        try {
            const response = await axios.get(`/boards/${board_id}/role-permissions`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log(response.data.roles);
            setRoles(response.data.roles);
        } catch (error) {
            console.log(error.response);
        }
    }

    function checkPermissionToModifyRole() {
        if (ownPermissions.includes('system_admin')) {
            return true;
        }
        if (teamPermissions.length === 0) {
            return false;
        }
        for (let i = 0; i < teamPermissions.length; i++) {
            if (parseInt(teamPermissions[i].team_id) === parseInt(team_id)) {
                if (teamPermissions[i].permission === 'roles_permissions_management' && parseInt(teamPermissions[i].board_id) === parseInt(board_id)) {
                    return true;
                }
            }
        }
        return false;
    }

    function checkPermissionToAddAndDeleteRole() {
        if (ownPermissions.includes('system_admin')) {
            return true;
        }
        if (teamPermissions.length === 0) {
            return false;
        }
        for (let i = 0; i < teamPermissions.length; i++) {
            if (parseInt(teamPermissions[i].team_id) === parseInt(team_id)) {
                if (teamPermissions[i].permission === 'role_management' && parseInt(teamPermissions[i].board_id) === parseInt(board_id)) {
                    return true;
                }
            }
        }
        return false;
    }

    async function ResetRoles() {
        await SetRoles(token);
        setTeamPermissions(JSON.parse(sessionStorage.getItem('permissions')).teams);
        setOwnPermissions(JSON.parse(sessionStorage.getItem('permissions')).general_role);
    }

    async function getAllPermissions() {
        try {
            const response = await axios.get(`/all-permissions`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log(response.data.permissions);
            setPermissions(response.data.permissions);
        } catch (error) {
            console.log(error.response);
        }
    }

    function checkIfPermissionIsSet(role_id, permission_id) {
        for (let i = 0; i < roles.length; i++) {

            if (parseInt(roles[i].role_id) === parseInt(role_id)) {
                for (let j = 0; j < roles[i].permissions.length; j++) {
                    if (roles[i].permissions[j].id === permission_id) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    async function AddNewRole() {
        try {
            const response = await axios.post(`/boards/${board_id}/roles`, { "name": newRoleName },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            console.log(response.data);
            const newRole = response.data.role;
            newRole.permissions = [];
            setRoles([...roles, newRole]);
            setNewRoleName('');
        } catch (error) {
            console.log(error.response);
        }
    }

    async function DeleteRole(role_id) {
        try {
            const response = await axios.delete(`/boards/${board_id}/roles/${role_id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            console.log(response);
            setRoles(roles.filter(role => role.role_id !== role_id));
        } catch (error) {
            console.log(error.response);
        }
    }

    async function DeletePermissionFromRole(role_id, permission_id) {
        try {
            const response = await axios.delete(`/boards/${board_id}/roles/${role_id}/permissions/${permission_id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            console.log(response);
            const newRoles = [...roles];
            for (let i = 0; i < newRoles.length; i++) {
                if (parseInt(newRoles[i].role_id) === parseInt(role_id)) {
                    console.log('x');
                    newRoles[i].permissions.splice(newRoles[i].permissions.findIndex(permission => parseInt(permission.id) === parseInt(permission_id)), 1);
                    break;
                }
            }
            setRoles(newRoles);
            console.log(newRoles);
            setReRender(!reRender);
            ResetRoles();
        } catch (error) {
            console.log(error.response);
        }
    }

    async function AddPermissionToRole(role_id, permission_id) {
        try {
            const response = await axios.post(`/boards/${board_id}/roles/${role_id}/permissions/`, { permission_id: permission_id },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            console.log(response);
            const newRoleData = [...roles];
            newRoleData.forEach(role => {
                if (parseInt(role.role_id) === parseInt(role_id)) {
                    role.permissions.push(response.data.permission);
                }
            });
            setRoles(newRoleData);
            setReRender(!reRender);
            ResetRoles();
        } catch (error) {
            console.log(error.response);
        }
    }

    function handleChange(e) {
        setNewRoleName(e.target.value);
        console.log(e.target.value);
    }

    function handleCheckboxChange(e) {
        if (e.target.checked) {
            AddPermissionToRole(e.target.id, e.target.value);
        }
        else {
            DeletePermissionFromRole(e.target.id, e.target.value);
        }
        console.log(e.target.value);
        console.log(e.target.id);
    }



    return (
        <div className='content'>
            {roles.length === 0 && permissions.length === 0 ? (
                <Loader />
            ) : (
                <div>
                    <table className='permission-table'>
                        <thead>
                            <tr>
                                <th>
                                    Permissions
                                </th>
                                {roles.map((role) => (
                                    <th key={role.role_id} className='role-header'>
                                        <div className='role-header-div'>
                                            <p>
                                                {role.name}
                                            </p>
                                            {checkPermissionToAddAndDeleteRole() && (
                                                <button onClick={() => DeleteRole(role.role_id)} className='delete-role'>Delete</button>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {permissions.map((permission) => (
                                permission.name !== 'system_admin' && permission.name !== 'user_permission' && permission.name !== 'team_management' && permission.name !== 'team_member_management' && permission.name !== 'team_member_role_management' && (
                                    <tr key={permission.permission_id}>
                                        <td className='permission-name'>
                                            {permission.name}
                                        </td>
                                        {roles.map((role) => (
                                            <td key={role.role_id} className='role-permission'>
                                                <input className='permission-checkbox' type="checkbox" onChange={handleCheckboxChange} id={role.role_id} value={permission.id} name={permission.name} checked={checkIfPermissionIsSet(role.role_id, permission.id)} disabled={!checkPermissionToModifyRole()} />
                                            </td>
                                        ))}
                                    </tr>
                                )
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {checkPermissionToAddAndDeleteRole() &&
                <div className='add-role'>
                    <input type='text' onChange={handleChange} value={newRoleName} placeholder='Role name' className='role-input' />
                    <button onClick={AddNewRole} className='add-role-button'>Add Role</button>
                </div>
            }
        </div>
    )
}
