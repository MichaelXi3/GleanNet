import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import '../style/CategoryBanner.css';

export const CategoryBanner = ({ category }) => {
  const [resourceCount, setResourceCount] = useState(0);

  useEffect(() => {
    const fetchResourceCount = async () => {
      const tagDocRef = doc(db, 'Tags', category);
      const tagDoc = await getDoc(tagDocRef);
      if (tagDoc.exists()) {
        setResourceCount(tagDoc.data().resources.length);
      }
    }
    fetchResourceCount();
  }, [category]);

  return (
    <div className="category-banner">
      <div className="category-banner-details">
        <h2 className="category-banner-name">{category}</h2>
        <p>Total Resources: {resourceCount}</p>
        <Link to={`/categories/${category}`} className="category-banner-link">View Details</Link>
      </div>
    </div>
  );
}
