import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    if (!currentUser) {
        navigate('/login');
        return null; // 或者返回一个 loading 状态
    }

    return <>{children}</>;
};

export default PrivateRoute; 