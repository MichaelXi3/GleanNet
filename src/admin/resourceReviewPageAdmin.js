import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, doc, setDoc, deleteDoc, updateDoc, arrayUnion, getDoc, getDocs, arrayRemove, addDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db } from '../config/firebase';
import '../style/CreateResourceComponent.css';

export const ResourceReviewPageAdmin = () => {
  // Get current resource id from URL
  const { id } = useParams();
  const navigate = useNavigate();
  const delay = ms => new Promise(res => setTimeout(res, ms));
  const storage = getStorage();

  const [newResourceName, setNewResourceName] = useState("");
  const [newResourceDesc, setNewResourceDesc] = useState("");
  const [newResourceLongDesc, setNewResourceLongDesc] = useState("");
  const [newResourceLink, setNewResourceLink] = useState("");
  const [newResourcePublisher, setNewResourcePublisher] = useState("");
  const [newResourceType, setNewResourceType] = useState("");
  const [newResourceUserID, setNewResourceUserID] = useState("");
  const [newResourceCreateDate, setNewResourceCreateDate] = useState("");
  const [newResourceUpvote, setNewResourceUpvote] = useState(0);

  const [newResourceLogo, setNewResourceLogo] = useState(null);
  const [newResourceLogoURL, setNewResourceLogoURL] = useState("");
  const [oldResourceLogo, setOldResourceLogo] = useState(""); 

  const [newResourceScreenshots, setNewResourceScreenshots] = useState([]);        // File Objects
  const [newResourceScreenshotsURL, setNewResourceScreenshotsURL] = useState([]);  // String URLs
  const [oldResourceScreenshots, setOldResourceScreenshots] = useState([]);        // String URLs

  const [newResourceTags, setNewResourceTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagOptions, setTagOptions] = useState([]); 

  // Get all tag names from Firestore
  useEffect(() => {
    const getTags = async () => {
      try {
        const tagCollectionRef = collection(db, 'Tags');
        const tagSnapshot = await getDocs(tagCollectionRef);

        const tags = tagSnapshot.docs.map(doc => doc.id); // Document id is the tag name
        setTagOptions(tags);
      } catch (err) {
        console.log(err);
      }
    }

    getTags();
  }, []);

  // Fetch resource data from database
  useEffect(() => {
    const getResourceData = async () => {
      const resourceRef = doc(db, 'PendingResources', id);
      const resourceDoc = await getDoc(resourceRef);

      if (resourceDoc.exists()) {
        const data = resourceDoc.data();
        if (data) {
          setNewResourceName(data.name);
          setNewResourceDesc(data.desc);
          setNewResourceLongDesc(data.longDesc);
          setNewResourceLink(data.link);
          setNewResourcePublisher(data.publisher);
          setNewResourceType(data.type);
          setNewResourceTags(data.tags); 
          setSelectedTags(data.tags); 
          setNewResourceUserID(data.userID);
          setNewResourceUpvote(data.upvote);
          setNewResourceCreateDate(data.createDate);
          setOldResourceLogo(data.logoURL);
          setOldResourceScreenshots(data.imageURL);
        } else {
          console.log('Resource document exists, but no data found!');
        }
      } else {
        console.log('No such resource document!');
      }
    };

    getResourceData();
  }, [id]);

  // Update pending resource information
  const onUpdateResource = async () => {
    try {
      // Check if all fields filled
      if (!isFormValid()) {
        alert("All fields are mandatory!");
        return;
      }
  
      let logoDownloadURL;
      if (newResourceLogo) {
        // Initialize the Upload of logo to Firebase Storage
        const logoStorageRef = ref(storage, `ResourceLogos/${newResourceLogo.name}`);
        const logoUploadTask = uploadBytesResumable(logoStorageRef, newResourceLogo);
        logoDownloadURL = await uploadLogo(logoUploadTask);
        setNewResourceLogoURL(logoDownloadURL);
      }
  
      let screenshotDownloadURLs;
      if (newResourceScreenshots.length > 0) {
        // Initialize the Upload of resource screenshots to Firebase Storage
        const screenshotUploadTasks = newResourceScreenshots.map((screenshot, i) => {
          const screenshotStorageRef = ref(storage, `ResourceImages/${screenshot.name}-${i}`);
          const screenshotUploadTask = uploadBytesResumable(screenshotStorageRef, screenshot);
          return uploadScreenshot(screenshotUploadTask);
        });
  
        screenshotDownloadURLs = await Promise.all(screenshotUploadTasks);
      }
  
      // Resource data object 
      const resourceData = {
        name: newResourceName,
        desc: newResourceDesc,
        longDesc: newResourceLongDesc,
        link: newResourceLink,
        publisher: newResourcePublisher,
        type: newResourceType,
        tags: [...selectedTags] // Update the tags of resource in doc
      };
      
      // If admin changes the logo image
      if (logoDownloadURL) {
        resourceData.logoURL = logoDownloadURL;
      } else {
        resourceData.logoURL = oldResourceLogo; 
      }
      
      // If admin changes the new resource screenshots
      if (screenshotDownloadURLs) {
        resourceData.imageURL = [];
        for (let i = 0; i < oldResourceScreenshots.length; i++) {
            resourceData.imageURL.push(oldResourceScreenshots[i]);
        }
        for (let i = 0; i < screenshotDownloadURLs.length; i++) {
            resourceData.imageURL.push(screenshotDownloadURLs[i]);
        }
        setNewResourceScreenshotsURL(resourceData.imageURL);
    } else {
        // If admin didn't upload new resource screenshots, and only delete existed screenshots
        resourceData.imageURL = [];
        for (let i = 0; i < oldResourceScreenshots.length; i++) {
            resourceData.imageURL.push(oldResourceScreenshots[i]);
        }
        setNewResourceScreenshotsURL(resourceData.imageURL);
    }
    

      const docRef = doc(db, "PendingResources", id);
      await updateDoc(docRef, resourceData);

      // Update the local state of tags
      setNewResourceTags([...selectedTags]);
      
      // Push to success page
      alert("Update Pending Resource Success");
    } catch (err) {
      console.log(err);
    }
  };


  const uploadLogo = async (logoUploadTask) => {
    return new Promise((resolve, reject) => {
      logoUploadTask.on('state_changed',
        (snapshot) => {},
        (error) => reject(error),
        async () => {
          const logoDownloadURL = await getDownloadURL(logoUploadTask.snapshot.ref);
          console.log('Resource Logo URL is: ', logoDownloadURL);
          resolve(logoDownloadURL);
        }
      );
    });
  }
  
  const uploadScreenshot = async (screenshotUploadTask) => {
    return new Promise((resolve, reject) => {
      screenshotUploadTask.on('state_changed',
        (snapshot) => {},
        (error) => reject(error),
        async () => {
          const screenshotDownloadURL = await getDownloadURL(screenshotUploadTask.snapshot.ref);
          console.log('Screenshot URL is: ', screenshotDownloadURL);
          resolve(screenshotDownloadURL);
        }
      );
    });
  }

  const handleTagChange = (e) => {
    const tag = e.target.value;
    setSelectedTags(selectedTags => {
      if (!selectedTags.includes(tag)) {
        return [...selectedTags, tag];
      }
      return selectedTags;
    });
  }

  const removeTag = (tagToRemove) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  }

  const handleDeleteOldScreenshot = (index) => {
    // Prevent delete to zero screenshot
    if (newResourceScreenshots.length + oldResourceScreenshots.length == 1) {
      alert("You must have at least one screenshot!");
      return;
    }

    setOldResourceScreenshots((prevScreenshots) => {
      return prevScreenshots.filter((screenshot, i) => i !== index);
    });
  };

  const handleDeleteNewScreenshot = (index) => {
    // Prevent delete to zero screenshot
    if (newResourceScreenshots.length + oldResourceScreenshots.length == 1) {
      alert("You must have at least one screenshot!");
      return;
    }
    setNewResourceScreenshots((prevScreenshots) => {
      return prevScreenshots.filter((screenshot, i) => i !== index);
    });
  };

  // Validation check before submission
  const isFormValid = () => {
    return newResourceName !== "" &&
      newResourceDesc !== "" &&
      newResourceLongDesc !== "" &&
      newResourceLink !== "" &&
      newResourcePublisher !== "" &&
      newResourceTags.length > 0 &&
      newResourceType !== "";
  }

  // Handle logo file size check
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) { // 5MB
      alert("Logo file size exceeds 5MB!");
      return;
    }
    setNewResourceLogo(file);
  }

  // Handle screenshots file size and file number check
  const handleScreenshotChange = (e) => {
    const files = Array.from(e.target.files);

    if (newResourceScreenshots.length + oldResourceScreenshots.length + files.length > 3) {
      alert("You can only upload up to 3 screenshots!");
      return;
    }

    if (files.some(file => file.size > 5 * 1024 * 1024)) { // 5MB
      alert("Screenshot file size exceeds 5MB!");
      return;
    }
    setNewResourceScreenshots(oldScreenshots => [...oldScreenshots, ...Array.from(files)]);
  }

  // Approve new resouce action
  const approveResource = async () => {
    try {
      // Add pending resource to confirmed resource collection
      const docRef = await addDoc(collection(db, 'Resources'), {
        name: newResourceName,
        desc: newResourceDesc,
        longDesc: newResourceLongDesc,
        link: newResourceLink,
        publisher: newResourcePublisher,
        upvote: newResourceUpvote,
        createDate: newResourceCreateDate,
        type: newResourceType,
        userID: newResourceUserID,
        logoURL: newResourceLogoURL ? newResourceLogoURL : oldResourceLogo,
        imageURL: newResourceScreenshotsURL.length === 0 ? oldResourceScreenshots : newResourceScreenshotsURL
      });

      // Add tags as a subcollection of resource doc & create tag docs
      const tagsCollectionRef = collection(docRef, "tags");
      await Promise.all(newResourceTags.map(async (tagName) => {
          const tagRef = doc(tagsCollectionRef, tagName);
          await setDoc(tagRef, {}); 

          // Add resource to tag document in the Tags collection at top level
          const tagDocRef = doc(db, 'Tags', tagName);
          await setDoc(tagDocRef, {
            resources: arrayUnion(docRef.id),
          }, { merge: true }); 
      }));

      // Add approved resource id to user
      const userDocRef = doc(db, 'users', newResourceUserID);
      await updateDoc(userDocRef, {
        submittedPosts: arrayUnion(docRef.id),
      });
  
      // Delete pending resource doc from 'PendingResources' collection
      await deleteDoc(doc(db, 'PendingResources', id));

      // Delete pending resource id from user
      await updateDoc(userDocRef, {
        pendingPosts: arrayRemove(id),
      });
      // Alert success
      alert("New Resource has been approved!");
      // await delay(1500);
      // Push to admin page
      navigate('/admin');
    } catch (err) {
      console.log(err);
    }
  }

  // Reject new resouce action
  const rejectResource = async () => {
    try {
      // Delete pending resource doc from 'PendingResources' collection
      await deleteDoc(doc(db, 'PendingResources', id));

      // Delete pending resource id from user
      const userDocRef = doc(db, 'users', newResourceUserID);
      await updateDoc(userDocRef, {
        pendingPosts: arrayRemove(id),
      });
      // Alert success
      alert("New Resource has been denied!");
      // await delay(1500);
      // Push to admin page
      navigate('/admin');
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className='create-resource'>
    <label>
      Resource name
    </label>
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
      onChange={handleLogoChange}
    />
    {newResourceLogo ? (
      <img src={URL.createObjectURL(newResourceLogo)} alt="new logo preview" style={{ width: '100px' }}/>
    ) : (
      oldResourceLogo && <img src={oldResourceLogo} alt="old logo preview" style={{ width: '100px' }}/>
    )}
    
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
      placeholder='Resource author...'
      value={newResourcePublisher}
      onChange={(e) => setNewResourcePublisher(e.target.value)}
    />

    <label>
      Resource Tags
    </label>
    <select value={selectedTags} onChange={handleTagChange}>
      <option value="">Select resource tag(s)</option>
      {tagOptions.map((tag, index) => (
        <option key={index} value={tag}>{tag}</option>
      ))}
    </select>

    <div className="selected-tags-section">
      {selectedTags.map((tag, index) => (
        <div className="tag-item" key={index}>
          <span>{tag}</span>
          <button onClick={() => removeTag(tag)}>Remove</button>
        </div>
      ))}
    </div>
    
    <label>
      Resource type
    </label>
    <select value={newResourceType} onChange={(e) => setNewResourceType(e.target.value)}>
      <option value="">Select a resource type</option>
      <option value="Website">Website</option>
      <option value="Book">Book</option>
      <option value="Video">Video</option>
      <option value="Twitter-thread">Twitter Thread</option>
    </select>

    <label>
      Resource Screenshots
    </label>
    <input 
      type="file"
      multiple
      onChange={handleScreenshotChange} 
    />
    {/* Previous Uploaded Screenshots Preview*/}
    {oldResourceScreenshots.map((screenshot, index) => (
      <div className="screenshot-section" key={index}>
          <img 
              src={screenshot} 
              style={{ width: "200px", height: "auto" }}
          />
          <span>{screenshot.name}</span>
          <button onClick={() => handleDeleteOldScreenshot(index)}>Delete</button>
      </div>
    ))}
    {/* Newly Uploaded Screenshots Preview */}
    {newResourceScreenshots.map((screenshot, index) => (
      <div className="screenshot-section" key={index}>
          <img 
              src={URL.createObjectURL(screenshot)}
              style={{ width: "200px", height: "auto" }}
          />
          <span>{screenshot.name}</span>
          <button onClick={() => handleDeleteNewScreenshot(index)}>Delete</button>
      </div>
    ))}

    <button onClick={onUpdateResource}>Update</button>
    <button onClick={() => approveResource()}>Approve</button>
    <button onClick={() => rejectResource()}>Reject</button>
  </div>
  );
}
