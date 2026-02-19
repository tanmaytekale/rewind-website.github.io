import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, ScrollControls, useScroll, Sparkles, Float, Scroll } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { GlassesModel } from './GlassesModel';
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

function ModelController({ isMobile }) {
    const scroll = useScroll();
    const modelRef = useRef();

    useFrame((state, delta) => {
        if (modelRef.current) {
            const offset = scroll.offset;
            const time = state.clock.getElapsedTime();

            let targetPos = new THREE.Vector3(0, 0, 0);
            let targetRot = new THREE.Euler(0, 0, 0);
            let targetScale = isMobile ? 2.5 : 3.5;

            if (isMobile) {
                // --- MOBILE LOGIC ---
                // Stacked vertically. Model usually at top, floating.

                // 1. Hero
                if (offset < 0.1) {
                    targetPos.set(0, 0, 0);
                    targetRot.set(0, 0, 0);
                    targetScale = 3.5; // Bigger but not huge
                }
                // 2. Concept
                else if (offset < 0.22) {
                    targetPos.set(0, 1.5, 0); // Move Up
                    targetRot.set(0, -0.2, 0);
                }
                // 3. Vision
                else if (offset < 0.35) {
                    targetPos.set(0, 1.5, 0);
                    targetRot.set(0.1, 0.2, 0);
                }
                // 4. Emotion
                else if (offset < 0.48) {
                    targetPos.set(0, 1.5, 0);
                    targetRot.set(0, -0.5, 0);
                }
                // 5. Use Cases
                else if (offset < 0.6) {
                    targetPos.set(0, 2, -2); // Further Up/Back
                    targetRot.set(0.2, 0, 0);
                }
                // 6. Exploration
                else if (offset < 0.72) {
                    targetPos.set(0, 1.5, 0);
                    targetRot.set(0, -0.2, 0);
                }
                // 7. Specs
                else if (offset < 0.85) {
                    targetPos.set(0, 1.5, 0);
                    targetRot.set(0, 0.2, 0);
                }
                // 8. Footer
                else {
                    targetPos.set(0, -1.2, -2); // Lowered slightly
                    targetRot.set(-0.2, 0, 0);
                }

            } else {
                // --- DESKTOP LOGIC (Existing) ---
                // 1. Hero (0 - 0.1) -> Face Front, HUGE
                if (offset < 0.1) {
                    targetPos.set(0, -1, 0);
                    targetRot.set(0, 0, 0);
                    targetScale = 8; // HUGE
                }
                // 2. Concept
                else if (offset < 0.22) {
                    targetPos.set(3.5, 0, 0);
                    targetRot.set(0, -0.5, 0);
                }
                // 3. Vision
                else if (offset < 0.35) {
                    targetPos.set(-3.5, 0, 0);
                    targetRot.set(0.1, 0.5, 0);
                }
                // 4. Emotion
                else if (offset < 0.48) {
                    targetPos.set(3.5, 0, 0);
                    targetRot.set(0, -0.8, 0.1);
                }
                // 5. Use Cases
                else if (offset < 0.6) {
                    targetPos.set(4, 0, 0);
                    targetRot.set(0, -0.5, 0);
                }
                // 6. Exploration
                else if (offset < 0.72) {
                    targetPos.set(-4, 0, 0);
                    targetRot.set(0, 0.5, 0);
                }
                // 7. Specs
                else if (offset < 0.85) {
                    targetPos.set(4, 0, 0);
                    targetRot.set(0, -0.2, 0);
                }
                // 8. Footer/Quote
                else {
                    targetPos.set(0, 3.5, -2);
                    targetRot.set(0.6, 0, 0);
                }
            }

            // --- Overall Flow (Reduced flow for mobile) ---
            let flowX = Math.sin(offset * Math.PI * 4) * (isMobile ? 0.05 : 0.1);
            let flowZ = Math.cos(offset * Math.PI * 4) * (isMobile ? 0.05 : 0.1);

            targetPos.x += flowX;
            targetPos.z += flowZ;

            // Apply Position
            modelRef.current.position.lerp(targetPos, delta * 3);

            // Apply Rotation
            targetRot.y += Math.sin(time * 0.2) * 0.1;
            modelRef.current.rotation.x = THREE.MathUtils.lerp(modelRef.current.rotation.x, targetRot.x, delta * 4);
            modelRef.current.rotation.y = THREE.MathUtils.lerp(modelRef.current.rotation.y, targetRot.y, delta * 4);
            modelRef.current.rotation.z = THREE.MathUtils.lerp(modelRef.current.rotation.z, targetRot.z, delta * 4);

            // Apply Scale
            const currentScale = modelRef.current.scale.x;
            const newScale = THREE.MathUtils.lerp(currentScale, targetScale, delta * 3);
            modelRef.current.scale.setScalar(newScale);
        }
    });

    return (
        <group ref={modelRef}>
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5} floatingRange={[-0.1, 0.1]}>
                <GlassesModel />
            </Float>
        </group>
    )
}

const Section = ({ align = 'left', children, isMobile }) => (
    <section style={{
        height: '100vh',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: isMobile ? 'center' : (align === 'left' ? 'flex-start' : (align === 'right' ? 'flex-end' : 'center')),
        padding: isMobile ? '0 5vw' : '0 10vw',
        textAlign: isMobile ? 'center' : (align === 'center' ? 'center' : align),
    }}>
        <div style={{ maxWidth: isMobile ? '100%' : '600px', width: '100%', marginTop: isMobile && align !== 'center' ? '40vh' : '0', pointerEvents: 'none' }}>
            {children}
        </div>
    </section>
);

export function Scene() {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', zIndex: 1, background: '#050505' }}>
            <Canvas camera={{ position: [0, 0, 8], fov: 45 }} gl={{ antialias: false, pixelRatio: 1 }}>
                <ambientLight intensity={0.2} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#8b5cf6" />
                <pointLight position={[-10, -10, -10]} intensity={1} color="#ef4444" />
                <spotLight position={[0, 10, 0]} intensity={2} angle={0.5} penumbra={1} />
                <Environment preset="city" />
                <Sparkles count={150} scale={12} size={3} speed={0.4} opacity={0.5} color="#8b5cf6" />

                <EffectComposer disableNormalPass>
                    <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} radius={0.5} />
                    <ChromaticAberration offset={[0.002, 0.002]} />
                    <Noise opacity={0.05} />
                    <Vignette eskil={false} offset={0.1} darkness={0.8} />
                </EffectComposer>

                <ScrollControls pages={8} damping={0.3}>
                    <ModelController isMobile={isMobile} />
                    <Scroll html style={{ width: '100%' }}>

                        {/* 1. Hero */}
                        <section style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0 0 20vh 0' }}>
                            <h1 style={{ fontSize: '15vw', fontWeight: '900', margin: 0, letterSpacing: '-0.05em', background: 'linear-gradient(to right, #8b5cf6, #ffffff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 0 40px rgba(139, 92, 246, 0.5))', zIndex: 10, lineHeight: 1 }}>REWIND</h1>
                        </section>

                        {/* 2. Concept */}
                        <Section align="left" isMobile={isMobile}>
                            <h2 style={{ fontSize: isMobile ? '2rem' : '3rem', color: '#8b5cf6', marginBottom: '1rem' }}>WHAT IF YOU COULD REPLAY A MOMENT?</h2>
                            <p style={{ fontSize: isMobile ? '1rem' : '1.2rem', lineHeight: 1.6, color: '#ccc' }}>
                                Rewind is a simple ideation project exploring the nature of memory.
                                Instead of watching a recording, what if you could step back into it?
                                Using a method called 3D Gaussian Splatting, we recreate spaces in a way that feels immersive and spatial.
                            </p>
                        </Section>

                        {/* 3. Vision */}
                        <Section align="right" isMobile={isMobile}>
                            <h2 style={{ fontSize: isMobile ? '2rem' : '3rem', color: '#ef4444', marginBottom: '1rem' }}>DEPTH, NOT JUST VIDEO</h2>
                            <p style={{ fontSize: isMobile ? '1rem' : '1.2rem', lineHeight: 1.6, color: '#ccc' }}>
                                Dual forward-facing cameras capture depth and geometry.
                                The system rebuilds the scene from 2D images into a 3D environment you can walk through.
                                It's about preserving perspective.
                            </p>
                        </Section>

                        {/* 4. Emotion */}
                        <Section align="left" isMobile={isMobile}>
                            <h2 style={{ fontSize: isMobile ? '2rem' : '3rem', color: '#8b5cf6', marginBottom: '1rem' }}>CAPTURING FEELING</h2>
                            <p style={{ fontSize: isMobile ? '1rem' : '1.2rem', lineHeight: 1.6, color: '#ccc' }}>
                                The goal is not just recording what you saw, but capturing how you felt.
                                Integrated brain-sensing pads read electrical signals to map your emotional state to the moment.
                                Relive the nervous excitement, the warmth, the intensity.
                            </p>
                        </Section>

                        {/* 5. Use Cases */}
                        <Section align="left" isMobile={isMobile}>
                            <h2 style={{ fontSize: isMobile ? '2rem' : '3rem', marginBottom: '3rem' }}>POTENTIAL</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '1rem' : '2rem', textAlign: 'left', background: 'rgba(0,0,0,0.5)', padding: '2rem', borderRadius: '1rem', backdropFilter: 'blur(5px)' }}>
                                <div>
                                    <h3 style={{ color: '#ef4444' }}>EMPATHY</h3>
                                    <p style={{ color: '#aaa' }}>Share a first-person experience that feels deeply human.</p>
                                </div>
                                <div>
                                    <h3 style={{ color: '#8b5cf6' }}>THERAPY</h3>
                                    <p style={{ color: '#aaa' }}>Understand patterns in stress, joy, or fear through reflection.</p>
                                </div>
                                <div>
                                    <h3 style={{ color: '#8b5cf6' }}>EDUCATION</h3>
                                    <p style={{ color: '#aaa' }}>Experience a surgery or performance from an expert's exact view.</p>
                                </div>
                                <div>
                                    <h3 style={{ color: '#ef4444' }}>MEMORY</h3>
                                    <p style={{ color: '#aaa' }}>Preserve context plus feeling. Not just images, but presence.</p>
                                </div>
                            </div>
                        </Section>

                        {/* 6. Future / Research */}
                        <Section align="right" isMobile={isMobile}>
                            <h2 style={{ fontSize: isMobile ? '2rem' : '3rem', color: '#ffffff', marginBottom: '1rem' }}>EXPLORATION</h2>
                            <p style={{ fontSize: isMobile ? '1rem' : '1.2rem', lineHeight: 1.6, color: '#ccc' }}>
                                This is an ideation project. We acknowledge current sensor placement is exploratory.
                                We are researching adaptive contact points and hybrid sensing methods
                                to better interpret complex emotional signals.
                            </p>
                        </Section>

                        {/* 7. Specs */}
                        <Section align="left" isMobile={isMobile}>
                            <h2 style={{ fontSize: isMobile ? '2rem' : '3rem', marginBottom: '2rem' }}>SPECIFICATIONS</h2>
                            <ul style={{ listStyle: 'none', padding: 0, fontSize: isMobile ? '1rem' : '1.2rem', lineHeight: 2, color: '#aaa' }}>
                                <li><strong style={{ color: '#8b5cf6' }}>VISION</strong> Dual Cameras with Depth Alignment</li>
                                <li><strong style={{ color: '#ef4444' }}>PROCESSING</strong> On-device 3D Gaussian Splatting</li>
                                <li><strong style={{ color: '#8b5cf6' }}>SENSING</strong> Non-invasive EEG Arms</li>
                                <li><strong style={{ color: '#ef4444' }}>AI</strong> Edge Emotional Signature Learning</li>
                                <li><strong style={{ color: '#ffffff' }}>PRIVACY</strong> Encrypted Local Storage</li>
                            </ul>
                        </Section>

                        {/* 8. Philosophy/Footer */}
                        <section style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 5vw' }}>
                            <p style={{ fontSize: isMobile ? '1rem' : '1.5rem', maxWidth: '800px', lineHeight: 1.6, color: '#fff', marginBottom: '7rem', background: 'rgba(0,0,0,0.6)', padding: '2rem', borderRadius: '1rem' }}>
                                "If cameras changed how we remember, and smartphones changed how we document life,
                                Rewind asks a softer but deeper question: <br /><br />
                                <span style={{ color: '#8b5cf6' }}>Can we one day preserve not just what happened, but what it meant to us?</span>"
                            </p>
                            <footer style={{ opacity: 0.3, letterSpacing: '0.1em', fontSize: '0.8rem' }}>
                                &copy; 2026 REWIND INC.
                            </footer>
                        </section>

                    </Scroll>
                </ScrollControls>
            </Canvas>
        </div>
    );
}
