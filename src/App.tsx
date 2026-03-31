import { useState, useEffect } from 'react'
import Navbar from '#components/Navbar'
import Experience from './experiments/3DMacbook/Experience'

// starting point of the application
function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname)

  useEffect(() => {
    const onLocationChange = () => {
      setCurrentPath(window.location.pathname)
    }
    window.addEventListener('popstate', onLocationChange)
    return () => window.removeEventListener('popstate', onLocationChange)
  }, [])

  // Soft React routing for the experiment
  if (currentPath === '/macbook') {
    return <Experience />
  }

  return (
    <>
      <Navbar />
    </>
  )
}

export default App

