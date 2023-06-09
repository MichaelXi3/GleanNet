import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase'; 
import { ResourceBanner } from './resourceBanner';
import { Loading } from '../pages/loadingPage';
import '../style/ResourceList.css';

export const ResourceList = () => {
  const [resourceList, setResourceList] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Disable loading
  const resourceCollection = collection(db, "Resources");

  // Get Resources List right after render is committed to the screen
  useEffect(() => {
    getResourceList();
    setIsLoading(false);
  }, [])

  const getResourceList = async () => {
    try {
      const data = await getDocs(resourceCollection);
      const filteredData = await Promise.all(
        data.docs.map(async (doc) => {
          // Query the 'tags' subcollection for the resource's tag names
          const tagsCollection = collection(doc.ref, 'tags');
          const tagsSnapshot = await getDocs(tagsCollection);
          const tagsData = tagsSnapshot.docs.map((tagDoc) => tagDoc.id);
  
          return {
            ...doc.data(),
            id: doc.id,
            tags: tagsData,
          };
        })
      );
      setResourceList(filteredData);
    } catch (err) {
      console.log(err);
    }
  }

  const deleteResourceFromState = (id) => {
    setResourceList(resourceList.filter(resource => resource.id !== id));
  }

  if(isLoading) {
    return <Loading />;
  }

  return (
    <div className='resource-list'>
      {/* <h1> Resource List </h1> */}
      <div className='resource-items'>
        {resourceList.map((resource) => (
            <div className='resource-item' key={resource.id}>
              <ResourceBanner resource={resource} />
            </div>
        ))}
      </div>
    </div>
  );
}