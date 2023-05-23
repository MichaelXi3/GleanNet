import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase'; 
import { ResourceBannerAdmin } from './resourceBannerAdmin';
import { ResourceUpdateBannerAdmin } from './resourceUpdateBannerAdmin';
import { Loading } from '../pages/loadingPage';

export const AdminPage = () => {
  const [pendingResources, setPendingResources] = useState([]);
  const [pendingUpdates, setPendingUpdates] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('PendingResources');
  const categories = ['PendingResources', 'PendingUpdates'];

  const pendingResourceCollection = collection(db, "PendingResources");
  const pendingUpdateCollection = collection(db, "PendingUpdates");

  useEffect(() => {
    getPendingResources();
    getPendingUpdates();
  }, [])  
  
  // Get all pending new resource submissions
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
  
  // Get all pending update resource submissions
  const getPendingUpdates = async () => {
    try {
      const data = await getDocs(pendingUpdateCollection);
      setPendingUpdates(data.docs.map(doc => ({ 
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
    return <Loading />;
  }

  return (
    <div className='App'>
      <h1>Admin Panel</h1>
      {/* Category selection buttons */}
      <div>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={selectedCategory === category ? 'selected' : ''}
          >
            {category}
          </button>
        ))}
      </div>
      {/* List display based on the selected category */}
      <div>
        {selectedCategory === 'PendingResources' && pendingResources.map((resource) => {
            if (resource && resource.id) {
                return (
                <div key={resource.id}>
                    <ResourceBannerAdmin resource={resource} />
                </div>
                )
            }
            return null;
        })}
  
        {selectedCategory === 'PendingUpdates' && pendingUpdates.map((update) => {
            if (update && update.id) {
                return (
                <div key={update.id}>
                    <ResourceUpdateBannerAdmin resource={update} />
                </div>
                )
            }
            return null;
        })}
      </div>
    </div>
  );
}
