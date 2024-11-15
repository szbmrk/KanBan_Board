import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from './AuthContext';

const ProtectedRoute = ({ children }) => {
    const authCtx = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        const username = sessionStorage.getItem('username');
        const email = sessionStorage.getItem('email');
        if (!token || !username || !email) {
            authCtx.onLogout();
            navigate('/login');
        }
    }, []);

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        const username = sessionStorage.getItem('username');
        const email = sessionStorage.getItem('email');
        if (!token || !username || !email) {
            setTimeout(() => {
                authCtx.onLogout();
                navigate('/login');
            }, 100);
        }
    }, [sessionStorage.getItem('token')]);

    return children;
};

export default ProtectedRoute;
