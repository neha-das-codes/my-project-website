import React from "react";
 import { Routes, Route } from "react-router-dom";
  import Home from "./pages/home";
  import About from "./pages/about";
   import Register from "./components/auth/register";
    import Login from "./components/auth/login"; 
    import Dashboard from "./pages/dashboard";
     import AdminPanel from "./pages/adminpanel"; 
     import ProtectedRoute from "./components/protectedroute";
      import Navbar from "./components/navbar";
       import SearchPage from "./pages/searchpage";
        import TutorProfile from "./pages/tutorprofile";
         import ChatPage from './pages/chat'; 
         const AppRoutes = () =>
           (
           <>
            <Navbar />
           <Routes> 
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About/>}/>
         <Route path="/register" element={<Register />} />
             <Route path="/login" element={<Login />} />
              <Route path="/search" element={<SearchPage />} />
               <Route path="/tutor/:id" element={<TutorProfile />} /> 
               
               <Route path="/chat" element={<ChatPage />} /> 
               <Route path="/dashboard" element={ <ProtectedRoute> 
                <Dashboard /> </ProtectedRoute> }/> 
                <Route path="/admin" element={ <ProtectedRoute requiredRole="admin"> <AdminPanel />
                 </ProtectedRoute> }/> 
                {/* add search, tutor pages later */} </Routes> 
                </> 
                ); 
export default AppRoutes;
