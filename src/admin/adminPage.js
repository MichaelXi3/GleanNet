import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase'; 
import { ResourceBannerAdmin } from './resourceBannerAdmin';

export const AdminPage = () => {
  const [pendingResources, setPendingResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const pendingResourceCollection = collection(db, "PendingResources");

  useEffect(() => {
    getPendingResources();
  }, [])  
  
  // Get all pending resource documents
  const getPendingResources = async () => {
    try {
      const data = await getDocs(pendingResourceCollection);
      setPendingResources(data.docs.map(doc => ({ 
        ...doc.data(), 
        id: doc.id 
      })));
      setIsLoading(false);
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  }

  if(isLoading) {
    return <div>Loading...</div> 
  }

  return (
    <div className='App'>
      <h1>Admin Panel</h1>
      <div>
        {pendingResources.map((resource) => {
            if (resource && resource.id) {
                return (
                <div key={resource.id}>
                    <ResourceBannerAdmin resource={resource} />
                </div>
                )
            }
            return null;
        })}
      </div>
    </div>
  );
}
