import { useState, useEffect, lazy, Suspense } from 'react'
import MobileLanding from '#components/MobileLanding'

// Lazy-loaded so mobile visitors never download these chunks.
// Vite splits each into its own bundle — Three.js, R3F, etc. only
// load when a desktop visitor actually renders one of these routes.
const Desktop = lazy(() => import('#components/Desktop'))
const Experience = lazy(() => import('./experiments/3DMacbook/Experience'))

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
    return (
      <Suspense fallback={<div className="w-screen h-screen bg-black" />}>
        <Experience />
      </Suspense>
    )
  }

  return (
    <Suspense fallback={<div className="w-screen h-screen bg-black" />}>
      <main className="w-screen h-screen flex flex-col">
        <Desktop />
      </main>
    </Suspense>
  )
}

export default App

