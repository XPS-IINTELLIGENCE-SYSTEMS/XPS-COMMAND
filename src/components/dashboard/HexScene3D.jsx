import { useRef, useEffect, useCallback } from "react";
import * as THREE from "three";

/**
 * Full 3D animated hexagon grid with glowing gold edges,
 * floating workflow nodes, connection beams, and mouse interactivity.
 * Uses raw Three.js for maximum performance.
 */
export default function HexScene3D({ height = 420 }) {
  const mountRef = useRef(null);
  const sceneRef = useRef({});
  const mouseRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef(0);

  const initScene = useCallback((container) => {
    const w = container.clientWidth;
    const h = height;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a14, 0.025);

    // Camera — angled perspective for 3D depth
    const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 200);
    camera.position.set(0, 12, 18);
    camera.lookAt(0, 0, 0);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x222244, 0.4);
    scene.add(ambientLight);

    const goldLight = new THREE.PointLight(0xd4af37, 1.8, 50);
    goldLight.position.set(5, 8, 5);
    scene.add(goldLight);

    const blueLight = new THREE.PointLight(0x4488ff, 1.2, 40);
    blueLight.position.set(-5, 6, -3);
    scene.add(blueLight);

    // --- Hexagon Grid ---
    const hexagons = [];
    const hexRadius = 1.0;
    const hexHeight = 0.15;
    const gap = 0.12;
    const cols = 14;
    const rows = 10;

    const hexGeo = new THREE.CylinderGeometry(hexRadius, hexRadius, hexHeight, 6);
    hexGeo.rotateY(Math.PI / 6);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = (col - cols / 2) * (hexRadius * 1.75 + gap) + (row % 2 === 0 ? 0 : hexRadius * 0.875);
        const z = (row - rows / 2) * (hexRadius * 1.52 + gap);

        const mat = new THREE.MeshStandardMaterial({
          color: 0x111120,
          metalness: 0.9,
          roughness: 0.3,
          emissive: 0x0a0a14,
          emissiveIntensity: 0.2,
        });

        const mesh = new THREE.Mesh(hexGeo, mat);
        mesh.position.set(x, 0, z);
        mesh.userData = { baseY: 0, col, row, phase: Math.random() * Math.PI * 2 };
        scene.add(mesh);
        hexagons.push(mesh);

        // Edge glow ring
        const edgeGeo = new THREE.TorusGeometry(hexRadius * 0.92, 0.02, 8, 6);
        edgeGeo.rotateX(Math.PI / 2);
        edgeGeo.rotateZ(Math.PI / 6);
        const edgeMat = new THREE.MeshBasicMaterial({
          color: 0xd4af37,
          transparent: true,
          opacity: 0.12,
        });
        const edge = new THREE.Mesh(edgeGeo, edgeMat);
        edge.position.set(x, hexHeight / 2 + 0.01, z);
        scene.add(edge);
        mesh.userData.edge = edge;
        mesh.userData.edgeMat = edgeMat;
      }
    }

    // --- Workflow Nodes (floating spheres) ---
    const nodes = [];
    const nodePositions = [
      { x: -6, z: -3, color: 0xd4af37, label: "Discover" },
      { x: -3, z: -1, color: 0x22c55e, label: "Qualify" },
      { x: 0, z: 0, color: 0x6366f1, label: "Propose" },
      { x: 3, z: -1, color: 0x06b6d4, label: "Close" },
      { x: 6, z: -3, color: 0xf59e0b, label: "Deliver" },
    ];

    const nodeGeo = new THREE.SphereGeometry(0.35, 32, 32);
    nodePositions.forEach((np, i) => {
      const mat = new THREE.MeshStandardMaterial({
        color: np.color,
        emissive: np.color,
        emissiveIntensity: 0.6,
        metalness: 0.8,
        roughness: 0.2,
      });
      const sphere = new THREE.Mesh(nodeGeo, mat);
      sphere.position.set(np.x, 2.5, np.z);
      sphere.userData = { baseY: 2.5, phase: i * 0.8, color: np.color };
      scene.add(sphere);
      nodes.push(sphere);

      // Glow halo
      const haloGeo = new THREE.RingGeometry(0.5, 0.8, 32);
      const haloMat = new THREE.MeshBasicMaterial({
        color: np.color,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.set(np.x, 2.5, np.z);
      halo.rotation.x = -Math.PI / 2;
      scene.add(halo);
      sphere.userData.halo = halo;
      sphere.userData.haloMat = haloMat;
    });

    // --- Connection Beams ---
    const beams = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      const points = [nodes[i].position.clone(), nodes[i + 1].position.clone()];
      const mid = new THREE.Vector3().addVectors(points[0], points[1]).multiplyScalar(0.5);
      mid.y += 1.2;

      const curve = new THREE.QuadraticBezierCurve3(points[0], mid, points[1]);
      const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.03, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: 0xd4af37,
        transparent: true,
        opacity: 0.35,
      });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      scene.add(tube);
      beams.push({ tube, mat: tubeMat, curve });
    }

    // --- Particle field ---
    const particleCount = 200;
    const pGeo = new THREE.BufferGeometry();
    const pPositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pPositions[i * 3] = (Math.random() - 0.5) * 30;
      pPositions[i * 3 + 1] = Math.random() * 8 + 1;
      pPositions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xd4af37,
      size: 0.06,
      transparent: true,
      opacity: 0.5,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    sceneRef.current = { renderer, scene, camera, hexagons, nodes, beams, particles, goldLight, blueLight };
  }, [height]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    initScene(container);

    const { renderer, scene, camera, hexagons, nodes, beams, particles, goldLight, blueLight } = sceneRef.current;

    // Mouse tracking
    const handleMouse = (e) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };
    container.addEventListener("mousemove", handleMouse);

    // Raycaster for hex hover
    const raycaster = new THREE.Raycaster();

    // Animation loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = performance.now() * 0.001;
      frameRef.current = t;

      // Gentle camera sway
      camera.position.x = Math.sin(t * 0.15) * 1.5;
      camera.position.y = 12 + Math.sin(t * 0.2) * 0.5;
      camera.lookAt(0, 0, 0);

      // Hex wave animation + mouse proximity glow
      raycaster.setFromCamera(mouseRef.current, camera);
      const intersects = raycaster.intersectObjects(hexagons);
      const hitSet = new Set(intersects.map(i => i.object));

      hexagons.forEach((hex) => {
        const { phase, edge, edgeMat } = hex.userData;
        // Wave
        hex.position.y = Math.sin(t * 0.8 + phase) * 0.15;

        // Mouse proximity effect
        const isHit = hitSet.has(hex);
        const targetEmissive = isHit ? 0.8 : 0.2;
        hex.material.emissiveIntensity += (targetEmissive - hex.material.emissiveIntensity) * 0.1;

        if (isHit) {
          hex.material.emissive.setHex(0xd4af37);
          edgeMat.opacity += (0.7 - edgeMat.opacity) * 0.15;
          hex.position.y += 0.3;
        } else {
          hex.material.emissive.setHex(0x0a0a14);
          edgeMat.opacity += (0.12 - edgeMat.opacity) * 0.05;
        }
        if (edge) edge.position.y = hex.position.y + 0.08;
      });

      // Floating nodes
      nodes.forEach((node) => {
        const { baseY, phase, halo, haloMat } = node.userData;
        node.position.y = baseY + Math.sin(t * 1.2 + phase) * 0.3;
        node.rotation.y = t * 0.5 + phase;
        if (halo) {
          halo.position.y = node.position.y;
          haloMat.opacity = 0.1 + Math.sin(t * 2 + phase) * 0.08;
          halo.scale.setScalar(1 + Math.sin(t * 1.5 + phase) * 0.15);
        }
      });

      // Beam pulse
      beams.forEach((b, i) => {
        b.mat.opacity = 0.2 + Math.sin(t * 2 + i * 1.5) * 0.2;
      });

      // Particle drift
      const positions = particles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += 0.003;
        if (positions[i + 1] > 10) positions[i + 1] = 1;
      }
      particles.geometry.attributes.position.needsUpdate = true;
      particles.rotation.y = t * 0.02;

      // Moving lights
      goldLight.position.x = Math.sin(t * 0.3) * 8;
      goldLight.position.z = Math.cos(t * 0.3) * 5;
      blueLight.position.x = Math.cos(t * 0.25) * 6;
      blueLight.position.z = Math.sin(t * 0.25) * 4;

      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      const w = container.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [initScene, height]);

  return (
    <div
      ref={mountRef}
      className="w-full relative rounded-2xl overflow-hidden"
      style={{ height, background: "linear-gradient(180deg, rgba(10,10,20,0.95) 0%, rgba(10,10,20,0.7) 100%)" }}
    />
  );
}