import { useState } from 'react'
import Navbar from '#components/Navbar'
import Experience from './experiments/3DMacbook/Experience'

// starting point of the application
function App() {
  // Simple manual routing for the experiment
  if (window.location.pathname === '/macbook') {
    return <Experience />
  }

  return (
    <>
      <Navbar />
    </>
  )
}

export default App

