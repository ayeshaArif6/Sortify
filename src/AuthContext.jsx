import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup} from "firebase/auth";
import { doc, setDoc, getDoc} from "firebase/firestore";
import { db } from "./firebase"; // or "../firebase" depending on your folder


const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
  
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
  
      
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);
  
      if (!userSnap.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          username: user.displayName,
          createdAt: new Date()
        });
      }
  
      return user;
    } catch (error) {
      console.error("Google login error:", error.message);
      throw error;
    }
  };

  const register = async (email, password, username) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
  
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      username: username,
      createdAt: new Date()
    });
  
    return userCredential;
  };

  const logout = () => {
    return signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loginWithGoogle, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
