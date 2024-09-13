import axios from "axios";

export const addNewUserToDb = async (user, email, displayName, firstName, lastName, phone, familySize) => {
  const uid = user.uid;
  console.log({ uid, email, displayName, firstName, lastName, phone }); // Log all fields to ensure they are not undefined

  // Include all fields in the request body
  const response = await axios.post("/api/users/signUp", {
    uid: uid,
    email: email,
    displayName: displayName,
    firstName: firstName,
    lastName: lastName,
    phone: phone,
    familySize: familySize
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
