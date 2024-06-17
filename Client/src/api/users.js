import axios from "axios";
// axios.defaults.baseURL = 'http://localhost:3000';

export const addNewUserToDb = async (user, email, displayName) => {
  const uid = user.uid;
  console.log(user);
  console.log(uid);

  // Include displayName in the request body
  const response = await axios.post("/api/users/signUp", {
    uid: uid,
    email: email,
    displayName: displayName // Add displayName here
  });

  return response.data; // Return the response data for further use if needed
};

// Fetch all users
export const getUsers = async () => {
  const response = await axios.get("/api/users");
  return response.data;
};

// Fetch a single user by UID
export const getUser = async (uid) => {
  const response = await axios.get(`/api/users/${uid}`);
  return response.data;
};
