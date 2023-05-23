import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Link } from 'react-router-dom';
import '../style/ResourceBanner.css';

export const ResourceUpdateBannerAdmin = ({ resource }) => {
  const [resourceData, setResourceData] = useState(resource);

  // Listen to pending resource changes
  useEffect(() => {
    if (resource && resource.id) {
      const resourceRef = doc(db, "PendingUpdates", resource.id);
  
      const unsubscribe = onSnapshot(resourceRef, (doc) => {
        setResourceData(doc.data());
      });
  
      return () => unsubscribe();
    }
  }, [resource]);

  return (
    <div className="resource-banner">
      <img className="resource-banner-logo" src={resourceData.logoURL} alt={resourceData.name} />
      <div className="resource-banner-details">
        <h2 className="resource-banner-name">{resourceData.name}</h2>
        <p className="resource-banner-desc">{resourceData.desc}</p>
        <p className="resource-banner-info">Type: {resourceData.type}</p>
        <Link to={{
          pathname: `/admin/resource-update-review/${resource.id}`,
        }} className="resource-banner-link">Go to Review Page</Link>
      </div>
    </div>
  );
}
