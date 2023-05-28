import React, { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc, arrayRemove, arrayUnion, onSnapshot } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../config/firebase';
import { Link, useNavigate } from 'react-router-dom';
import '../style/ResourceBanner.css';

export const ResourceBanner = ({ resource }) => {
  const [currentUserUID, setCurrentUserUID] = useState(null);
  const [resourceData, setResourceData] = useState(resource);

  const navigate = useNavigate();

  // Fetch user id 
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserUID(user.uid);
      } else {
        setCurrentUserUID(null);
      }
    });

    return () => unsubscribe();
  }, []);
  
  // Listen to resource changes
  useEffect(() => {
    if (resource && resource.id) {
      const resourceRef = doc(db, "Resources", resource.id);
  
      const unsubscribe = onSnapshot(resourceRef, (doc) => {
        setResourceData(doc.data());
      });
  
      return () => unsubscribe();
    }
  }, [resource]);

  // Handle resource upvote
const handleUpvote = async (id, currentUserUID) => {
  if (id && currentUserUID) {
    const resourceDoc = doc(db, "Resources", id);
    const resourceSnapshot = await getDoc(resourceDoc);

    if (resourceSnapshot.exists()) {
      const data = resourceSnapshot.data();
      const upvotedUsers = data.upvotedUsers || [];

      if (upvotedUsers.includes(currentUserUID)) {
        // If the user has already upvoted. We will remove their upvote.
        await updateDoc(resourceDoc, {
          upvote: data.upvote - 1,
          upvotedUsers: arrayRemove(currentUserUID),
        });
      } else {
        // If the user has not upvoted yet. We will add their upvote.
        await updateDoc(resourceDoc, {
          upvote: data.upvote + 1,
          upvotedUsers: arrayUnion(currentUserUID),
        });
      }
    } else {
      console.log(`No document found with id: ${id}`);
    }
  } else {
    // alert('Please login first before upvote.');
    navigate('/login');
  }
}


  return (
    <div className="resource-banner">
      <img className="resource-banner-logo" src={resourceData.logoURL} alt={resourceData.name} />
      <div className="resource-banner-details">
        <h2 className="resource-banner-name">{resourceData.name}</h2>
        <p className="resource-banner-desc">{resourceData.desc}</p>
        <p className="resource-banner-info">Type: {resourceData.type}</p>
        {/* <p className="resource-banner-info">Author: {resourceData.publisher}</p> */}
        <Link to={`/resources/${resource.id}`} className="resource-banner-link">View Details</Link>
      </div>
      <button onClick={() => handleUpvote(resource.id, currentUserUID)}>Upvote {resourceData.upvote}</button>
    </div>
  );
}
