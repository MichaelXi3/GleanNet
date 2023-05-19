import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { CategoryBanner } from '../components/categoryBanner';


export const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  
  // Fetch all available categories
  useEffect(() => {
    const fetchCategories = async () => {
      const tagsCollectionRef = collection(db, 'Tags');
      const querySnapshot = await getDocs(tagsCollectionRef);
      setCategories(querySnapshot.docs.map(doc => doc.id));
    }

    fetchCategories();
  }, []);

  return (
    <div>
      <h1>Resource Categories</h1>
      {categories.map(category => <CategoryBanner key={category} category={category} />)}
    </div>
  );
}
