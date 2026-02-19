import React, { useEffect,useContext} from 'react';
import './App.css';
import Routing from './Routing';
import { DataContext } from './Components/DataProvider/DataProvider';
import { auth, db } from './Utility/Firebase';
import { Type } from './Utility/ActionType';

function App() {
 const [{user, theme},dispatch] = useContext(DataContext);
  useEffect(() => {
        auth.onAuthStateChanged(async (authUser) => {
          if (authUser) {
            // Fetch user role and firstName from Firestore using compat syntax
            const userDoc = await db.collection("users").doc(authUser.uid).get();
            const userData = userDoc.exists ? userDoc.data() : {};
            const role = userData.role || "user";
            const firstName = userData.firstName || "";
            
            dispatch({
              type: Type.SET_USER,
              user: { ...authUser, role, firstName }
            })
          }
          else {
            dispatch({
              type: Type.SET_USER,
              user: null
            })
          }
        })
  }, []);
  
  return (
    <div className={theme}>
      <Routing />
    </div>
  )
}

export default App;
