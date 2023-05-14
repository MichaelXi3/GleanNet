import React from 'react';
import { doc, deleteDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '../config/firebase'; 

export const Resource = ({ resource, onDelete }) => {
  // Resource deletion
  const deleteResource = async (id) => {
    const resourceDoc = doc(db, "Resources", id);

    // Delete the 'tags' subcollection
    const tagsCollectionRef = collection(resourceDoc, 'tags');
    const tagsSnapshot = await getDocs(tagsCollectionRef);
    tagsSnapshot.docs.forEach(async (docSnap) => {
        await deleteDoc(doc(tagsCollectionRef, docSnap.id));
    });
    // Delete the resource doc
    await deleteDoc(resourceDoc);
    // Sync the frontend state after deletion
    onDelete(id);
  }

  return (
    <div key={resource.id}>
      <h1> {resource.name} </h1>
      <p> {resource.desc} </p>
      <p> Tags: {resource.tags.join(', ')} </p>
      <img src={resource.logoURL} alt={resource.name} />
      <a href={resource.link}>Resource Link</a>
      <p> Upvotes: {resource.upvote} </p>
      <p> Published by: {resource.publisher} </p>
      <p> Release Date: {resource.createDate} </p>
      <p> {resource.longDesc} </p>
      <div>
        {resource.imageURL && resource.imageURL.map((screenshotURL, index) => (
            <img key={index} src={screenshotURL} alt={`Screenshot ${index + 1}`} />
        ))}
      </div>

      <button onClick={() => deleteResource(resource.id)}> Delete </button>
    </div>
  );
}
