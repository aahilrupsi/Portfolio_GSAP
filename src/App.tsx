import { useState, useEffect } from 'react'
import Desktop from '#components/Desktop'
import Experience from './experiments/3DMacbook/Experience'
import MobileLanding from '#components/MobileLanding'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

// starting point of the application
function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname)
  const isMobile = useIsMobile();

  useEffect(() => {
    const onLocationChange = () => {
      setCurrentPath(window.location.pathname)
    }
    window.addEventListener('popstate', onLocationChange)
    return () => window.removeEventListener('popstate', onLocationChange)
  }, [])

  if (isMobile) {
    return <MobileLanding />
  }

  // Soft React routing for the experiment
  if (currentPath === '/macbook') {
    return <Experience />
  }

  return (
    <main className="w-screen h-screen flex flex-col">
      <Desktop />
    </main>
  )
}

export default App

