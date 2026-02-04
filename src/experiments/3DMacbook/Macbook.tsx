
import { useGLTF } from '@react-three/drei'

export default function Macbook() {
    const model = useGLTF('/files/macbook_blender_export.glb')

    return (
        <primitive
            object={model.scene}
            position={[0, 0, 0]}
        />
    )
}

// Preload the model to avoid pop-in
useGLTF.preload('/files/macbook_blender_export.glb')
