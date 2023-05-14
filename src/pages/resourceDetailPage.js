import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { doc, onSnapshot, collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

import { Resource } from '../components/resource';
import '../style/ResourceDetailPage.css';

export const ResourceDetailPage = () => {
  const [resource, setResource] = useState(null);
  const { id } = useParams(); // The ID from the URL
  const navigate = useNavigate();
  
  // useEffect hook is subscribing to real-time updates of a document in the Firestore database
  useEffect(() => {
    const resourceRef = doc(db, "Resources", id);
    // real-time listener on the document reference
    const  subscribe = onSnapshot(resourceRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
    
          // Get 'tags' subcollection
          const tagsCollectionRef = collection(resourceRef, 'tags');
          getDocs(tagsCollectionRef).then((querySnapshot) => {
            const tags = querySnapshot.docs.map(doc => doc.id); 
            setResource({ id: docSnap.id, ...data, tags }); // All data needed for a resource
          });
        }
    });

    return subscribe;
  }, [id]); // useEffect hook runs whenever id changes

  const handleDelete = (id) => {
    // Navigate to main page
    navigate('/');
  }

  return (
    <div className="resource-detail-page">
      {resource && <Resource resource={resource} onDelete={handleDelete} />}
    </div>
  );
}
