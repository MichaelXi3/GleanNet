import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/SuccessPage.css';

export const Success = () => {
    const navigate = useNavigate();

    const handleButtonClick = () => {
        navigate('/');
    }

    return (
        <div className="success-page">
            <h1>Submission Successful!</h1>
            <p>Thank you for your contribution. Your submission has been successfully received.</p>
            <button onClick={handleButtonClick}>Back to Main Page</button>
        </div>
    );
}
