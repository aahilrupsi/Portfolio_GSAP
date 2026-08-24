import { Canvas, useThree, useFrame, type RootState } from '@react-three/fiber'
import { Environment, ContactShadows, Stars, useProgress } from '@react-three/drei'
import Macbook from './Macbook'
import { Suspense, useLayoutEffect, useEffect, useMemo, useContext, useCallback, useState } from 'react'
import gsap from 'gsap'
import { Vector3 } from 'three'
import { DesktopContext } from '../../contexts/DesktopContext'
import { NotificationContext } from '../../contexts/NotificationContext'

// --- CONFIGURATION ---
// Change these values to tweak the animation

const CONFIG = {
    // 1. Where the camera starts (The Void)
    cameraStart: new Vector3(0, 5, 12),

    // 2. The "Front View" position where it pauses
    orbitPos: new Vector3(0, 1.5, 7),

    // 3. The center of the screen (Target to look at)
    // Adjust Y to move up/down on screen, Z to move depth
    screenCenter: new Vector3(0, 0, -1.2),

    // 4. How close the camera gets to the screen (The Zoom)
    // Closer to Z = -1.2 means more zoomed in. 
    // If Z is same as screenCenter.z, you crash into it.
    zoomPos: new Vector3(0, 0, 2.32),
}

function CameraController() {
    const { camera } = useThree()

    // We use a mutable object to track where the camera should look.
    // This allows us to animate the "focus point" smoothly.
    const lookAtTarget = useMemo(() => new Vector3(0, 0, 0), [])

    useLayoutEffect(() => {
        const tl = gsap.timeline({
            delay: 0.5,
            defaults: { ease: 'power2.inOut' }
        })

        // 1. INITIAL SETUP
        // Snap camera and target to start positions immediately
        camera.position.copy(CONFIG.cameraStart)
        lookAtTarget.set(0, 0, 0) // Looking at base initially
        camera.lookAt(lookAtTarget)

        // --- ANIMATION SEQUENCE ---

        const phase1State = {
            angle: (Math.PI / 2) + (Math.PI * 2), // 360 degree spin starting angle
            radius: CONFIG.cameraStart.z, // 12
            height: CONFIG.cameraStart.y  // 5
        }

        // Phase 1: Orbit to Front (Duration: 4.5s)
        // Move Camera -> Front with a full 360 degree rotation
        tl.to(phase1State, {
            duration: 4.5,
            angle: Math.PI / 2, // End perfectly at front (0, 1.5, 7)
            radius: CONFIG.orbitPos.z,
            height: CONFIG.orbitPos.y,
            ease: 'power3.inOut',
            onUpdate: () => {
                camera.position.set(
                    Math.cos(phase1State.angle) * phase1State.radius,
                    phase1State.height,
                    Math.sin(phase1State.angle) * phase1State.radius
                )
            }
        }, 0)

        // Smoothly shift focus to the center of the laptop/screen area
        tl.to(lookAtTarget, {
            duration: 4.5,
            x: 0,
            y: 0.5,
            z: 0,
            ease: 'power3.inOut'
        }, 0)


        // Phase 2: Pause (Duration: .5s)
        tl.to({}, { duration: 0.5 })


        // Phase 3: Zoom into Screen (Duration: 2s)
        // Move Camera -> Zoom Position
        tl.to(camera.position, {
            duration: 2,
            x: CONFIG.zoomPos.x,
            y: CONFIG.zoomPos.y,
            z: CONFIG.zoomPos.z,
            ease: 'power4.inOut',
        }, ">") // ">" means start after previous finished

        // Shift focus precisely to the screen center
        tl.to(lookAtTarget, {
            duration: 2,
            x: CONFIG.screenCenter.x,
            y: CONFIG.screenCenter.y,
            z: CONFIG.screenCenter.z,
            ease: 'power4.inOut',
        }, "<") // "<" means align start with previous tween (run parallel with camera move)

    }, [camera, lookAtTarget])

    // Listen for the custom "launch" event from TestScreen to execute the 3D Wipe
    useEffect(() => {
        const handleLaunch = () => {
            // Rapidly accelerate the camera straight through the Macbook screen
            gsap.to(camera.position, {
                duration: 1.2,
                z: -5,
                ease: 'power4.in',
            })
            
            // Push the focus point extremely deep into space so the camera
            // doesn't awkwardly flip around as it crosses the screen boundary
            gsap.to(lookAtTarget, {
                duration: 1.2,
                z: -15,
                ease: 'power4.in',
            })

            // Route to the real site right as the digital screen entirely fills your vision
            setTimeout(() => {
                window.history.pushState(null, '', '/')
                window.dispatchEvent(new Event('popstate'))
            }, 1000)
        }

        window.addEventListener('launch-portfolio', handleLaunch)
        return () => window.removeEventListener('launch-portfolio', handleLaunch)
    }, [camera, lookAtTarget])

    // Apply the "lookAt" every frame based on the animated target
    useFrame(() => {
        camera.lookAt(lookAtTarget)
    })

    return null
}

// Tracks the GLTF/HDR asset fetches happening inside the Canvas's Suspense
// boundary and shows a progress bar until they're done. Reads from drei's
// shared loading-manager store, so it works as a plain overlay outside the Canvas.
function LoadingOverlay() {
    const { progress, active } = useProgress()

    return (
        <div
            className={`absolute inset-0 z-10 flex flex-col items-center justify-center bg-black pointer-events-none transition-opacity duration-700 ease-in-out ${active ? 'opacity-100' : 'opacity-0'
                }`}
        >
            <div className="w-64 h-1.5 bg-[#333333] rounded-full overflow-hidden">
                <div
                    className="h-full bg-white rounded-full transition-all duration-150 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    )
}

export default function Experience() {
    const desktopContext = useContext(DesktopContext);
    const notificationContext = useContext(NotificationContext);

    // The scene (GLTF model, HDR environment, and the entire desktop UI portaled
    // onto the screen) is heavy enough that the GPU occasionally drops the WebGL
    // context (logged as "THREE.WebGLRenderer: Context Lost"). Without explicit
    // recovery, a lost context never comes back and the canvas stays blank forever.
    // Remounting the Canvas via `key` forces a clean WebGLRenderer + re-upload of
    // all GPU resources instead of relying on the browser's native (unreliable)
    // context-restore behavior.
    const [canvasKey, setCanvasKey] = useState(0)

    // Desktop.tsx (Navbar/Dock/WindowManager + every app window) is lazy-loaded
    // by TestScreen only once the camera reaches the screen ~8s in. Kick off the
    // fetch here instead, in parallel with the GLTF/HDR load, so the chunk is
    // already warm by the time TestScreen's Suspense boundary needs it.
    useEffect(() => {
        import('#components/Desktop')
    }, [])

    const handleCanvasCreated = useCallback(({ gl }: RootState) => {
        gl.domElement.addEventListener('webglcontextlost', (event) => {
            event.preventDefault()
            setCanvasKey((key) => key + 1)
        })
    }, [])

    return (
        <div className="h-screen w-full bg-black relative">
            <LoadingOverlay />

            <Canvas
                key={canvasKey}
                onCreated={handleCanvasCreated}
                // We set initial camera here to match CONFIG.cameraStart to prevent flash/jump
                camera={{
                    position: [CONFIG.cameraStart.x, CONFIG.cameraStart.y, CONFIG.cameraStart.z],
                    fov: 35
                }}
            >
                <color attach="background" args={['#050505']} />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                {/* Suspense boundary scoped to just the loading assets (HDR env + GLTF
                model) so the canvas itself mounts immediately instead of the whole
                Experience getting swapped out for App.tsx's blank fallback div. */}
                <Suspense fallback={null}>
                    <Environment preset="city" />

                    <group position-y={-1}>
                        <Macbook desktopContext={desktopContext} notificationContext={notificationContext} />
                        <ContactShadows opacity={0.6} scale={15} blur={2.5} far={4} color="#000000" />
                    </group>
                </Suspense>

                <CameraController />

                {/* Optional: OrbitControls for debugging if we want to override,
            but usually conflicts with GSAP if enabled during animation.
            Commented out for the cinematic sequence. */}
                {/* <OrbitControls /> */}
            </Canvas>
        </div>
    )
}
