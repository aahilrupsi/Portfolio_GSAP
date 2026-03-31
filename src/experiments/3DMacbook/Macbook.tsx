import { useGLTF, Html } from '@react-three/drei'
import { forwardRef, useImperativeHandle, useEffect, useState } from 'react'
import { Group, Mesh, MeshStandardMaterial, Vector3 } from 'three'
import { createPortal } from '@react-three/fiber'
import TestScreen from './TestScreen'

interface MacbookProps {
    [key: string]: any
}

const Macbook = forwardRef<Group, MacbookProps>((props, ref) => {
    const { scene, nodes } = useGLTF('/files/macbook_blender_export.glb') as any
    const [screenInfo, setScreenInfo] = useState<{
        centerPos: [number, number, number]
        scale: number
        htmlWidth: number
        htmlHeight: number
        distanceFactor: number
    } | null>(null)
    const [showScreen, setShowScreen] = useState(false)

    useEffect(() => {
        // The camera's initial delay is 0.5s, and the 360 orbit takes 4.5s.
        // We wait exactly 5.0 seconds before "booting up" the screen so it's
        // never visible while the camera sweeps behind the laptop.
        const timer = setTimeout(() => {
            setShowScreen(true)
        }, 5000)
        return () => clearTimeout(timer)
    }, [])

    useImperativeHandle(ref, () => nodes.Screen_Plane)

    useEffect(() => {
        if (nodes.Screen_Plane && nodes.Object_2) {
            const screenPlane = nodes.Screen_Plane as Mesh
            const screenMesh = nodes.Object_2 as Mesh

            console.log('=== CALCULATING SCREEN DIMENSIONS ===')

            // Make Screen_Plane transparent
            if (!Array.isArray(screenPlane.material)) {
                const material = screenPlane.material as MeshStandardMaterial
                screenPlane.material = material.clone()
                screenPlane.material.transparent = true
                screenPlane.material.opacity = 0
                console.log('✓ Screen made transparent')
            }

            // Get Screen_Plane geometry center for positioning
            screenPlane.geometry.computeBoundingBox()
            const screenPlaneBox = screenPlane.geometry.boundingBox

            // Get Object_2 dimensions for sizing
            screenMesh.geometry.computeBoundingBox()
            const screenBox = screenMesh.geometry.boundingBox

            if (screenPlaneBox && screenBox) {
                const planeCenter = new Vector3()
                screenPlaneBox.getCenter(planeCenter)

                // Object_2 dimensions (actual screen)
                const width3D = screenBox.max.x - screenBox.min.x
                const height3D = screenBox.max.z - screenBox.min.z // Z is height when flat
                const aspectRatio = width3D / height3D

                console.log('Object_2 3D dimensions:', { width3D, height3D })
                console.log('Aspect ratio:', aspectRatio)

                // HTML dimensions - match aspect ratio
                const htmlWidth = 1450
                const htmlHeight = Math.round(htmlWidth / aspectRatio) - 50

                console.log('HTML dimensions:', { htmlWidth, htmlHeight })

                // Calculate scale using drei's formula:
                // scale = (meshWidth × (400 / distanceFactor)) / htmlWidth
                // Using distanceFactor = 6 (reverse-engineered from your working scale=0.16)
                const distanceFactor = 6
                const scale = (width3D * (400 / distanceFactor)) / htmlWidth
                console.log(scale)

                console.log('Scale calculation:')
                console.log('  - distanceFactor:', distanceFactor)
                console.log('  - formula: (', width3D, '× (400 /', distanceFactor, ')) /', htmlWidth)
                console.log('  - result:', scale)

                setScreenInfo({
                    centerPos: [planeCenter.x, planeCenter.y, planeCenter.z],
                    scale,
                    htmlWidth,
                    htmlHeight,
                    distanceFactor
                })

                console.log('=== END CALCULATION ===')
            }
        }
    }, [nodes])

    return (
        <group {...props}>
            <primitive object={scene} />

            {showScreen && screenInfo && nodes.Screen_Plane && createPortal(
                <Html
                    transform
                    position={screenInfo.centerPos}
                    rotation={[Math.PI / 2, 0, 0]}
                    scale={screenInfo.scale - 0.01}

                    distanceFactor={screenInfo.distanceFactor}
                    style={{
                        width: `${screenInfo.htmlWidth}px`,
                        height: `${screenInfo.htmlHeight}px`,
                        background: '#000000',
                        border: '5px solid #000000',
                        borderRadius: '20px 20px 0 0', // top-left, top-right, bottom-right, bottom-left
                        overflow: 'hidden',
                        backfaceVisibility: 'hidden',
                    }}
                >
                    <TestScreen width={screenInfo.htmlWidth} height={screenInfo.htmlHeight} />
                </Html>,
                nodes.Screen_Plane
            )}
        </group>
    )
})

export default Macbook

useGLTF.preload('/files/macbook_blender_export.glb')