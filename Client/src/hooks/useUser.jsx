import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { auth } from "../components/FireBaseAuth";

// Ensure you initialize Firestore somewhere in your project
const firestore = getFirestore();

const useUser = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(firestore, "users", firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = {
            ...firebaseUser,
            ...userDoc.data(), // Assuming isManager is stored here
          };
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        } else {
          console.error("User document not found in Firestore");
          setUser(firebaseUser); // Fallback to just auth data
          localStorage.setItem("user", JSON.stringify(firebaseUser));
        }
      } else {
        setUser(null);
        localStorage.removeItem("user");
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, isLoading };
};

export default useUser;
