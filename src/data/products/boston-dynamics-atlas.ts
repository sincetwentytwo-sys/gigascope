import type { ProductSpec } from "./index";

export const bostonDynamicsAtlas: ProductSpec = {
  slug: "boston-dynamics-atlas",
  name: "Boston Dynamics Atlas (Electric)",
  aka: "All-electric Atlas humanoid",
  category: "robot",
  description:
    "Successor to the hydraulic Atlas. Fully electric actuation, target weight ~80 kg, 28 degrees of freedom. Hyundai-owned subsidiary; first commercial pilot at Hyundai Motor Group Metaplant America. Designed for unstructured industrial environments — picking, kitting, palletizing, last-meter material handling.",
  cameraPosition: [0, 0, 5],
  mainCredit: {
    source: "Boston Dynamics press",
    url: "https://bostondynamics.com/news/introducing-electric-atlas/",
    license: "Press kit (editorial use)",
  },
  parts: [
    { id: "head", name: "Head — stereo camera + LiDAR", description: "Stereo cameras + Velodyne-class spinning LiDAR. The head can rotate 360° (unlike previous Atlas) which gives the perception stack full situational awareness without moving the whole torso.", geometry: "sphere", args: [0,0,0], color: "#a855f7", hotspot: { x: 0.50, y: 0.19 } },
    { id: "torso", name: "Torso — battery + compute", description: "Lithium-ion battery pack and onboard compute (multi-GPU). ~4 hours of typical task runtime. NVIDIA Jetson + custom planning silicon. Houses the IMU and main thermal management.", geometry: "box", args: [0,0,0], color: "#06b6d4", hotspot: { x: 0.50, y: 0.34 } },
    { id: "left-shoulder", name: "Left shoulder joint", description: "3-DoF shoulder with custom electric actuators replacing the hydraulic actuators of the previous Atlas. Roll/pitch/yaw axes with integrated torque sensing for force-controlled motion.", geometry: "sphere", args: [0,0,0], color: "#22c55e", hotspot: { x: 0.36, y: 0.31 } },
    { id: "right-shoulder", name: "Right shoulder joint", description: "Mirror of left shoulder. Atlas can lift ~25 kg per arm; the new electric actuators are quieter than hydraulics by design.", geometry: "sphere", args: [0,0,0], color: "#22c55e", hotspot: { x: 0.64, y: 0.31 } },
    { id: "left-arm", name: "Left arm", description: "Upper + lower arm linkages with elbow joint. Force-controlled compliance allows safe operation around humans.", geometry: "box", args: [0,0,0], color: "#22c55e", hotspot: { x: 0.345, y: 0.435 } },
    { id: "right-arm", name: "Right arm", description: "Mirror of left arm.", geometry: "box", args: [0,0,0], color: "#22c55e", hotspot: { x: 0.655, y: 0.435 } },
    { id: "left-hand", name: "Left hand", description: "Multi-finger end effector. Targeted for general manipulation — bin picking, palletizing, tool use. Earlier Atlas iterations used custom pincers; the electric Atlas roadmap includes 4-finger dexterous hands.", geometry: "sphere", args: [0,0,0], color: "#fbbf24", hotspot: { x: 0.345, y: 0.57 } },
    { id: "right-hand", name: "Right hand", description: "Mirror of left hand.", geometry: "sphere", args: [0,0,0], color: "#fbbf24", hotspot: { x: 0.655, y: 0.57 } },
    { id: "pelvis", name: "Pelvis — central CoG", description: "Pelvis is the central mass — robot is dynamically balanced around it. Atlas's signature ability to recover from pushes/slips comes from real-time pelvis-CoG control combined with the whole-body MPC controller.", geometry: "box", args: [0,0,0], color: "#06b6d4", hotspot: { x: 0.50, y: 0.45 } },
    { id: "left-leg", name: "Left leg (knee + ankle)", description: "Knee + ankle joints with high-torque electric actuators. Can squat, climb stairs, and recover from slips. Walks at ~1.5 m/s.", geometry: "box", args: [0,0,0], color: "#ef4444", hotspot: { x: 0.46, y: 0.66 } },
    { id: "right-leg", name: "Right leg (knee + ankle)", description: "Mirror of left leg.", geometry: "box", args: [0,0,0], color: "#ef4444", hotspot: { x: 0.54, y: 0.66 } },
    { id: "left-foot", name: "Left foot", description: "Soft-soled foot with embedded pressure sensors. Foot placement is computed by the MPC controller several seconds ahead.", geometry: "box", args: [0,0,0], color: "#9ca3af", hotspot: { x: 0.465, y: 0.815 } },
    { id: "right-foot", name: "Right foot", description: "Mirror of left foot. Atlas can run, jump, and do parkour (the public-facing demos) — but commercial pilots focus on flat-floor industrial environments first.", geometry: "box", args: [0,0,0], color: "#9ca3af", hotspot: { x: 0.535, y: 0.815 } },
  ],
  relatedSites: [],
};
