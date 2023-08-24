import { useState, useEffect } from 'react'
import { useParams } from 'react-router';
import axios from '../../api/axios';
import Loader from '../Loader';
import '../../styles/permissions.css';
import '../../styles/teamcard.css';

export default function Permissiontable() {
    const { board_id } = useParams();
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [newRoleName, setNewRoleName] = useState('');

    const token = sessionStorage.getItem('token');

    useEffect(() => {
        document.title = 'Permission Table';
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

            if (roles[i].role_id === role_id) {
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

    function handleChange(e) {
        setNewRoleName(e.target.value);
        console.log(e.target.value);
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
                                            <button onClick={() => DeleteRole(role.role_id)} className='delete-role'>Delete</button>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {permissions.map((permission) => (
                                permission.name !== 'system_admin' && permission.name !== 'user_permission' && (
                                    <tr key={permission.permission_id}>
                                        <td className='permission-name'>
                                            {permission.name}
                                        </td>
                                        {roles.map((role) => (
                                            <td key={role.role_id} className='role-permission'>
                                                {checkIfPermissionIsSet(role.role_id, permission.id) ? (
                                                    <input type="checkbox" id={role.role_id} value={permission.id} name={permission.name} checked />
                                                ) : (
                                                    <input type="checkbox" id={permission.id} value={permission.id} name={permission.name} />
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                )
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <div className='add-role'>
                <input type='text' onChange={handleChange} value={newRoleName} placeholder='Role name' className='role-input' />
                <button onClick={AddNewRole} className='add-role-button'>Add Role</button>
            </div>
        </div>
    )
}
