import { auth, googleAuthProvider } from "../config/firebase"
import { createUserWithEmailAndPassword, signInWithPopup, signOut } from "firebase/auth";
import { useState } from "react";

export const Auth = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    console.log("Current User: " + auth?.currentUser?.email);
    // console.log(auth?.currentUser?.photoURL);

    const signIn = async () => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (err) {
            console.log(err);
        }
    };

    const signInWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleAuthProvider);
            console.log("Current Google User: " + auth?.currentUser?.email);
        } catch (err) {
            console.log(err);
        }
    };

    const logOut = async () => {
        try {
            await signOut(auth);
            console.log("User Logged Out");
        } catch (err) {
            console.log(err);
        }
    } 

    return (
        <div>
            <input 
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)} 
            />
            <input 
                placeholder="Password"
                type="password"
                onChange={(e) => setPassword(e.target.value)}  
            />
            <button onClick={signIn}> Register </button>

            <button onClick={signInWithGoogle}> Sign In With Google </button>

            <button onClick={logOut}> Logout </button>
        </div>
    );
};