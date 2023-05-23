// This file provides the global user's auth state to all components
import React, { createContext, useState, useEffect } from 'react';
import { auth } from '../config/firebase';  // import the auth service from your Firebase initialization file
import { Loading } from '../pages/loadingPage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // There are two global states: userLogIn, isAdmin
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Use Firebase auth to fetch global state, react states track will lost once refresh but not for firebase
  useEffect(() => {
    // This function is called whenever the user's auth state changes
    const unsubscribe = auth.onAuthStateChanged(async user => {
      if (user) {
        // User is signed in
        const token = await user.getIdTokenResult();
        setCurrentUser(user);
        setIsAdmin(!!token.claims.admin);
      } else {
        // User is signed out
        setCurrentUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    // Clean up subscription
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <AuthContext.Provider value={{ currentUser, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

