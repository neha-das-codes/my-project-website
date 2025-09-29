import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubDoc = null;
    let currentUserId = null;

    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      // CRITICAL: Clean up previous listener immediately
      if (unsubDoc) {
        console.log('🧹 Cleaning up old listener for:', currentUserId);
        unsubDoc();
        unsubDoc = null;
      }

      if (currentUser) {
        console.log('👤 Auth user changed to:', currentUser.uid);
        currentUserId = currentUser.uid;
        setUser(currentUser);
        setLoading(true);

        // Create fresh listener for new user
        const docRef = doc(db, "users", currentUser.uid);
        unsubDoc = onSnapshot(docRef, (snap) => {
          if (snap.exists()) {
            const profileData = snap.data();
            console.log('📄 Profile loaded:', profileData.role, profileData.name);
            setProfile(profileData);
          } else {
            console.log('❌ No profile found');
            setProfile(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("❌ Profile listener error:", error);
          setProfile(null);
          setLoading(false);
        });
      } else {
        console.log('🚪 User logged out');
        currentUserId = null;
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      console.log('🧹 Cleaning up AuthContext');
      unsubAuth();
      if (unsubDoc) {
        unsubDoc();
      }
    };
  }, []);

  const logout = async () => {
    try {
      console.log('🚪 Logout initiated');
      await signOut(auth);
      // Clear everything
      setUser(null);
      setProfile(null);
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/login';
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);