import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import axios from '../../api/axios';
import Loader from '../Loader';
import '../../styles/permissions.css';
import '../../styles/teamcard.css';
import { SetRoles, checkPermissionForBoard } from '../../roles/Roles';

export default function Permissiontable() {
    const { board_id, team_id } = useParams();
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [newRoleName, setNewRoleName] = useState('');
    const [needLoader, setNeedLoader] = useState(false);

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

    async function ResetRoles() {
        await SetRoles(token);
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
            const response = await axios.post(
                `/boards/${board_id}/roles`,
                { name: newRoleName },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
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
            const response = await axios.delete(`/boards/${board_id}/roles/${role_id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log(response);
            setRoles(roles.filter((role) => role.role_id !== role_id));
        } catch (error) {
            console.log(error.response);
        }
    }

    async function DeletePermissionFromRole(role_id, permission_id) {
        try {
            const response = await axios.delete(`/boards/${board_id}/roles/${role_id}/permissions/${permission_id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log(response);
            const newRoles = [...roles];
            for (let i = 0; i < newRoles.length; i++) {
                if (parseInt(newRoles[i].role_id) === parseInt(role_id)) {
                    newRoles[i].permissions.splice(
                        newRoles[i].permissions.findIndex(
                            (permission) => parseInt(permission.id) === parseInt(permission_id)
                        ),
                        1
                    );
                    break;
                }
            }
            await ResetRoles();
            setRoles(newRoles);
            setNeedLoader(false);
        } catch (error) {
            console.log(error.response);
        }
    }

    async function AddPermissionToRole(role_id, permission_id) {
        try {
            const response = await axios.post(
                `/boards/${board_id}/roles/${role_id}/permissions/`,
                { permission_id: permission_id },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log(response);
            const newRoleData = [...roles];
            newRoleData.forEach((role) => {
                if (parseInt(role.role_id) === parseInt(role_id)) {
                    role.permissions.push(response.data.permission);
                }
            });
            await ResetRoles();
            setRoles(newRoleData);
            setNeedLoader(false);
        } catch (error) {
            console.log(error.response);
        }
    }

    function handleChange(e) {
        setNewRoleName(e.target.value);
    }

    function handleCheckboxChange(e) {
        setNeedLoader(true);
        if (e.target.checked) {
            AddPermissionToRole(e.target.id, e.target.value);
        } else {
            DeletePermissionFromRole(e.target.id, e.target.value);
        }
    }

    return (
        <div className='content'>
            {(roles.length === 0 && permissions.length === 0) || needLoader ? (
                <Loader />
            ) : (
                <div>
                    <div className='permission-table'>
                        <div className='permission-table-header'>
                            <div className='permission-table-header-cell'>Permissions</div>
                            {roles.map((role) => (
                                <div key={role.role_id} className='permission-table-header-cell'>
                                    <div className='role-header-div'>
                                        <p>{role.name}</p>
                                        {checkPermissionForBoard(board_id, team_id, 'role_management') && (
                                            <button onClick={() => DeleteRole(role.role_id)} className='delete-role'>
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className='permission-table-body'>
                            {permissions.map(
                                (permission) =>
                                    permission.name !== 'system_admin' &&
                                    permission.name !== 'user_permission' &&
                                    permission.name !== 'team_management' &&
                                    permission.name !== 'team_member_management' &&
                                    permission.name !== 'team_member_role_management' && (
                                        <div key={permission.permission_id} className='permission-table-row'>
                                            <div className='permission-table-body-cell'>{permission.name}</div>
                                            {roles.map((role) => (
                                                <div key={role.role_id} className='permission-table-body-cell'>
                                                    <input
                                                        className='permission-checkbox'
                                                        type='checkbox'
                                                        onChange={handleCheckboxChange}
                                                        id={role.role_id}
                                                        value={permission.id}
                                                        name={permission.name}
                                                        checked={checkIfPermissionIsSet(role.role_id, permission.id)}
                                                        disabled={
                                                            !checkPermissionForBoard(
                                                                board_id,
                                                                team_id,
                                                                'roles_permissions_management'
                                                            )
                                                        }
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )
                            )}
                        </div>
                    </div>
                </div>
            )}
            {checkPermissionForBoard(board_id, team_id, 'role_management') && (
                <div className='add-role'>
                    <input
                        type='text'
                        onChange={handleChange}
                        value={newRoleName}
                        placeholder='Role name'
                        className='role-input'
                    />
                    <button onClick={AddNewRole} className='add-role-button'>
                        Add Role
                    </button>
                </div>
            )}
        </div>
    );
}
