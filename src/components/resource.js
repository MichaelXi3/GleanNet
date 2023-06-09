import React, { useState, useEffect } from 'react';
import { doc, deleteDoc, updateDoc, getDocs, getDoc, collection, arrayRemove, arrayUnion } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import useAuth from '../routes/useAuth';

import '../style/ResourceDetail.css'

export const Resource = ({ resource, onDelete }) => {
  const [username, setUsername] = useState("");
  const [currentUserUID, setCurrentUserUID] = useState(null);
  const { currentUser, isAdmin } = useAuth();

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

  // Fetch username
  useEffect(() => {
    const fetchUsername = async () => {
        if (resource.userID) {
            const userDocRef = doc(db, "users", resource.userID);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                setUsername(userDoc.data().username);
            } else {
                console.log("No such user!");
            }
        }
    };

    fetchUsername();
  }, [resource]);

  // Resource deletion
  const deleteResource = async (id) => {
    const resourceDoc = doc(db, "Resources", id);
    const publisherID = resource.userID;

    // Remove post id from user's submitted posts
    const userDocRef = doc(db, 'users', publisherID);
    await updateDoc(userDocRef, {
      submittedPosts: arrayRemove(id),
    });

    // Delete the 'tags' subcollection of resource doc and update the Tags collection
    const tagsCollectionRef = collection(resourceDoc, 'tags');
    const tagsSnapshot = await getDocs(tagsCollectionRef);
    await Promise.all(tagsSnapshot.docs.map(async (docSnap) => {
      const tag = docSnap.id; // Document id is the tag name
      const tagDocRef = doc(db, 'Tags', tag);
      
      // Remove the resource id from the Tags collection - tag name doc's resource array
      await updateDoc(tagDocRef, {
        resources: arrayRemove(id),
      });
      // Delete the tag from the resource's tags subcollection
      await deleteDoc(doc(tagsCollectionRef, tag));
    }));

    // Delete the resource doc
    await deleteDoc(resourceDoc);
    // Sync the frontend state after deletion
    onDelete(id);
  }

  const goToUpdateResource = (id) => {
    navigate(`/update/${id}`);
  };

  // Handle resource upvote
  const handleUpvote = async (id, currentUserUID) => {
    const resourceDoc = doc(db, "Resources", id);
    const resourceSnapshot = await getDoc(resourceDoc);

    if (currentUserUID === null) {
      // alert('Please login first before upvote.');
      navigate('/login');
      return;
    }
    
    if (resourceSnapshot.exists()) {
      const data = resourceSnapshot.data();
      const upvotedUsers = data.upvotedUsers || [];
  
      if (upvotedUsers.includes(currentUserUID)) {
        // If the user has already upvoted. We will remove their upvote
        await updateDoc(resourceDoc, {
          upvote: data.upvote - 1,
          upvotedUsers: arrayRemove(currentUserUID),
        });
      } else {
        // If the user has not upvoted yet. We will add their upvote
        await updateDoc(resourceDoc, {
          upvote: data.upvote + 1,
          upvotedUsers: arrayUnion(currentUserUID),
        });
      }
    }
  }

  // Navigate Category List
  const goToCategoryList = (tag) => {
    navigate(`/categories/${tag}`);
  }

  return (
    <div className="resource-detail container">
      <div className="flexbox top">
        <div className="logo-info">
          <img className="logo" src={resource.logoURL} alt={resource.name} />
          <div className="info">
            <h1> {resource.name} </h1>
            <p> {resource.desc} </p>
            <p> Resource Type: {resource.type} </p>
            <div className="tags">
              {resource.tags.map((tag, index) => (
                <button onClick={() => goToCategoryList(tag)} key={index} className="tag-button">{tag}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
  
      <div className="flexbox second">
        <div className="access-upvote">
          <a href={resource.link} className="access-button">Access</a>
          <button onClick={() => handleUpvote(resource.id, currentUserUID)} className="upvote-button"> Upvote {resource.upvote} </button>
        </div>
      </div>
  
      <div className="flexbox third screenshots">
        {resource.imageURL && resource.imageURL.map((screenshotURL, index) => (
          <div className="screenshot-item" key={index}>
            <img src={screenshotURL} alt={`Screenshot ${index + 1}`} />
          </div>
        ))}
      </div>
  
      <div className="flexbox fourth">
        <div className="longDesc">
            <h1> Resource Description </h1>
            <p> {resource.longDesc} </p>
        </div>
      </div>
  
      <div className="flexbox fifth author-publisher">
        <p> Resource Author: {resource.publisher} </p>
        <p> Resource Publisher: {username}</p>
        <p> Publish Date: {resource.createDate} </p>
      </div>
  
      {(currentUserUID === resource.userID || isAdmin) && (
        <div className="flexbox sixth delete-update">
          <button style={{padding: 11, borderRadius: 5}} onClick={() => deleteResource(resource.id)}> Delete </button>
          <button style={{padding: 11, borderRadius: 5}} onClick={() => goToUpdateResource(resource.id)}> Update </button>
        </div>
      )}
    </div>
  );  
}
