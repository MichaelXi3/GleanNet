import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/SuccessPage.css';

export const RegisterSuccess = () => {
    const navigate = useNavigate();

    const handleButtonClick = () => {
        navigate('/');
    }

    return (
        <div className="success-page">
            <h1>Registration Successful!</h1>
            <p>Welcome to the GleanNet community!</p>
            <button onClick={handleButtonClick}>Back to Home Page</button>
        </div>
    );
}
