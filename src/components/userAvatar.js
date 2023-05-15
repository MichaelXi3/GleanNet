import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import '../style/UserAvatar.css'

export const UserAvatar = () => {
    const [user] = useAuthState(auth);
    const navigate = useNavigate();

return (
    <img 
        src={user?.photoURL || "https://s2.loli.net/2023/05/16/1IUcdnZyN5bxMhS.png"} 
        alt="User avatar" 
        onClick={() => navigate("/user-detail")} 
        className="user-avatar" 
    />
    );
};