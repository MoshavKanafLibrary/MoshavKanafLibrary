import axios from "axios";
// axios.defaults.baseURL = 'http://localhost:3000';

export const addNewUserToDb = async (user, email) => {
  const uid = user.uid;
  console.log(user);
  console.log(uid);
  const response = await axios.post("/api/users/signUp", {
    uid: uid,
    email: email // Add email here
  });
};


export const getUsers = async () => {
  const response = await axios.get("/api/users", {});
  return response.data;
};

export const getUser = async (uid) => {
  const response = await axios.get(`/api/users/${uid}`);

  return response.data;
};