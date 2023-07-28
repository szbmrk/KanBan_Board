import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/user/Login';
import Signup from './components/user/Signup';
import axios from './api/axios'
import Dashboard from './components/Dashboard';
import DragDrop from './components/DragDrop';
import AuthProvider from "./auth/AuthProvider";
import ProtectedRoute from "./auth/ProtectedRoute";

const App = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<ProtectedRoute> <Navigate to="/dashboard" /> </ProtectedRoute>} />
                    <Route exact path="/login" element={<Login />} />
                    <Route exact path="/signup" element={<Signup />} />
                    <Route exact path="/test" element={<DragDrop />} />
                    <Route exact path="/dashboard" element={<ProtectedRoute> <Dashboard /> </ProtectedRoute>} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
};

export default App;
