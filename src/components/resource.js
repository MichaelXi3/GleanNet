import React, { useState, useEffect } from 'react';
import { doc, deleteDoc, updateDoc, getDocs, getDoc, collection, arrayRemove, arrayUnion } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { db } from '../config/firebase'; 

export const Resource = ({ resource, onDelete }) => {
  const [username, setUsername] = useState("");
  const [currentUserUID, setCurrentUserUID] = useState(null);

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
    const auth = getAuth();
    const userID = auth.currentUser?.uid; 

    // If user is logged in, remove post id from user's submitted posts
    if (userID) {
      const userDocRef = doc(db, 'users', userID);
      await updateDoc(userDocRef, {
        submittedPosts: arrayRemove(id),
      });
    }

    // Delete the 'tags' subcollection of resource doc and update the Tags collection
    const tagsCollectionRef = collection(resourceDoc, 'tags');
    const tagsSnapshot = await getDocs(tagsCollectionRef);
    tagsSnapshot.docs.forEach(async (docSnap) => {
        const tag = docSnap.id; // Document id is the tag name
        const tagDocRef = doc(db, 'Tags', tag);
        await updateDoc(tagDocRef, {
          resources: arrayRemove(id),
        });
        await deleteDoc(doc(tagsCollectionRef, tag));
    });

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
      alert('Please login first before upvote.');
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

  return (
    <div key={resource.id}>
      <h1> {resource.name} </h1>
      <p> {resource.desc} </p>
      <p> Tags: {resource.tags.join(', ')} </p>
      <img src={resource.logoURL} alt={resource.name} />
      <a href={resource.link}>Resource Link</a>
      <p> Upvotes: {resource.upvote} </p>
      <button onClick={() => handleUpvote(resource.id, currentUserUID)}> Upvote </button>
      <p> Resource Type: {resource.type} </p>
      <p> Resource Author: {resource.publisher} </p>
      <p> Resource Poster: {username}</p>
      <p> Release Date: {resource.createDate} </p>
      <p> {resource.longDesc} </p>
      <div>
        {resource.imageURL && resource.imageURL.map((screenshotURL, index) => (
            <img key={index} src={screenshotURL} alt={`Screenshot ${index + 1}`} />
        ))}
      </div>

      {currentUserUID === resource.userID && <button onClick={() => deleteResource(resource.id)}> Delete </button>}
      {currentUserUID === resource.userID && <button onClick={() => goToUpdateResource(resource.id)}> Update </button>}
    </div>
  );
}
