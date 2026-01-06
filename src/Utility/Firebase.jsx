import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDSvILZ1VRUX15TQLIIAngpIN6AXed3gHs",
  authDomain: "backend-22770.firebaseapp.com",
  projectId: "backend-22770",
  storageBucket: "backend-22770.firebasestorage.app",
  messagingSenderId: "990588604944",
  appId: "1:990588604944:web:95a752ff540854f9953095"
};
// Initialize firebase
const app = firebase.initializeApp(firebaseConfig);
export const auth = app.auth();
export const db = app.firestore();