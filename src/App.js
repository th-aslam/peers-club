// import './App.css';

import React from 'react'
import { Route, Routes, BrowserRouter } from 'react-router-dom'
import Index from './views/CreateOrJoin/CreateOrJoin'
import Call from './views/Call/Call'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/in-call" element={<Call />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
