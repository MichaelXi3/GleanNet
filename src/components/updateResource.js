import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, doc, setDoc, deleteDoc, updateDoc, arrayUnion, getDoc, getDocs } from 'firebase/firestore';
import { getAuth } from "firebase/auth";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db } from '../config/firebase';
import '../style/CreateResourceComponent.css';

export const UpdateResource = () => {
  // Get current resource id from URL
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = getAuth();
  const userID = auth.currentUser?.uid;  

  const [newResourceName, setNewResourceName] = useState("");
  const [newResourceDesc, setNewResourceDesc] = useState("");
  const [newResourceLongDesc, setNewResourceLongDesc] = useState("");
  const [newResourceLink, setNewResourceLink] = useState("");
  const [newResourcePublisher, setNewResourcePublisher] = useState("");
  const [newResourceType, setNewResourceType] = useState("");

  const [newResourceLogo, setNewResourceLogo] = useState(null);
  const [oldResourceLogo, setOldResourceLogo] = useState(null); 

  const [newResourceScreenshots, setNewResourceScreenshots] = useState([]);
  const [oldResourceScreenshots, setOldResourceScreenshots] = useState([]); 

  const [newResourceTags, setNewResourceTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagOptions, setTagOptions] = useState([
    'Computer Security', 'Computer System', 'AI Tool', 'Productivity Tool', 'Web Development',
    'App Developement', 'Android', 'Linux', 'Backend'
  ]); 

  const storage = getStorage();
  
  // Fetch resource data from database
  useEffect(() => {
    const getResourceData = async () => {
      const resourceRef = doc(db, 'Resources', id);
      const resourceDoc = await getDoc(resourceRef);

      // Get 'tags' subcollection
      const tagsCollectionRef = collection(resourceRef, 'tags');
      getDocs(tagsCollectionRef).then((querySnapshot) => {
        const tags = querySnapshot.docs.map(doc => doc.id); 
        setNewResourceTags(tags); 
        setSelectedTags(tags); 
      });
      
      if (resourceDoc.exists()) {
        const data = resourceDoc.data();
        if (data) {
          setNewResourceName(data.name);
          setNewResourceDesc(data.desc);
          setNewResourceLongDesc(data.longDesc);
          setNewResourceLink(data.link);
          setNewResourcePublisher(data.publisher);
          setNewResourceType(data.type);
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

  // Handle situation when the user is not logged in
  if (!userID) { return; }

  // Update resource information
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
      };
      
      // If user uploads the logo image
      if (logoDownloadURL) {
        resourceData.logoURL = logoDownloadURL;
      }
      
      // If user uploads new resource screenshots
      if (screenshotDownloadURLs) {
        resourceData.imageURL = [...oldResourceScreenshots, ...screenshotDownloadURLs];
      } else {
        // If user didn't upload new resource screenshots, and only delete existed screenshots
        resourceData.imageURL = [...oldResourceScreenshots];
      }

      const docRef = doc(db, "Resources", id);
      await updateDoc(docRef, resourceData);
      
      // Update the tags of resource
      const currentTags = await getCurrentTags(docRef);
      const tagsToAdd = newResourceTags.filter(tag => !currentTags.includes(tag));
      const tagsCollectionRef = collection(docRef, "tags");

      // Delete tag docs not included in newResourceTags
      for (let oldTag of currentTags) {
        if (!newResourceTags.includes(oldTag)) {
          const tagRef = doc(tagsCollectionRef, oldTag);
          await deleteDoc(tagRef);
        }
      }
      // Add newly added tags
      for (const tag of tagsToAdd) {
        const tagRef = doc(tagsCollectionRef, tag);
        await setDoc(tagRef, {}); // Create an empty doc for the new tag
      } 
  
      // Clear the input form
      setNewResourceName("");
      setNewResourceDesc("");
      setNewResourceLongDesc("");
      setNewResourceLink("");
      setNewResourcePublisher("");
      setNewResourceTags([]);
      setNewResourceScreenshots([]);
      setNewResourceLogo(null);
  
      // Push to success page
      navigate('/success');
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

  const getCurrentTags = async (docRef) => {
    const tagsCollectionRef = collection(docRef, "tags");
    const querySnapshot = await getDocs(tagsCollectionRef);
    const currentTags = querySnapshot.docs.map(doc => doc.id);
    return currentTags;
  };

  const handleTagChange = (e) => {
    const tag = e.target.value;
    setNewResourceTags(newResourceTags => {
      if (!newResourceTags.includes(tag)) {
        return [...newResourceTags, tag];
      }
      return newResourceTags;
    });
    setSelectedTags(selectedTags => {
      if (!selectedTags.includes(tag)) {
        return [...selectedTags, tag];
      }
      return selectedTags;
    });
  }

  const removeTag = (tagToRemove) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
    setNewResourceTags(newResourceTags.filter(tag => tag !== tagToRemove));
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

    <button onClick={onUpdateResource}>Submit</button>
  </div>
  );
};
