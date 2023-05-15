import React, { useEffect, useState } from 'react';
import { auth } from '../config/firebase';
import '../style/UserDetailPage.css';

export const UserDetail = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
  }, []);

  return (
    <div className="user-detail-container">
      <div className="user-detail-banner">
        {/* <img src={"https://s2.loli.net/2023/05/16/Bk69gPfZESthlX5.png"} />
        <h2>User Detail Page</h2> */}
      </div>
      {user ? (
        <div className="user-detail-info">
          <img src={user.photoURL || 'https://s2.loli.net/2023/05/16/1IUcdnZyN5bxMhS.png'} alt="User avatar" className="user-avatar" />
          <p><b>Email: </b>{user.email}</p>
          <p><b>Display Name: </b>{user.displayName || 'N/A'}</p>
          <p><b>User ID: </b>{user.uid}</p>
        </div>
      ) : (
        <p>No user is currently logged in.</p>
      )}
    </div>
  );
};

export default UserDetail;
