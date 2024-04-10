import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import axios from "../../api/axios";
import Loader from "../Loader";
import "../../styles/permissions.css";
import "../../styles/teamcard.css";
import { SetRoles, checkPermissionForBoard } from "../../roles/Roles";
import ErrorWrapper from "../../ErrorWrapper";

export default function Permissiontable() {
    const { board_id, team_id } = useParams();
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [newRoleName, setNewRoleName] = useState("");
    const [needLoader, setNeedLoader] = useState(false);
    const [renameIsActive, setRenameIsActive] = useState(null); // null kezdeti értékkel
    const [renameRoleName, setRenameRoleName] = useState("");

    const token = sessionStorage.getItem("token");

    const [error, setError] = useState(null);
    const [theme, setTheme] = useState(localStorage.getItem("darkMode"));

    useEffect(() => {
        document.title = "KanBan | Permission Table";
        ResetRoles();
        fetchBoardPermissions();
        getAllPermissions();
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
            setError(error?.response?.data);
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
            setError(error?.response?.data);
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
            setNewRoleName("");
        } catch (error) {
            setError(error?.response?.data);
        }
    }

    function getBaseRole(roles) {
        if (roles.length === 0) {
            return null;
        }

        const baseRole = roles.reduce((minRole, currentRole) => {
            return currentRole.role_id < minRole.role_id ? currentRole : minRole;
        }, roles[0]);

        return baseRole;
    }

    function isBaseRole(roleId) {
        const minRoleId = Math.min(...roles.map(role => role.role_id));
        return roleId === minRoleId;
    }

    async function DeleteRole(role_id) {
        try {

            const baseRole = getBaseRole(roles);
            if (baseRole && baseRole.role_id === role_id) {
                throw new Error("Cannot delete base role.");
            }

            const response = await axios.delete(
                `/boards/${board_id}/roles/${role_id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log(response);
            setRoles(roles.filter((role) => role.role_id !== role_id));
        } catch (error) {
            setError(error?.response?.data);
        }
    }

    async function DeletePermissionFromRole(role_id, permission_id) {
        try {

            const baseRole = getBaseRole(roles);
            if (baseRole && baseRole.role_id === role_id) {
                throw new Error("Cannot delete permission from base role.");
            }
            const response = await axios.delete(
                `/boards/${board_id}/roles/${role_id}/permissions/${permission_id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log(response);
            const newRoles = [...roles];
            for (let i = 0; i < newRoles.length; i++) {
                if (parseInt(newRoles[i].role_id) === parseInt(role_id)) {
                    newRoles[i].permissions.splice(
                        newRoles[i].permissions.findIndex(
                            (permission) =>
                                parseInt(permission.id) === parseInt(permission_id)
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
            setError(error?.response?.data);
        }
    }

    function handleChange(e) {
        setNewRoleName(e.target.value);
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
            setError(error?.response?.data);
        }
    }

    function handleCheckboxChange(e) {
        setNeedLoader(true);
        const baseRole = getBaseRole(roles);
        if (baseRole && baseRole.role_id === e.target.id) {
            setError("Cannot delete permission from base role.");
            return;
        }

        if (e.target.checked) {
            AddPermissionToRole(e.target.id, e.target.value);
        } else {
            DeletePermissionFromRole(e.target.id, e.target.value);
        }
    }

    function handleRoleRename(e) {
        setRenameRoleName(e.target.value);
    }

    async function handleRoleRenameSubmit(role_id) {
        setRenameIsActive(null);
        try {
            const response = await axios.put(
                `/boards/${board_id}/roles/${role_id}`,
                { name: renameRoleName },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const newRoleData = [...roles];
            newRoleData.forEach((role) => {
                if (parseInt(role.role_id) === parseInt(role_id)) {
                    role.name = renameRoleName;
                }
            });
            setRoles(newRoleData);
            setRenameRoleName("");
        } catch (error) {
            setError(error?.response?.data);
        }
    }

    return (
        <div className="content col-10" data-theme={theme}>
            {(roles.length === 0 && permissions.length === 0) || needLoader ? (
                <Loader />
            ) : (
                <div>
                    <div className="permission-table">
                        <div className="permission-table-header">
                            <div className="permission-table-header-cell">Permissions</div>
                            {roles.map((role, index) => (
                                <div
                                    key={role.role_id}
                                    className="permission-table-header-cell"
                                >
                                    <div className="role-header-div">
                                        {!renameIsActive ? (
                                            <div
                                                className="role-rename-div"
                                                onDoubleClick={() => {
                                                    if (checkPermissionForBoard(board_id, team_id, "role_management")) {
                                                        setRenameIsActive(role.role_id); // Állítsd be az aktív szerep azonosítóját
                                                    }
                                                }}
                                            >
                                                <p>{role.name}</p>
                                            </div>
                                        ) : (
                                            renameIsActive === role.role_id && ( // Only show for the active role being renamed
                                                <div className="role-rename-input">
                                                    <input
                                                        className="role-rename-input-field"
                                                        type="text"
                                                        placeholder="Rename this role..."
                                                        onChange={handleRoleRename}
                                                        value={renameRoleName}
                                                    />
                                                    <button
                                                        className="role-rename-button"
                                                        onClick={() => handleRoleRenameSubmit(role.role_id)}
                                                    >
                                                        Rename
                                                    </button>
                                                    {/* Cancel button */}
                                                    <button
                                                        className="cancel-role-button"
                                                        onClick={() => {
                                                            setRenameIsActive(null); // Reset the active role being renamed
                                                            setRenameRoleName(""); // Optionally reset the input field value
                                                        }}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            )
                                        )}
                                        {checkPermissionForBoard(
                                            board_id,
                                            team_id,
                                            "role_management"
                                        ) && !isBaseRole(role.role_id) && (
                                                <button
                                                    onClick={() => DeleteRole(role.role_id)}
                                                    className="delete-role"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="permission-table-body">
                            {permissions.map(
                                (permission) =>
                                    permission.name !== "system_admin" &&
                                    permission.name !== "user_permission" &&
                                    permission.name !== "team_management" &&
                                    permission.name !== "team_member_management" &&
                                    permission.name !== "team_member_role_management" && (
                                        <div
                                            key={permission.permission_id}
                                            className="permission-table-row"
                                        >
                                            <div className="permission-table-body-cell">
                                                {permission.name}
                                            </div>
                                            {roles.map((role) => (
                                                <div key={role.role_id} className="permission-table-body-cell">
                                                    {!isBaseRole(role.role_id) && (
                                                        <input
                                                            className="permission-checkbox"
                                                            type="checkbox"
                                                            onChange={handleCheckboxChange}
                                                            id={role.role_id}
                                                            value={permission.id}
                                                            name={permission.name}
                                                            checked={checkIfPermissionIsSet(
                                                                role.role_id,
                                                                permission.id
                                                            )}
                                                            disabled={
                                                                !checkPermissionForBoard(
                                                                    board_id,
                                                                    team_id,
                                                                    "roles_permissions_management"
                                                                )
                                                            }
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )
                            )}
                        </div>
                    </div>
                </div>
            )}
            {checkPermissionForBoard(board_id, team_id, "role_management") && (
                <div className="add-role">
                    <input
                        type="text"
                        onChange={handleChange}
                        value={newRoleName}
                        placeholder="Role name"
                        className="role-input"
                    />
                    <button onClick={AddNewRole} className="add-role-button">
                        Add Role
                    </button>
                </div>
            )}
            {error && (
                <ErrorWrapper
                    originalError={error}
                    onClose={() => {
                        setError(null);
                    }}
                />
            )}
        </div>
    );
}
