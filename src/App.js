import React from 'react';
 import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
  import MainLayout from './layouts/mainlayout';
   import Home from './pages/home'; 
   import About from './pages/about';

// In your routes:

  const App = () => 
  { return ( <Router>
     <MainLayout> 
        
        <Routes> <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
         {/* More routes like /about, /contact, /login will be added later */} 
</Routes> 
</MainLayout> 
</Router> 
); 
};
 export default App;