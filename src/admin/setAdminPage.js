import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../config/firebase'; 
import '../style/SetAdminPage.css';

export const SetAdmin = () => {
    const [adminEmail, setAdminEmail] = useState("");
    const [functionMsg, setFunctionMsg] = useState(null);

    const addAdmin = async () => {
        const functions = getFunctions(app);
        const addAdminRole = httpsCallable(functions, 'addAdminRole');
        const result = await addAdminRole({ email: adminEmail });
        setFunctionMsg(result.data.message);
    }

    return (
        <div className="admin-container">
            <h2>Administration</h2>
            <div className="admin-info">
                <h2>Add Admin</h2>
                <input 
                  className="admin-input"
                  placeholder="Enter user email to make them an admin" 
                  type="text" 
                  id="addAdmins" 
                  value={adminEmail} 
                  onChange={e => setAdminEmail(e.target.value)} 
                />
                <span className="admin-message">{functionMsg}</span>
                <button className="admin-button" onClick={addAdmin}>Submit</button>
            </div>
        </div>
    );
};
