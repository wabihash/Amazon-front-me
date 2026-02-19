import React, { useState, useContext } from 'react';
import classes from './Auth.module.css';
import { Link,useNavigate,useLocation} from 'react-router-dom';
import { auth, db } from '../../Utility/Firebase';
import { DataContext } from "../../Components/DataProvider/DataProvider";
import { Type } from "../../Utility/ActionType";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { ClipLoader } from "react-spinners";

function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState(''); // Added firstName state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState({
    signin: false,
    signup: false,
  });
  const [{ user }, dispatch] = useContext(DataContext);
  const navigate = useNavigate()
  const navStateData = useLocation();
  const authHandler = async(e) => {
    e.preventDefault();
    
    // Determine which button was clicked
    const buttonName = e.nativeEvent.submitter?.name || e.target.name || 'signin';
    
    if (buttonName === 'signin') {
      setLoading({...loading, signin: true});
      
      signInWithEmailAndPassword(auth, email, password)
        .then(async (userInfo) => {
          // Fetch user role and name from Firestore on signin
          const userDoc = await db.collection("users").doc(userInfo.user.uid).get();
          const userData = userDoc.exists ? userDoc.data() : {};
          const role = userData.role || "user";
          const firstName = userData.firstName || "";

          dispatch({
            type: Type.SET_USER,
            user: { ...userInfo.user, role, firstName }
          });
          setLoading({ ...loading, signin: false });
          navigate(navStateData?.state?.redirect || '/');
        })
        .catch((err) => {
          setError(err.message);
          setLoading({...loading, signin: false});
        });
    }
    else {
      // Validate first name for signup
      if (!firstName.trim()) {
        setError("Please enter your First Name to register.");
        return;
      }

      setLoading({...loading, signup: true});
      createUserWithEmailAndPassword(auth, email, password)
        .then(async (userInfo) => {
          // Create user document in Firestore on signup using compat syntax
          await db.collection("users").doc(userInfo.user.uid).set({
            email: userInfo.user.email,
            firstName: firstName, // Save first name
            role: "user", // Default role
            created: new Date()
          });

          dispatch({
            type: Type.SET_USER,
            user: { ...userInfo.user, role: "user", firstName } // Update state with name
          });
          setLoading({ ...loading, signup: false });
          navigate(navStateData?.state?.redirect || '/');
        })
        .catch((err) => {
          setError(err.message);
          setLoading({...loading, signup: false});
        });
    }
  }

  return (
    <section className={classes.login}>
      {/* Logo with Link to home */}
      <Link to="/">
        <img src="Amazon-logo.png" alt="Amazon Logo" />
      </Link>
      
      {/* form */}
      <div className={classes.Login_container}>
        <h1>Sign In / Register</h1>
        {
          navStateData?.state?.msg && (
            <small style={{padding: "5px", color: "red", display: "block", marginTop: "10px"}}>
              {navStateData?.state?.msg}
            </small>
          )
        }
        <form >
          {/* First Name field (Visible for registration) */}
          <div>
            <label htmlFor="firstName">First Name (Required for Registration)</label>
            <input 
              value={firstName} 
              onChange={(e) => setFirstName(e.target.value)} 
              type="text" 
              id='firstName' 
            />
          </div>

          <div>
            <label htmlFor="email">Email</label>
            <input 
              value={email} 
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }} 
              type="email" 
              id='email' 
            />
          </div>
          
          <div>
            <label htmlFor="password">Password</label>
            <input 
              value={password} 
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }} 
              type="password" 
              id="password" 
            />
          </div>
          
          <button 
            type='submit'
            name='signin'
            className={classes.login_signInButton}
         onClick={authHandler}
          >
            {loading.signin ? (
              <ClipLoader color='#36d7b7' size={15} />
            ) : "Sign In"}
          </button>
        </form>

        {/* agreement */}
        <p>
          By signing-in you agree to the AMAZON FAKE CLONE Conditions of Use & Sale. 
          Please see our Privacy Notice, our Cookies Notice and our Interest-Based Ads Notice.
        </p>

        {/* create account btn */}
        <button 
          type='submit'
          name='signup' 
          onClick={authHandler}
          className={classes.login_registerButton}
         
        >
          {loading.signup ? (
            <ClipLoader color='#36d7b7' size={15} />
          ) : "Create your Amazon Account"}
        </button>
        
        {error && (
          <small style={{padding: "5px", color: "red", display: "block", marginTop: "10px"}}>
            {error}
          </small>
        )}
      </div>
    </section>
  );
}

export default Auth;