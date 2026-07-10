import { create } from 'zustand';
import { demoData, demoDevices, demoCommands } from './demoData';

export interface StadiumData {
  timestamp: string;
  gate: string;
  crowd_count: number;
  incident_type: string | null;
  volunteers_available: number;
  language?: string;
  weather?: string;
  severity?: string;
  accessibility_issue?: string;
  medical_request?: string;
  security_alert?: string;
  transport_delay?: string;
  notes?: string;
  operator_name?: string;
  status?: string;
}

export interface StadiumConfiguration {
  stadiumName: string;
  hostCity: string;
  country: string;
  maxCapacity: number;
  gates: string[];
  emergencyExits: number;
  medicalStations: number;
  securityTeams: number;
  volunteerCapacity: number;
  parkingCapacity: number;
  vipSections: number;
  foodCourts: number;
  wheelchairAccessPoints: number;
  transitStops: number;
  emergencyAssemblyAreas: number;
}

export interface FieldDevice {
  id: string;
  name: string;
  type: 'Volunteer' | 'Security' | 'Medical' | 'Transport' | 'Maintenance' | 'Operations' | 'Supervisor' | 'Police' | 'Fire & Emergency' | 'Accessibility Team' | string;
  language: string;
  assignedGate: string | null;
  assignedZone: string | null;
  status: 'Online' | 'Offline' | 'Busy';
  batteryLevel: number;
  networkStrength: 'Strong' | 'Moderate' | 'Weak' | 'Offline';
  lastSeen: string;
}

export interface OperationalCommand {
  id: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  category: string;
  target: string;
  issuedBy: string;
  time: string;
  deliveryStatus: 'Queued' | 'Sent' | 'Delivered' | 'Failed';
  acknowledgementStatus: 'Pending' | 'Acknowledged' | 'In Progress' | 'Completed' | 'Archived';
  isAIGenerated: boolean;
  expectedCompletionTime: string;
  message: string;
}

interface AppState {
  data: StadiumData[];
  stadiumConfig: StadiumConfiguration;
  simulationSettings: {
    crowdMultiplier: number;
    volunteerMultiplier: number;
    weatherOverride: string | null;
    networkDegradation: number;
    batteryDrainRate: number;
    notificationVolume: number;
  };
  devices: FieldDevice[];
  commands: OperationalCommand[];
  setData: (data: StadiumData[]) => void;
  clearData: () => void;
  setStadiumConfig: (config: Partial<StadiumConfiguration>) => void;
  setSimulationSettings: (settings: Partial<AppState['simulationSettings']>) => void;
  addData: (row: StadiumData) => void;
  updateData: (index: number, row: StadiumData) => void;
  deleteData: (index: number) => void;
  getProcessedData: () => StadiumData[];
  
  // Field Operations
  addDevice: (device: FieldDevice) => void;
  updateDevice: (id: string, device: Partial<FieldDevice>) => void;
  deleteDevice: (id: string) => void;
  addCommand: (command: OperationalCommand) => void;
  updateCommandStatus: (id: string, delivery?: OperationalCommand['deliveryStatus'], ack?: OperationalCommand['acknowledgementStatus']) => void;
  getProcessedDevices: () => FieldDevice[];
}

export const useStore = create<AppState>((set, get) => ({
  data: demoData, // Pre-loaded World Cup demo dataset by default
  stadiumConfig: {
    stadiumName: 'New York/New Jersey Stadium',
    hostCity: 'New York/New Jersey',
    country: 'USA',
    maxCapacity: 82500,
    gates: ['Gate 1', 'Gate 2', 'Gate 3', 'Gate 4', 'Gate 5', 'Gate 6', 'Gate 7', 'Gate 8'],
    emergencyExits: 12,
    medicalStations: 4,
    securityTeams: 8,
    volunteerCapacity: 300,
    parkingCapacity: 15000,
    vipSections: 6,
    foodCourts: 10,
    wheelchairAccessPoints: 8,
    transitStops: 3,
    emergencyAssemblyAreas: 4
  },
  simulationSettings: {
    crowdMultiplier: 1.0,
    volunteerMultiplier: 1.0,
    weatherOverride: null,
    networkDegradation: 0,
    batteryDrainRate: 1.0,
    notificationVolume: 1.0,
  },
  devices: typeof demoDevices !== 'undefined' ? demoDevices : [],
  commands: typeof demoCommands !== 'undefined' ? demoCommands : [],
  setData: (data) => set({ data }),
  clearData: () => set({ data: [] }),
  addData: (row) => set((state) => ({ data: [row, ...state.data] })),
  updateData: (index, row) => set((state) => {
    const newData = [...state.data];
    newData[index] = row;
    return { data: newData };
  }),
  deleteData: (index) => set((state) => ({ data: state.data.filter((_, i) => i !== index) })),
  setStadiumConfig: (config) =>
    set((state) => ({
      stadiumConfig: { ...state.stadiumConfig, ...config },
    })),
  setSimulationSettings: (settings) =>
    set((state) => ({
      simulationSettings: { ...state.simulationSettings, ...settings },
    })),
  getProcessedData: () => {
    const { data, simulationSettings } = get();
    return data.map((row) => ({
      ...row,
      crowd_count: Math.round(row.crowd_count * simulationSettings.crowdMultiplier),
      volunteers_available: Math.round(row.volunteers_available * simulationSettings.volunteerMultiplier),
      weather: simulationSettings.weatherOverride || row.weather,
    }));
  },
  addDevice: (device) => set((state) => ({ devices: [device, ...state.devices] })),
  updateDevice: (id, updates) => set((state) => ({
    devices: state.devices.map(d => d.id === id ? { ...d, ...updates } : d)
  })),
  deleteDevice: (id) => set((state) => ({
    devices: state.devices.filter(d => d.id !== id)
  })),
  addCommand: (command) => set((state) => ({ commands: [command, ...state.commands] })),
  updateCommandStatus: (id, delivery, ack) => set((state) => ({
    commands: state.commands.map(c => c.id === id ? {
      ...c,
      deliveryStatus: delivery || c.deliveryStatus,
      acknowledgementStatus: ack || c.acknowledgementStatus
    } : c)
  })),
  getProcessedDevices: () => {
    const { devices, simulationSettings } = get();
    return devices.map(d => {
      // Simulate battery drain and network degradation
      let battery = d.batteryLevel - (simulationSettings.batteryDrainRate * 5); // Just a simple offset for simulation purposes
      if (battery < 0) battery = 0;
      
      let network = d.networkStrength;
      if (simulationSettings.networkDegradation > 0.5 && network === 'Strong') network = 'Moderate';
      if (simulationSettings.networkDegradation > 0.8 && network === 'Moderate') network = 'Weak';
      if (battery === 0) network = 'Offline';

      return {
        ...d,
        batteryLevel: Math.round(battery),
        networkStrength: network,
        status: battery === 0 ? 'Offline' : d.status
      };
    });
  },
}));
