import { useRef, useEffect, useCallback } from "react";
import * as THREE from "three";

/**
 * Premium 3D hexagon command center — dark metallic hex grid with
 * gold/silver edge glow, volumetric lighting, data stream particles,
 * floating holographic nodes, and cinematic camera movement.
 */
export default function HexScene3D({ height = 440 }) {
  const mountRef = useRef(null);
  const sceneRef = useRef({});
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  const initScene = useCallback((container) => {
    const w = container.clientWidth;
    const h = height;

    // High-quality renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050510, 0.018);

    // Cinematic camera
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 300);
    camera.position.set(0, 16, 22);
    camera.lookAt(0, 0, -2);

    // --- Premium Lighting Rig ---
    scene.add(new THREE.AmbientLight(0x1a1a3a, 0.3));

    const keyLight = new THREE.DirectionalLight(0xd4af37, 0.4);
    keyLight.position.set(10, 15, 5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x4466ff, 0.3);
    rimLight.position.set(-10, 10, -5);
    scene.add(rimLight);

    const goldPoint = new THREE.PointLight(0xd4af37, 2.5, 60);
    goldPoint.position.set(4, 6, 3);
    scene.add(goldPoint);

    const bluePoint = new THREE.PointLight(0x3366ff, 1.8, 50);
    bluePoint.position.set(-6, 5, -4);
    scene.add(bluePoint);

    const cyanPoint = new THREE.PointLight(0x06b6d4, 1.0, 35);
    cyanPoint.position.set(0, 4, -6);
    scene.add(cyanPoint);

    // Spotlight for dramatic center beam
    const spot = new THREE.SpotLight(0xd4af37, 1.5, 40, Math.PI / 6, 0.5, 1);
    spot.position.set(0, 20, 0);
    spot.target.position.set(0, 0, 0);
    scene.add(spot);
    scene.add(spot.target);

    // --- Reflective Ground Plane ---
    const groundGeo = new THREE.PlaneGeometry(60, 40);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x06080e,
      metalness: 0.95,
      roughness: 0.15,
      envMapIntensity: 0.5,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.2;
    scene.add(ground);

    // --- Hexagon Grid (premium metallic) ---
    const hexagons = [];
    const hexRadius = 0.95;
    const hexH = 0.2;
    const gap = 0.1;
    const cols = 16;
    const rows = 12;

    const hexGeo = new THREE.CylinderGeometry(hexRadius, hexRadius, hexH, 6);
    hexGeo.rotateY(Math.PI / 6);

    // Edge wireframe geometry
    const edgeShape = new THREE.Shape();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const x = Math.cos(angle) * hexRadius * 0.96;
      const y = Math.sin(angle) * hexRadius * 0.96;
      if (i === 0) edgeShape.moveTo(x, y);
      else edgeShape.lineTo(x, y);
    }
    edgeShape.closePath();
    const edgePoints = edgeShape.getPoints(6);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = (col - cols / 2) * (hexRadius * 1.75 + gap) + (row % 2 === 0 ? 0 : hexRadius * 0.875);
        const z = (row - rows / 2) * (hexRadius * 1.52 + gap);
        const distFromCenter = Math.sqrt(x * x + z * z);

        const mat = new THREE.MeshStandardMaterial({
          color: 0x0c0e18,
          metalness: 0.95,
          roughness: 0.2,
          emissive: 0x080a14,
          emissiveIntensity: 0.15,
        });

        const mesh = new THREE.Mesh(hexGeo, mat);
        mesh.position.set(x, 0, z);
        mesh.receiveShadow = true;
        mesh.userData = { baseY: 0, col, row, phase: Math.random() * Math.PI * 2, dist: distFromCenter };
        scene.add(mesh);
        hexagons.push(mesh);

        // Premium edge glow lines
        const lineGeo = new THREE.BufferGeometry().setFromPoints(
          edgePoints.map(p => new THREE.Vector3(p.x, 0, p.y))
        );
        const lineMat = new THREE.LineBasicMaterial({
          color: 0xd4af37,
          transparent: true,
          opacity: 0.08 + (1 - Math.min(distFromCenter / 12, 1)) * 0.12,
        });
        const line = new THREE.LineLoop(lineGeo, lineMat);
        line.position.set(x, hexH / 2 + 0.02, z);
        line.rotation.x = -Math.PI / 2;
        scene.add(line);
        mesh.userData.line = line;
        mesh.userData.lineMat = lineMat;
        mesh.userData.baseOpacity = lineMat.opacity;
      }
    }

    // --- Workflow Nodes (holographic) ---
    const nodes = [];
    const nodeConfigs = [
      { x: -7.5, z: -2, color: 0xd4af37, size: 0.4 },
      { x: -3.8, z: -0.5, color: 0x22c55e, size: 0.38 },
      { x: 0, z: 0.5, color: 0x6366f1, size: 0.42 },
      { x: 3.8, z: -0.5, color: 0x06b6d4, size: 0.38 },
      { x: 7.5, z: -2, color: 0xf59e0b, size: 0.4 },
    ];

    nodeConfigs.forEach((nc, i) => {
      // Inner sphere — glowing core
      const coreGeo = new THREE.SphereGeometry(nc.size * 0.5, 32, 32);
      const coreMat = new THREE.MeshBasicMaterial({
        color: nc.color,
        transparent: true,
        opacity: 0.9,
      });
      const core = new THREE.Mesh(coreGeo, coreMat);

      // Outer sphere — glass shell
      const shellGeo = new THREE.SphereGeometry(nc.size, 32, 32);
      const shellMat = new THREE.MeshPhysicalMaterial({
        color: nc.color,
        metalness: 0.1,
        roughness: 0.1,
        transmission: 0.7,
        thickness: 0.5,
        transparent: true,
        opacity: 0.25,
        emissive: nc.color,
        emissiveIntensity: 0.3,
      });
      const shell = new THREE.Mesh(shellGeo, shellMat);

      const group = new THREE.Group();
      group.add(core);
      group.add(shell);
      group.position.set(nc.x, 3.2, nc.z);
      group.userData = { baseY: 3.2, phase: i * 1.1, color: nc.color, shellMat, coreMat };
      scene.add(group);
      nodes.push(group);

      // Orbital ring
      const ringGeo = new THREE.TorusGeometry(nc.size * 1.4, 0.015, 16, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: nc.color,
        transparent: true,
        opacity: 0.3,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 3;
      group.add(ring);
      group.userData.ring = ring;
      group.userData.ringMat = ringMat;

      // Vertical light beam from hex grid to node
      const beamGeo = new THREE.CylinderGeometry(0.02, 0.06, 3.2, 8);
      const beamMat = new THREE.MeshBasicMaterial({
        color: nc.color,
        transparent: true,
        opacity: 0.12,
      });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.set(nc.x, 1.6, nc.z);
      scene.add(beam);
      group.userData.vertBeam = beam;
      group.userData.vertBeamMat = beamMat;
    });

    // --- Connection arcs (premium bezier tubes) ---
    const arcs = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      const p1 = nodes[i].position.clone();
      const p2 = nodes[i + 1].position.clone();
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      mid.y += 2.0;

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const tubeGeo = new THREE.TubeGeometry(curve, 48, 0.025, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: 0xd4af37,
        transparent: true,
        opacity: 0.2,
      });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      scene.add(tube);

      // Traveling orb along the curve
      const orbGeo = new THREE.SphereGeometry(0.06, 16, 16);
      const orbMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const orb = new THREE.Mesh(orbGeo, orbMat);
      scene.add(orb);

      arcs.push({ tube, mat: tubeMat, curve, orb, orbMat });
    }

    // --- Data stream particles (vertical rising) ---
    const streamCount = 400;
    const sGeo = new THREE.BufferGeometry();
    const sPos = new Float32Array(streamCount * 3);
    const sColors = new Float32Array(streamCount * 3);
    const goldC = new THREE.Color(0xd4af37);
    const silverC = new THREE.Color(0xc0c0c0);
    const cyanC = new THREE.Color(0x06b6d4);
    const palette = [goldC, silverC, cyanC];

    for (let i = 0; i < streamCount; i++) {
      sPos[i * 3] = (Math.random() - 0.5) * 35;
      sPos[i * 3 + 1] = Math.random() * 12;
      sPos[i * 3 + 2] = (Math.random() - 0.5) * 25;
      const c = palette[Math.floor(Math.random() * palette.length)];
      sColors[i * 3] = c.r;
      sColors[i * 3 + 1] = c.g;
      sColors[i * 3 + 2] = c.b;
    }
    sGeo.setAttribute("position", new THREE.BufferAttribute(sPos, 3));
    sGeo.setAttribute("color", new THREE.BufferAttribute(sColors, 3));
    const sMat = new THREE.PointsMaterial({
      size: 0.04,
      transparent: true,
      opacity: 0.6,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const streams = new THREE.Points(sGeo, sMat);
    scene.add(streams);

    // --- Horizontal data grid lines ---
    const gridLines = new THREE.Group();
    for (let i = 0; i < 8; i++) {
      const y = 0.5 + i * 1.2;
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-15, y, -10),
        new THREE.Vector3(15, y, -10),
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0xd4af37,
        transparent: true,
        opacity: 0.03 + (i % 3 === 0 ? 0.04 : 0),
      });
      gridLines.add(new THREE.Line(lineGeo, lineMat));
    }
    scene.add(gridLines);

    sceneRef.current = { renderer, scene, camera, hexagons, nodes, arcs, streams, goldPoint, bluePoint, cyanPoint, spot };
  }, [height]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    initScene(container);

    const { renderer, scene, camera, hexagons, nodes, arcs, streams, goldPoint, bluePoint, cyanPoint, spot } = sceneRef.current;

    const handleMouse = (e) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.targetX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.targetY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };
    container.addEventListener("mousemove", handleMouse);

    const raycaster = new THREE.Raycaster();

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = performance.now() * 0.001;

      // Smooth mouse interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Cinematic camera with mouse parallax
      camera.position.x = Math.sin(t * 0.1) * 2 + mouseRef.current.x * 3;
      camera.position.y = 15 + Math.sin(t * 0.15) * 0.8 + mouseRef.current.y * 1.5;
      camera.position.z = 22 + Math.cos(t * 0.08) * 1;
      camera.lookAt(mouseRef.current.x * 1.5, 0.5, -2);

      // Raycaster for hex interaction
      raycaster.setFromCamera(mouseRef.current, camera);
      const intersects = raycaster.intersectObjects(hexagons);
      const hitSet = new Set(intersects.slice(0, 5).map(i => i.object));

      // Hex grid animation
      hexagons.forEach((hex) => {
        const { phase, dist, line, lineMat, baseOpacity } = hex.userData;
        // Concentric wave from center
        const wave = Math.sin(t * 0.6 - dist * 0.3 + phase * 0.3) * 0.12;
        hex.position.y = wave;

        const isHit = hitSet.has(hex);
        if (isHit) {
          hex.material.emissive.lerp(new THREE.Color(0xd4af37), 0.15);
          hex.material.emissiveIntensity += (1.2 - hex.material.emissiveIntensity) * 0.12;
          lineMat.opacity += (0.9 - lineMat.opacity) * 0.15;
          hex.position.y += 0.4;
          lineMat.color.lerp(new THREE.Color(0xffffff), 0.1);
        } else {
          hex.material.emissive.lerp(new THREE.Color(0x080a14), 0.03);
          hex.material.emissiveIntensity += (0.15 - hex.material.emissiveIntensity) * 0.03;
          lineMat.opacity += (baseOpacity - lineMat.opacity) * 0.03;
          lineMat.color.lerp(new THREE.Color(0xd4af37), 0.02);
        }
        if (line) line.position.y = hex.position.y + 0.12;
      });

      // Holographic nodes
      nodes.forEach((node) => {
        const { baseY, phase, ring, ringMat, shellMat, vertBeam, vertBeamMat } = node.userData;
        node.position.y = baseY + Math.sin(t * 0.9 + phase) * 0.35;
        node.rotation.y = t * 0.4 + phase;
        if (ring) {
          ring.rotation.z = t * 0.8 + phase;
          ring.rotation.x = Math.PI / 3 + Math.sin(t * 0.5 + phase) * 0.2;
          ringMat.opacity = 0.15 + Math.sin(t * 1.5 + phase) * 0.1;
        }
        if (shellMat) {
          shellMat.emissiveIntensity = 0.2 + Math.sin(t * 2 + phase) * 0.15;
        }
        if (vertBeam) {
          vertBeam.position.y = node.position.y / 2;
          vertBeam.scale.y = node.position.y / 3.2;
          vertBeamMat.opacity = 0.06 + Math.sin(t * 1.8 + phase) * 0.06;
        }
      });

      // Traveling orbs along arcs
      arcs.forEach((arc, i) => {
        const progress = ((t * 0.3 + i * 0.5) % 1);
        const pos = arc.curve.getPoint(progress);
        arc.orb.position.copy(pos);
        arc.orbMat.color.setHSL(0.12 + Math.sin(t + i) * 0.05, 0.8, 0.7);
        arc.mat.opacity = 0.12 + Math.sin(t * 1.5 + i * 2) * 0.1;
      });

      // Data stream particles
      const positions = streams.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += 0.008 + Math.sin(i) * 0.002;
        if (positions[i + 1] > 12) {
          positions[i + 1] = 0;
          positions[i] = (Math.random() - 0.5) * 35;
          positions[i + 2] = (Math.random() - 0.5) * 25;
        }
      }
      streams.geometry.attributes.position.needsUpdate = true;
      streams.rotation.y = t * 0.01;

      // Orbiting lights
      goldPoint.position.x = Math.sin(t * 0.25) * 10;
      goldPoint.position.z = Math.cos(t * 0.25) * 7;
      goldPoint.intensity = 2.0 + Math.sin(t * 0.8) * 0.5;

      bluePoint.position.x = Math.cos(t * 0.2) * 8;
      bluePoint.position.z = Math.sin(t * 0.2) * 6;

      cyanPoint.position.x = Math.sin(t * 0.3 + 2) * 6;
      cyanPoint.position.z = Math.cos(t * 0.3 + 2) * 5;

      spot.intensity = 1.2 + Math.sin(t * 0.5) * 0.3;

      renderer.render(scene, camera);
    };
    animate();

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
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [initScene, height]);

  return (
    <div
      ref={mountRef}
      className="w-full relative rounded-2xl overflow-hidden cursor-crosshair"
      style={{
        height,
        background: "linear-gradient(180deg, #030308 0%, #0a0a18 40%, #050510 100%)",
      }}
    />
  );
}