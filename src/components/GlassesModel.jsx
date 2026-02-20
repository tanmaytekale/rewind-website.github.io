import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';

export function GlassesModel(props) {
    const group = useRef();
    // Load the GLB model
    const { nodes, materials } = useGLTF('./rewind_headset.glb');

    return (
        <group ref={group} {...props} dispose={null}>
            {/* If the model structure is simple, we can just primitive it */}
            {/* However, for better control over materials (like making lenses transparent), 
          it's often better to traverse or select specific meshes if known.
          Since I don't know the exact node names without inspecting, I'll dump the whole scene 
          but try to override materials if possible, or just rely on the GLB's exported materials.
       */}
            <primitive object={nodes.Scene || nodes.scene} />
        </group>
    );
}

useGLTF.preload('./rewind_headset.glb');
