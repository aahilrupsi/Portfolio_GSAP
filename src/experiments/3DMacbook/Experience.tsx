import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { Environment, ContactShadows, Stars } from '@react-three/drei'
import Macbook from './Macbook'
import { useLayoutEffect, useRef, useMemo } from 'react'
import gsap from 'gsap'
import { Vector3 } from 'three'

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

    // Apply the "lookAt" every frame based on the animated target
    useFrame(() => {
        camera.lookAt(lookAtTarget)
    })

    return null
}

export default function Experience() {
    return (
        <div className="h-screen w-full bg-black">
            <Canvas
                // We set initial camera here to match CONFIG.cameraStart to prevent flash/jump
                camera={{
                    position: [CONFIG.cameraStart.x, CONFIG.cameraStart.y, CONFIG.cameraStart.z],
                    fov: 35
                }}
            >
                <color attach="background" args={['#050505']} />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <Environment preset="city" />

                <group position-y={-1}>
                    <Macbook />
                    <ContactShadows opacity={0.6} scale={15} blur={2.5} far={4} color="#000000" />
                </group>

                <CameraController />

                {/* Optional: OrbitControls for debugging if we want to override, 
            but usually conflicts with GSAP if enabled during animation. 
            Commented out for the cinematic sequence. */}
                {/* <OrbitControls /> */}
            </Canvas>
        </div>
    )
}
