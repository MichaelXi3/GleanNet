import React, { useEffect, useState } from 'react';
import { auth } from '../config/firebase';
import { doc, getDoc } from "firebase/firestore"; 
import { db } from '../config/firebase';
import { signOut } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { ResourceBanner } from '../components/resourceBanner';
import '../style/UserDetailPage.css';
import { Loading } from './loadingPage';

export const UserDetail = () => {
  const [user, setUser] = useState(null);
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Get the current user document
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        // Check if the user document exists
        if (userDoc.exists()) {
          // Add the username to the user object
          user.username = userDoc.data().username;
          setUser(user);

          // Get the submittedPosts array from the user document
          const submittedPosts = userDoc.data().submittedPosts;

          // Fetch the resources that the user has created
          const resourceDocs = await Promise.all(submittedPosts.map(async (postId) => {
            const postDoc = await getDoc(doc(db, "Resources", postId));
            return {
              ...postDoc.data(),
              id: postId,
            };
          }));

          setResources(resourceDocs);
        } else {
          console.log("No such user document!");
        }
      } else {
        setUser(null);
        setResources([]);
      }
      setIsLoading(false);
    });
  }, []);

  const logOut = async () => {
    try {
        await signOut(auth);
        console.log("User Logged Out");
        navigate('/');
    } catch (err) {
        console.log(err);
    }
  }

  const goToAdminPage = async () => {
    try {
        navigate('/admin');
    } catch (err) {
        console.log(err);
    }
  }

  return (
    <div className="user-detail-container">
      <div className="user-detail-banner">
      </div>
      {user ? (
        <div className="user-detail-info">
          <img src={user.photoURL || 'https://s2.loli.net/2023/05/16/1IUcdnZyN5bxMhS.png'} alt="User avatar" className="user-avatar" />
          <p><b>Email: </b>{user.email}</p>
          <p><b>Display Name: </b>{user.username || 'N/A'}</p>

          <div className="user-submitted-resources">
            <h2>Submitted Resources</h2>
            {resources.map((resource, index) => (
              <ResourceBanner key={index} resource={resource} />
            ))}
          </div>
          <button onClick={logOut}> Logout </button>
          <button onClick={goToAdminPage}> Admin Page </button>
        </div>
      ) : (
        <p></p>
      )}
    </div>
  );
};

export default UserDetail;
