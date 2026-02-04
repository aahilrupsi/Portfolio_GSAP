
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import Macbook from './Macbook'

export default function Experience() {
    return (
        <div className="h-screen w-full bg-white">
            <Canvas
                camera={{
                    position: [0, 2, 5],
                    fov: 45
                }}
            >
                <color attach="background" args={['white']} />

                {/* Lighting */}
                <Environment preset="city" />

                <group position-y={-0.5}>
                    <Macbook />
                    <ContactShadows opacity={0.4} scale={10} blur={2} far={4} color="#000000" />
                </group>

                {/* Controls for debugging/viewing */}
                <OrbitControls />
            </Canvas>
        </div>
    )
}
