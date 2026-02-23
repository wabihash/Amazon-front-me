import axios from "axios";
const instance = axios.create({
  //1 Local instance of the backend
  // baseURL: "http://127.0.0.1:5001/backend-22770/us-central1/api",
  //2 Render instance of the backend
  baseURL: "https://amazon-me-rd5s.onrender.com"
  //3 Firebase instance of the backend (not active)
})
export default instance;