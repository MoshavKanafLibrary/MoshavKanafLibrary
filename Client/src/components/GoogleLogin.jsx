import React from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../components/FireBaseAuth";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const GoogleLogin = () => {
  const provider = new GoogleAuthProvider();
  const navigate = useNavigate();

  const signIn = async () => {
    try {
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      if (userCredential._tokenResponse.isNewUser) {
        await axios.post("/api/users/signUp", {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          firstName: "",
          lastName: "",
          phone: "",
          familySize:""
        });

        navigate("/more-info");
      } else {
        const userDoc = await axios.get(`/api/users/${user.uid}`);
        const { firstName, lastName, phone, familySize } = userDoc.data;

        if (!firstName || !lastName || !phone || !familySize) {
          navigate("/more-info");
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      console.log("error with signing in with google provider", error);
    }
  };

  return (
    <FcGoogle
      onClick={signIn}
      className="w-12 h-12 cursor-pointer transition duration-200 ease-in-out hover:scale-110 border-2 border-gray-300 hover:border-black rounded-md"
    />
  );
};

export default GoogleLogin;
