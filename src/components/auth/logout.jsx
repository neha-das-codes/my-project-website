//import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
  const navigate = useNavigate();
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };
  return <button onClick={handleLogout} className="px-3 py-1 border rounded">Logout</button>;
};

export default LogoutButton;
