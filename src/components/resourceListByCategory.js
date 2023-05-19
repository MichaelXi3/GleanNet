import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useParams } from 'react-router-dom';
import { ResourceBanner } from './resourceBanner';


export const ResourceListByCategory = () => {
  const [resources, setResources] = useState([]);
  const { category } = useParams();
  
  // Fetch resources with certain tag
  useEffect(() => {
    const fetchResources = async () => {
        const tagDocRef = doc(db, 'Tags', category);
        const tagDoc = await getDoc(tagDocRef);
        
        if (tagDoc.exists()) {
            const resourceIds = tagDoc.data().resources;
            const resourcesData = [];
        
            for (let id of resourceIds) {
                const resourceDocRef = doc(db, 'Resources', id);
                const resourceDoc = await getDoc(resourceDocRef);
            
                if (resourceDoc.exists()) {
                    resourcesData.push({...resourceDoc.data(), id: resourceDoc.id});
                }
            }

            // Sort resourcesData by upvote in descending order
            resourcesData.sort((a, b) => b.upvote - a.upvote);
            setResources(resourcesData);
        }
    }
      
    fetchResources();
  }, [category]);

  return (
    <div>
      <h2>{category} List</h2>
      {resources.map(resource => <ResourceBanner key={resource.id} resource={resource} />)}
    </div>
  );
}
