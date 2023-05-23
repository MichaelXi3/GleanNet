import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useParams } from 'react-router-dom';
import { ResourceBanner } from './resourceBanner';
import { Loading } from '../pages/loadingPage';

import '../style/ResourceListByCategory.css';

export const ResourceListByCategory = () => {
  const [resources, setResources] = useState([]);                 // All resource objects given current category
  const [filteredResources, setFilteredResources] = useState([]); // Resource objects filtered by resource type
  const [resourceTypes, setResourceTypes] = useState([]);         // All available resource types
  const [selectedType, setSelectedType] = useState('All');        // User selected type
  const [isLoading, setIsLoading] = useState(true);

  const { category } = useParams();
  
  // Fetch all resources with current tag
  useEffect(() => {
    const fetchResources = async () => {
        const tagDocRef = doc(db, 'Tags', category);
        const tagDoc = await getDoc(tagDocRef);
        
        if (tagDoc.exists()) {
            const resourceIds = tagDoc.data().resources;
            const resourcesData = [];
            const types = new Set();
        
            for (let id of resourceIds) {
                const resourceDocRef = doc(db, 'Resources', id);
                const resourceDoc = await getDoc(resourceDocRef);
            
                if (resourceDoc.exists()) {
                    const resource = { ...resourceDoc.data(), id: resourceDoc.id };
                    resourcesData.push(resource);
                    types.add(resource.type);
                }
            }

            // Sort resourcesData by upvote in descending order
            resourcesData.sort((a, b) => b.upvote - a.upvote);
            setResources(resourcesData);
            setResourceTypes(['All', ...types]);
            setFilteredResources(resourcesData);
        }
    }
      
    fetchResources();
    setIsLoading(false);
  }, [category]);

  // Listen to selection of resource type
  useEffect(() => {
    if (selectedType === 'All') {
      setFilteredResources(resources);
    } else {
      setFilteredResources(resources.filter(resource => resource.type === selectedType));
    }
  }, [selectedType, resources]);

  const handleTypeSelection = (type) => {
    setSelectedType(type);
  }

  if(isLoading) {
    return <Loading />;
  }

  return (
    <div className="category-resource-list">
      <h2>{category} List</h2>
      {/* List of resource type button */}
      <div>
        {resourceTypes.map(type => (
          <button
            key={type}
            onClick={() => handleTypeSelection(type)}
            className={selectedType === type ? 'selected' : ''}
          >
            {type}
          </button>
        ))}
      </div>
      {/* Resource list */}
      {filteredResources.map(resource => <ResourceBanner key={resource.id} resource={resource} />)}
    </div>
  );
}
