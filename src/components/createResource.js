import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore'; 
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db } from '../config/firebase'; 

export const CreateResource = () => {
  const [newResourceName, setNewResourceName] = useState("");
  const [newResourceDesc, setNewResourceDesc] = useState("");
  const [newResourceLongDesc, setNewResourceLongDesc] = useState("");
  const [newResourceLink, setNewResourceLink] = useState("");
  const [newResourcePublisher, setNewResourcePublisher] = useState("");
  const [newResourceLogo, setNewResourceLogo] = useState(null);
  const [newResourceScreenshots, setNewResourceScreenshots] = useState([]);
  const [newResourceTags, setNewResourceTags] = useState([]);


  const resourceCollection = collection(db, "Resources");
  const navigate = useNavigate();
  
  // Upload the resource to Firestore and Firebase Storage
  const onSubmitResource = async () => {
    try {
      const storage = getStorage();
      const newResourceCreateDate = new Date().toISOString().slice(0, 10);
      const newResourceUpvote = 0;
      
      // Initialize the Upload of logo to Firebase Storage
      const logoStorageRef = ref(storage, `ResourceLogos/${newResourceLogo.name}`);
      const logoUploadTask = uploadBytesResumable(logoStorageRef, newResourceLogo);

      console.log(newResourceScreenshots);

      // Initialize the Upload of resource screenshots to Firebase Storage
      const screenshotUploadTasks = newResourceScreenshots.map((screenshot, i) => {
        const screenshotStorageRef = ref(storage, `ResourceImages/${screenshot.name}-${i}`);
        const screenshotUploadTask = uploadBytesResumable(screenshotStorageRef, screenshot);
        return new Promise(( resolve, reject ) => {
            screenshotUploadTask.on('state_changed',
              (snapshot) => {
              }, 
              (error) => {
                console.log(error);
              }, 
              async () => {
                getDownloadURL(screenshotUploadTask.snapshot.ref).then((screenshotDownloadURL) => {
                    console.log('Screenshot URL is: ', screenshotDownloadURL);
                    resolve(screenshotDownloadURL);
                }).catch(reject);
              },
              reject
            );
          });
       });
      
      // Upload tasks begin
      logoUploadTask.on('state_changed', 
        (snapshot) => {
          // console.log(snapshot);
        }, 
        (error) => {
          console.log(error);
        }, 
        async () => {
            // Handle logo image URL - one image
            const logoDownloadURL = await getDownloadURL(logoUploadTask.snapshot.ref);
            console.log('Resource Logo URL is: ', logoDownloadURL);

            // Handle resource screenshots images URL by 'Promise.all' - multiple images
            Promise.all(screenshotUploadTasks).then(async (screenshotDownloadURLs) => {
              // Add the new resource to Firestore, including the screenshots URL and tags
              const docRef = await addDoc(resourceCollection, {
                name: newResourceName,
                desc: newResourceDesc,
                longDesc: newResourceLongDesc,
                link: newResourceLink,
                publisher: newResourcePublisher,
                upvote: newResourceUpvote,
                logoURL: logoDownloadURL,
                imageURL: screenshotDownloadURLs,
                createDate: newResourceCreateDate
              });
            
              // Add tags as a subcollection
              const tagsCollectionRef = collection(docRef, "tags");
              newResourceTags.forEach(async (tagName) => {
                  tagName = tagName.trim();
                  // console.log(tagName);
                  const tagRef = doc(tagsCollectionRef, tagName);
                  await setDoc(tagRef, {}); 
              });

              // Clear the input form
              setNewResourceName("");
              setNewResourceDesc("");
              setNewResourceLongDesc("");
              setNewResourceLink("");
              setNewResourcePublisher("");
              setNewResourceTags([]);
              setNewResourceScreenshots([]);
              setNewResourceLogo(null);
            }).catch(console.error);
        }
      );
      // Push to success page
      navigate('/success');
    } catch (err) {
      console.log(err);
    }
  };

  const handleTagsChange = (e) => {
    setNewResourceTags(e.target.value.split(','));
  }

  return (
    <div>
      <input 
        placeholder='Resource name...'
        value={newResourceName}
        onChange={(e) => setNewResourceName(e.target.value)}
      />
      <label>
        Resource logo
        </label>
      <input 
        type="file"
        onChange={(e) => setNewResourceLogo(e.target.files[0])}
      />
      <input 
        placeholder='One sentence description...'
        value={newResourceDesc}
        onChange={(e) => setNewResourceDesc(e.target.value)}
      />
      <input 
        placeholder='Detailed description...'
        value={newResourceLongDesc}
        onChange={(e) => setNewResourceLongDesc(e.target.value)}
      />
      <input 
        placeholder='Resource Link...'
        value={newResourceLink}
        onChange={(e) => setNewResourceLink(e.target.value)}
      />
      <input 
        placeholder='Publisher...'
        value={newResourcePublisher}
        onChange={(e) => setNewResourcePublisher(e.target.value)}
      />
      <input 
        placeholder='Tags (comma-separated)...'
        onChange={handleTagsChange}
      />
      <label>
        Screenshots of your resource
      </label>
      <input 
        type="file"
        multiple
        onChange={(e) => setNewResourceScreenshots(oldScreenshots => [...oldScreenshots, ...Array.from(e.target.files)])} 
      />
      <button onClick={onSubmitResource}>Submit</button>
    </div>
  );
};
