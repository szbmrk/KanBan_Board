import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Navigation/SideBar";
import Login from "./components/user/Login";
import Signup from "./components/user/Signup";
import ForgotPassword from "./components/user/ForgotPassword";
import ResetPassword from "./components/user/ResetPassword";
import Boards from "./components/Boards/Boards";
import AuthProvider from "./auth/AuthProvider";
import ProtectedRoute from "./auth/ProtectedRoute";
import "./styles/general.css";
import Navbar from "./components/Navigation/NavBar";
import AssignedTasks from "./components/AssignedTasks/AssignedTasks";
import FavouriteBoards from "./components/FavouriteBoards/FavouriteBoards";
import Teams from "./components/Teams/Teams";
import Board from "./components/Board/Board";
import ManageBoardPermissions from "./components/Permissions/ManageBoardPermissions";
import EditProfile from "./components/Profile/EditProfile";
import Permissiontable from "./components/Permissions/Permissiontable";
import VerifyEmail from "./components/user/VerifyEmail";
import Dashboard from "./components/Dashboard/Dashboard";
import { useEffect, useState } from "react";

const App = () => {
    return (
        <>
            <BrowserRouter basename="/agi-kanban">
                <AuthProvider>
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    {" "}
                                    <Navigate to="/boards" />{" "}
                                </ProtectedRoute>
                            }
                        />{" "}
                        <Route exact path="/login" element={<Login />} />
                        <Route exact path="/signup" element={<Signup />} />
                        <Route exact path="/password/email" element={<ForgotPassword />} />
                        <Route
                            exact
                            path="/password/reset/:token"
                            element={<ResetPassword />}
                        />
                        <Route exact path="/verify-email" element={<VerifyEmail />} />
                        <Route
                            exact
                            path="/board/:board_id"
                            element={
                                <ProtectedRoute>
                                    <Navbar />
                                    <Sidebar />
                                    <Board />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            exact
                            path="/board/:board_id/:column_to_show_id/:task_to_show_id"
                            element={
                                <ProtectedRoute>
                                    <Navbar />
                                    <Sidebar />
                                    <Board />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            exact
                            path="/boards"
                            element={
                                <ProtectedRoute>
                                    <Navbar />
                                    <Sidebar />
                                    <Boards />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            exact
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Navbar />
                                    <Sidebar />
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            exact
                            path="/boards/:team_name"
                            element={
                                <ProtectedRoute>
                                    <Navbar />
                                    <Sidebar />
                                    <Boards />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            exact
                            path="/favourite_boards"
                            element={
                                <ProtectedRoute>
                                    <Navbar />
                                    <Sidebar />
                                    <FavouriteBoards />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            exact
                            path="/assigned_tasks"
                            element={
                                <ProtectedRoute>
                                    {" "}
                                    <Navbar />
                                    <Sidebar />
                                    <AssignedTasks />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            exact
                            path="/teams"
                            element={
                                <ProtectedRoute>
                                    <Navbar />
                                    <Sidebar />
                                    <Teams />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            exact
                            path="/permissiontable"
                            element={
                                <ProtectedRoute>
                                    <Navbar />
                                    <Sidebar />
                                    <ManageBoardPermissions />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            exact
                            path="/permissions/:team_id/:board_id"
                            element={
                                <ProtectedRoute>
                                    <Navbar />
                                    <Sidebar />
                                    <Permissiontable />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            exact
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <Navbar />
                                    <Sidebar />
                                    <EditProfile />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </AuthProvider>
            </BrowserRouter>
        </>
    );
};

export default App;
