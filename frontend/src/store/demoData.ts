import type { StadiumData, FieldDevice, OperationalCommand } from './useStore';

export const demoData: StadiumData[] = [
  { timestamp: "2026-07-10 18:00", gate: "Gate A", crowd_count: 8500, incident_type: "None", volunteers_available: 25, weather: "Sunny", language: "English" },
  { timestamp: "2026-07-10 18:00", gate: "Gate B", crowd_count: 9200, incident_type: "Medical Emergency", volunteers_available: 22, weather: "Sunny", language: "Spanish" },
  { timestamp: "2026-07-10 18:00", gate: "Gate C", crowd_count: 4500, incident_type: "None", volunteers_available: 15, weather: "Sunny", language: "French" },
  { timestamp: "2026-07-10 18:00", gate: "Gate D", crowd_count: 5100, incident_type: "None", volunteers_available: 18, weather: "Sunny", language: "Arabic" },
  { timestamp: "2026-07-10 18:30", gate: "Gate A", crowd_count: 12000, incident_type: "Ticket Scanners Malfunction", volunteers_available: 24, weather: "Sunny", language: "English" },
  { timestamp: "2026-07-10 18:30", gate: "Gate B", crowd_count: 14500, incident_type: "None", volunteers_available: 20, weather: "Sunny", language: "Spanish" },
  { timestamp: "2026-07-10 18:30", gate: "Gate C", crowd_count: 7800, incident_type: "None", volunteers_available: 18, weather: "Sunny", language: "Portuguese" },
  { timestamp: "2026-07-10 18:30", gate: "Gate D", crowd_count: 8900, incident_type: "None", volunteers_available: 19, weather: "Sunny", language: "German" },
  { timestamp: "2026-07-10 19:00", gate: "North Gate", crowd_count: 16000, incident_type: "Gate Congestion", volunteers_available: 30, weather: "Clear", language: "English" },
  { timestamp: "2026-07-10 19:00", gate: "South Gate", crowd_count: 18500, incident_type: "None", volunteers_available: 28, weather: "Clear", language: "Spanish" },
  { timestamp: "2026-07-10 19:00", gate: "East Gate", crowd_count: 11000, incident_type: "None", volunteers_available: 22, weather: "Clear", language: "Japanese" },
  { timestamp: "2026-07-10 19:00", gate: "West Gate", crowd_count: 12500, incident_type: "None", volunteers_available: 24, weather: "Clear", language: "Korean" },
  { timestamp: "2026-07-10 19:30", gate: "North Gate", crowd_count: 19500, incident_type: "None", volunteers_available: 28, weather: "Clear", language: "English" },
  { timestamp: "2026-07-10 19:30", gate: "South Gate", crowd_count: 22000, incident_type: "Crowd Surge", volunteers_available: 25, weather: "Clear", language: "Spanish" },
  { timestamp: "2026-07-10 19:30", gate: "East Gate", crowd_count: 13000, incident_type: "None", volunteers_available: 24, weather: "Clear", language: "Hindi" },
  { timestamp: "2026-07-10 19:30", gate: "West Gate", crowd_count: 14000, incident_type: "None", volunteers_available: 26, weather: "Clear", language: "Chinese" }
];

export const demoDevices: FieldDevice[] = [
  { id: 'DEV-001', name: 'Volunteer Team Alpha', type: 'Volunteer', language: 'English', assignedGate: 'Gate 1', assignedZone: 'North Concourse', status: 'Online', batteryLevel: 92, networkStrength: 'Strong', lastSeen: 'Just now' },
  { id: 'DEV-002', name: 'Medical Response 1', type: 'Medical', language: 'Spanish', assignedGate: 'Gate 2', assignedZone: 'East Concourse', status: 'Busy', batteryLevel: 65, networkStrength: 'Moderate', lastSeen: '2 mins ago' },
  { id: 'DEV-003', name: 'Security Checkpoint A', type: 'Security', language: 'English', assignedGate: 'Gate 3', assignedZone: 'South Plaza', status: 'Online', batteryLevel: 88, networkStrength: 'Strong', lastSeen: 'Just now' },
  { id: 'DEV-004', name: 'Transport Coordinator', type: 'Transport', language: 'French', assignedGate: null, assignedZone: 'Perimeter Transit Hub', status: 'Online', batteryLevel: 45, networkStrength: 'Weak', lastSeen: '5 mins ago' },
  { id: 'DEV-005', name: 'Supervisor Terminal N', type: 'Supervisor', language: 'English', assignedGate: 'Gate 1', assignedZone: 'North Concourse', status: 'Online', batteryLevel: 100, networkStrength: 'Strong', lastSeen: 'Just now' },
  { id: 'DEV-006', name: 'Accessibility Support', type: 'Accessibility Team', language: 'English', assignedGate: 'Gate 4', assignedZone: 'West Concourse', status: 'Offline', batteryLevel: 0, networkStrength: 'Offline', lastSeen: '2 hours ago' },
];

export const demoCommands: OperationalCommand[] = [
  { id: 'CMD-1001', priority: 'High', category: 'Security', target: 'Gate 3', issuedBy: 'System AI', time: '18:15', deliveryStatus: 'Delivered', acknowledgementStatus: 'In Progress', isAIGenerated: true, expectedCompletionTime: '15 mins', message: 'Deploy additional bag check personnel to alleviate line congestion.' },
  { id: 'CMD-1002', priority: 'Critical', category: 'Medical', target: 'Medical Response 1', issuedBy: 'OpCenter-Admin', time: '18:22', deliveryStatus: 'Delivered', acknowledgementStatus: 'Acknowledged', isAIGenerated: false, expectedCompletionTime: '5 mins', message: 'Medical assistance required at Gate 2 immediate dispatch.' },
  { id: 'CMD-1003', priority: 'Medium', category: 'Transport', target: 'Transport Coordinator', issuedBy: 'System AI', time: '18:30', deliveryStatus: 'Sent', acknowledgementStatus: 'Pending', isAIGenerated: true, expectedCompletionTime: '30 mins', message: 'Route incoming shuttle buses to West Hub due to East traffic.' },
];
