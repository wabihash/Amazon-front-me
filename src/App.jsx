import React, { useEffect,useContext} from 'react';
import './App.css';
import Routing from './Routing';
import { DataContext } from './Components/DataProvider/DataProvider';
import { auth } from './Utility/Firebase';
import { Type } from './Utility/ActionType';
function App() {
 const [{user},dispatch] = useContext(DataContext);
  useEffect(() => {
        auth.onAuthStateChanged((authUser) => {
          if (authUser) {
            dispatch({
              type: Type.SET_USER,
              user: authUser
            })
          }
          else {
            dispatch({
              type: Type.SET_USER,
              user: authUser
            })
          }
        })
  }, []);
  
  return (
    <>
    
      <Routing />
    </>
  )
}

export default App;
