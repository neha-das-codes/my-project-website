// src/layouts/MainLayout.jsx
import React from 'react';
import Navbar from '../components/navbar';

const MainLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 p-4">
        {children}
      </main>
    </>
  );
};

export default MainLayout;
