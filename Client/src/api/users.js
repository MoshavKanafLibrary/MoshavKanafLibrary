import axios from "axios";
axios.defaults.baseURL = 'http://localhost:3500';

export const addNewUserToDb = async (user) => {
  // const token = user && (await user.getIdToken());
  // const headers = token ? { authtoken: token } : {};
  const uid = user.uid;
  console.log(user)
  console.log(uid)
  const response = await axios.post("/api/users/signUp", {
    uid: uid,
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