import { auth, googleAuthProvider } from "../config/firebase";
import { doc, setDoc } from "firebase/firestore"; 
import { db } from '../config/firebase';
import { createUserWithEmailAndPassword, signInWithPopup, signOut, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import useAuth from "../routes/useAuth";

import '../style/UserAuth.css'

export const Auth = () => {
    const { setAuth } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);
    const [username, setUsername] = useState(""); 
    const [error, setError] = useState("");

    const navigate = useNavigate();
    console.log("Firebase Current User: " + auth?.currentUser?.email);

    const handleError = (err) => {
        switch (err.code) {
            case 'auth/email-already-exists':
            case 'auth/email-already-in-use':
                setError('Email already in use');
                break;
            case 'auth/user-not-found':
                setError('No user found with this email');
                break;
            case 'auth/invalid-email':
                setError('Invalid email address');
                break;
            case 'auth/wrong-password':
                setError('Invalid password');
                break;
            case 'auth/id-token-expired':
            case 'auth/session-cookie-expired':
                setError('Your session has expired, please login again');
                break;
            case 'auth/id-token-revoked':
            case 'auth/session-cookie-revoked':
                setError('Your session has been revoked, please login again');
                break;
            case 'auth/invalid-credential':
                setError('Invalid credentials, please check your email and password');
                break;
            case 'auth/invalid-password':
                setError('Password is invalid, it must be a string with at least six characters');
                break;
            case 'auth/invalid-argument':
                setError('Invalid argument provided');
                break;
            case 'auth/claims-too-large':
                setError('The claims payload is too large');
                break;
            case 'auth/insufficient-permission':
                setError('Insufficient permission to access the requested Authentication resource');
                break;
            case 'auth/internal-error':
                setError('An unexpected error occurred, please try again later');
                break;
            case 'auth/missing-email':
                setError('Please provide an email address');
                break;
            default:
                setError('An unknown error occurred');
        }
    };
    

    const register = async () => {
        // Check if all fields have been filled out
        if (!username || !email || !password) {
            alert('All fields must be filled out');
            return; 
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await setDoc(doc(db, "users", user.uid), {
                email: email,
                username: username,                
                photoURL: user.photoURL,
                submittedPosts: [],
                pendingPosts: []
            });
            navigate('/success-register');
        } catch (err) {
            handleError(err);
            console.log(err);
        }
    };

    const logIn = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            const user = auth.currentUser;
            console.log(user);
            // const token = await user.getIdTokenResult();
            // console.log("Admin: ", token.claims.admin);
            navigate('/');
        } catch (err) {
            handleError(err);
            console.log(err);
        }
    }

    const signInWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleAuthProvider);
            const user = auth.currentUser;
            console.log(user);
            // const token = await user.getIdTokenResult();
            // console.log("Admin: ", token.claims.admin);
            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                username: user.displayName,
                photoURL: user.photoURL,
                submittedPosts: []
            });
            navigate('/');
        } catch (err) {
            handleError(err);
            console.log(err);
        }
    };

    const logOut = async () => {
        try {
            await signOut(auth);
            console.log("User Logged Out");
            navigate('/');
        } catch (err) {
            handleError(err);
            console.log(err);
        }
    }

    const forgotPassword = async () => {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (err) {
            handleError(err);
            console.log(err);
        }
    }

    return (
        <div className="auth-container">
            {isRegistering ? (
                <>
                    <h1> Registration </h1>
                    <input 
                        placeholder="Username"
                        onChange={(e) => setUsername(e.target.value)} 
                    />
                    <input 
                        placeholder="Email"
                        onChange={(e) => setEmail(e.target.value)} 
                    />
                    <input 
                        placeholder="Password"
                        type="password"
                        onChange={(e) => setPassword(e.target.value)}  
                    />
                    {error && <p>{error}</p>}
                    <button onClick={register}> Register </button> 
                    <button onClick={() => setIsRegistering(false)}> Already have an account? </button>
                </>
            ) : (
                <>
                    <h1> Log In </h1>
                    <input 
                        placeholder="Email"
                        onChange={(e) => setEmail(e.target.value)} 
                    />
                    <input 

                        placeholder="Password"
                        type="password"
                        onChange={(e) => setPassword(e.target.value)}  
                    />
                    {error && <p>{error}</p>}
                    <button onClick={logIn}> Login </button>
                    <button onClick={signInWithGoogle}> Sign In With Google </button>
                    <button onClick={forgotPassword}> Forgot password? </button>
                    <button onClick={() => setIsRegistering(true)}> Don't have an account? </button>
                    {/* <button onClick={logOut}> Logout </button> */}
                </>
            )} 
        </div>
    );
};