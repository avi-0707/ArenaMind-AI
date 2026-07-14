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

export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  type: 'System' | 'User' | 'AI' | 'Alert' | 'Simulation';
  metadata?: any;
}

export interface NotificationEvent {
  id: string;
  time: string;
  title: string;
  message: string;
  type: 'Critical' | 'Warning' | 'Information' | 'AI Generated';
  read: boolean;
}

export interface PredictionForecast {
  id: string;
  title: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  probability: number;
  confidence: number;
  expectedTimeMinutes: number;
  affectedGates: string[];
  operationalImpact: string;
  suggestedAction: string;
  reasoning: string;
}

export interface ActiveScenario {
  id: string;
  name: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  startTime: string;
  impactModifiers: {
    crowdMultiplier: number;
    volunteerMultiplier: number;
    networkDegradation: number;
  };
}

export interface HistoricalMatch {
  id: string;
  date: string;
  scenarioName: string | null;
  severity: string | null;
  peakCrowd: number;
  totalIncidents: number;
  resolutionTimeMinutes: number;
  aiRecommendationSuccessRate: number;
  operationalOutcome: 'Excellent' | 'Good' | 'Needs Improvement' | 'Critical Failure';
  lessonsLearned: string[];
}

export interface LearningMetrics {
  predictionAccuracy: number;
  operationalEfficiency: number;
  averageRecoveryTime: number;
  incidentResolutionRate: number;
  falsePositiveRate: number;
  matchesAnalyzed: number;
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
  timeline: TimelineEvent[];
  activeScenario: ActiveScenario | null;
  predictions: PredictionForecast[];
  
  // Tournament Intelligence Engine
  historicalMatches: HistoricalMatch[];
  learningMetrics: LearningMetrics;
  readinessScore: number;

  // Notifications
  notifications: NotificationEvent[];
  
  setData: (data: StadiumData[]) => void;
  clearData: () => void;
  setStadiumConfig: (config: Partial<StadiumConfiguration>) => void;
  setSimulationSettings: (settings: Partial<AppState['simulationSettings']>) => void;
  addData: (row: StadiumData) => void;
  updateData: (index: number, row: StadiumData) => void;
  deleteData: (index: number) => void;
  getProcessedData: () => StadiumData[];
  
  // Digital Twin Engine
  triggerScenario: (scenarioName: string, severity: ActiveScenario['severity']) => void;
  stopScenario: () => void;
  calculatePredictions: () => void;
  
  // Tournament Memory Engine
  archiveSimulation: () => void;
  calculateReadinessScore: () => void;
  getEvolvingConfidence: (baseConfidence: number, scenarioName?: string) => number;
  
  // Field Operations
  addDevice: (device: FieldDevice) => void;
  updateDevice: (id: string, device: Partial<FieldDevice>) => void;
  deleteDevice: (id: string) => void;
  addCommand: (command: OperationalCommand) => void;
  updateCommandStatus: (id: string, delivery?: OperationalCommand['deliveryStatus'], ack?: OperationalCommand['acknowledgementStatus']) => void;
  getProcessedDevices: () => FieldDevice[];
  addTimelineEvent: (event: Omit<TimelineEvent, 'id' | 'time'>) => void;
  addNotification: (event: Omit<NotificationEvent, 'id' | 'time' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
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
  timeline: [],
  notifications: [],
  activeScenario: null,
  predictions: [],
  historicalMatches: [
    {
      id: 'match-1',
      date: '2026-06-12',
      scenarioName: 'Heavy Rain',
      severity: 'Medium',
      peakCrowd: 78000,
      totalIncidents: 14,
      resolutionTimeMinutes: 18,
      aiRecommendationSuccessRate: 85,
      operationalOutcome: 'Good',
      lessonsLearned: ['Early transport redirection mitigated 40% of Gate B congestion.', 'Volunteer medical teams were highly effective in Zone 2.']
    },
    {
      id: 'match-2',
      date: '2026-06-14',
      scenarioName: null,
      severity: null,
      peakCrowd: 81500,
      totalIncidents: 4,
      resolutionTimeMinutes: 5,
      aiRecommendationSuccessRate: 92,
      operationalOutcome: 'Excellent',
      lessonsLearned: ['Baseline volunteer deployment matched standard operating procedure flawlessly.']
    },
    {
      id: 'match-3',
      date: '2026-06-16',
      scenarioName: 'Suspicious Object',
      severity: 'High',
      peakCrowd: 79000,
      totalIncidents: 8,
      resolutionTimeMinutes: 24,
      aiRecommendationSuccessRate: 78,
      operationalOutcome: 'Needs Improvement',
      lessonsLearned: ['Communication lag between Zone A and Command Center led to 4-minute delay.', 'Need aggressive containment strategies for Sector 4.']
    }
  ],
  learningMetrics: {
    predictionAccuracy: 88.4,
    operationalEfficiency: 91.2,
    averageRecoveryTime: 15.6,
    incidentResolutionRate: 94.5,
    falsePositiveRate: 4.2,
    matchesAnalyzed: 3
  },
  readinessScore: 82,
  setData: (data) => set((state) => {
    state.addTimelineEvent({
      title: 'Dataset Uploaded',
      description: `Loaded ${data.length} records into the operations center.`,
      type: 'User'
    });
    // Trigger prediction recalculation
    setTimeout(() => { get().calculatePredictions(); get().calculateReadinessScore(); }, 100);
    return { data };
  }),
  clearData: () => set({ data: [] }),
  addData: (row) => set((state) => {
    state.addTimelineEvent({
      title: 'Manual Record Added',
      description: `Added operations record for ${row.gate}.`,
      type: 'User',
      metadata: { gate: row.gate, crowd: row.crowd_count }
    });
    return { data: [row, ...state.data] };
  }),
  updateData: (index, row) => set((state) => {
    state.addTimelineEvent({
      title: 'Record Updated',
      description: `Updated operations record for ${row.gate}.`,
      type: 'User',
      metadata: { gate: row.gate }
    });
    const newData = [...state.data];
    newData[index] = row;
    return { data: newData };
  }),
  deleteData: (index) => set((state) => ({ data: state.data.filter((_, i) => i !== index) })),
  setStadiumConfig: (config) =>
    set((state) => {
      state.addTimelineEvent({
        title: 'Stadium Configuration Updated',
        description: `Modified stadium parameters.`,
        type: 'User'
      });
      setTimeout(() => { get().calculatePredictions(); get().calculateReadinessScore(); }, 100);
      return {
        stadiumConfig: { ...state.stadiumConfig, ...config },
      };
    }),
  setSimulationSettings: (settings) =>
    set((state) => {
      state.addTimelineEvent({
        title: 'Simulation Settings Changed',
        description: `Applied new simulation parameters.`,
        type: 'Simulation'
      });
      return {
        simulationSettings: { ...state.simulationSettings, ...settings },
      };
    }),
  getProcessedData: () => {
    const { data, simulationSettings, activeScenario } = get();
    return data.map((row) => {
      const scenarioCrowdMod = activeScenario?.impactModifiers.crowdMultiplier || 1;
      const scenarioVolMod = activeScenario?.impactModifiers.volunteerMultiplier || 1;
      
      return {
        ...row,
        crowd_count: Math.round(row.crowd_count * simulationSettings.crowdMultiplier * scenarioCrowdMod),
        volunteers_available: Math.round(row.volunteers_available * simulationSettings.volunteerMultiplier * scenarioVolMod),
        weather: activeScenario?.name === 'Heavy Rain' ? 'Heavy Rain' : (simulationSettings.weatherOverride || row.weather),
      };
    });
  },
  addDevice: (device) => set((state) => {
    state.addTimelineEvent({
      title: 'Device Registered',
      description: `${device.name} (${device.type}) came online.`,
      type: 'System'
    });
    return { devices: [device, ...state.devices] };
  }),
  updateDevice: (id, updates) => set((state) => {
    const device = state.devices.find(d => d.id === id);
    if (device && updates.status) {
      state.addTimelineEvent({
        title: 'Device Status Changed',
        description: `${device.name} is now ${updates.status}.`,
        type: 'System'
      });
    }
    return {
      devices: state.devices.map(d => d.id === id ? { ...d, ...updates } : d)
    };
  }),
  deleteDevice: (id) => set((state) => {
    const device = state.devices.find(d => d.id === id);
    if (device) {
      state.addTimelineEvent({
        title: 'Device Deregistered',
        description: `${device.name} was removed from the network.`,
        type: 'System'
      });
    }
    return {
      devices: state.devices.filter(d => d.id !== id)
    };
  }),
  addCommand: (command) => set((state) => {
    state.addTimelineEvent({
      title: 'Command Dispatched',
      description: `Target: ${command.target} - ${command.message}`,
      type: 'Alert'
    });
    return { commands: [command, ...state.commands] };
  }),
  updateCommandStatus: (id, delivery, ack) => set((state) => {
    const command = state.commands.find(c => c.id === id);
    if (command && ack && ack !== command.acknowledgementStatus) {
      state.addTimelineEvent({
        title: 'Command Status Update',
        description: `Command to ${command.target} is now ${ack}.`,
        type: 'System'
      });
    }
    return {
      commands: state.commands.map(c => c.id === id ? {
        ...c,
        deliveryStatus: delivery || c.deliveryStatus,
        acknowledgementStatus: ack || c.acknowledgementStatus
      } : c)
    };
  }),
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
  addTimelineEvent: (event) => set((state) => {
    const newEvent: TimelineEvent = {
      ...event,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    return { timeline: [newEvent, ...state.timeline] };
  }),
  triggerScenario: (scenarioName, severity) => set((state) => {
    // Generate impact modifiers based on scenario
    let crowdMod = 1.0;
    let volMod = 1.0;
    let netDegradation = 0;
    
    if (scenarioName === 'Heavy Rain') { volMod = 0.7; crowdMod = 1.2; netDegradation = 0.3; }
    if (scenarioName === 'Medical Emergency') { volMod = 0.8; }
    if (scenarioName === 'Gate Closure') { crowdMod = 1.4; }
    if (scenarioName === 'Suspicious Object') { crowdMod = 1.5; volMod = 0.5; }
    if (scenarioName === 'Power Failure') { netDegradation = 0.9; volMod = 0.6; }
    if (scenarioName === 'Transport Delay') { crowdMod = 1.3; }
    if (scenarioName === 'VIP Movement') { crowdMod = 1.1; volMod = 0.9; }

    if (severity === 'Critical') { crowdMod *= 1.2; volMod *= 0.8; }
    else if (severity === 'Low') { crowdMod *= 1.05; volMod *= 0.95; }

    const newScenario: ActiveScenario = {
      id: Math.random().toString(36).substring(2, 9),
      name: scenarioName,
      severity,
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      impactModifiers: {
        crowdMultiplier: crowdMod,
        volunteerMultiplier: volMod,
        networkDegradation: netDegradation
      }
    };

    state.addTimelineEvent({
      title: 'Crisis Simulation Activated',
      description: `Scenario: ${scenarioName} (${severity}). Initializing Digital Twin impact models.`,
      type: 'Simulation'
    });

    setTimeout(() => get().calculatePredictions(), 500);

    return { activeScenario: newScenario };
  }),
  stopScenario: () => set((state) => {
    if (state.activeScenario) {
      state.addTimelineEvent({
        title: 'Simulation Terminated',
        description: `Ended scenario: ${state.activeScenario.name}. Stadium parameters normalizing.`,
        type: 'Simulation'
      });
    }
    setTimeout(() => get().calculatePredictions(), 500);
    return { activeScenario: null };
  }),
  calculatePredictions: () => set((state) => {
    // Digital Twin Predictive Intelligence Engine
    const processedData = get().getProcessedData();
    if (processedData.length === 0) return { predictions: [] };

    const predictions: PredictionForecast[] = [];
    
    // Evaluate Data for AI Predictions
    let totalCrowd = 0;
    let totalVol = 0;
    let highRiskGates: string[] = [];

    processedData.forEach(d => {
      totalCrowd += d.crowd_count;
      totalVol += d.volunteers_available;
      if (d.crowd_count > 10000) highRiskGates.push(d.gate);
    });

    // 1. Congestion Prediction
    if (totalCrowd > 50000 || state.activeScenario?.name === 'Gate Closure') {
      predictions.push({
        id: 'pred-1',
        title: 'Critical Congestion',
        riskLevel: 'High',
        probability: 91,
        confidence: 93,
        expectedTimeMinutes: 14,
        affectedGates: highRiskGates.length > 0 ? highRiskGates : ['Gate A', 'Gate C'],
        operationalImpact: 'Severe delays and crowd crush risks.',
        suggestedAction: 'Deploy 5 Volunteers & Redirect Transport',
        reasoning: `Crowd density is trending +12% above capacity limits due to ${state.activeScenario?.name || 'volume'}.`
      });
    }

    // 2. Medical Prediction
    if (state.activeScenario?.name === 'Heavy Rain' || (totalCrowd / (totalVol || 1)) > 300) {
      predictions.push({
        id: 'pred-2',
        title: 'Medical Incident Spike',
        riskLevel: 'Medium',
        probability: 78,
        confidence: get().getEvolvingConfidence(85, 'Heavy Rain'),
        expectedTimeMinutes: 22,
        affectedGates: ['Gate B', 'Food Court'],
        operationalImpact: 'Medical response time will exceed 5 mins.',
        suggestedAction: 'Stage EMS at Gate B',
        reasoning: 'Reduced volunteer coverage coupled with high foot traffic creates delayed intervention windows. History shows Heavy Rain increases slip/fall incidents by 34%.'
      });
    }

    // 3. Scenario specific prediction
    if (state.activeScenario) {
       predictions.push({
        id: 'pred-3',
        title: `${state.activeScenario.name} Cascading Impact`,
        riskLevel: state.activeScenario.severity === 'Critical' ? 'Critical' : 'High',
        probability: 96,
        confidence: get().getEvolvingConfidence(90, state.activeScenario.name),
        expectedTimeMinutes: 5,
        affectedGates: ['All Gates'],
        operationalImpact: 'System-wide operational slowdown.',
        suggestedAction: 'Activate Emergency Protocols',
        reasoning: 'Simulation parameters indicate an imminent chain reaction across Transport and Security.'
      });
    }

    // Auto-Notification for Critical/High
    // Avoid spamming the timeline, only add if it's a new major prediction
    // We'll skip adding timeline events for every calculation, just do it for critical ones
    // if we wanted to build a robust notification system.
    // Actually, we can just push a timeline event for the highest risk one:

    if (predictions.length > 0) {
      const highestRisk = predictions.sort((a,b) => b.probability - a.probability)[0];
      if (highestRisk.probability > 90) {
         state.addTimelineEvent({
           title: 'AI Prediction Generated',
           description: `${highestRisk.title}: ${highestRisk.suggestedAction}`,
           type: 'AI'
         });
      }
    }

    return { predictions };
  }),
  
  archiveSimulation: () => set((state) => {
    // Generate an outcome based on active scenario and current metrics
    const crowdAvg = state.data.reduce((acc, curr) => acc + curr.crowd_count, 0) / Math.max(1, state.data.length);
    const hasActiveScenario = !!state.activeScenario;
    const severity = state.activeScenario?.severity || 'None';
    
    // Algorithm to determine outcome quality
    let outcome: HistoricalMatch['operationalOutcome'] = 'Good';
    let resolutionTime = 15;
    let aiSuccess = 88;
    
    if (severity === 'Critical') { outcome = 'Needs Improvement'; resolutionTime = 32; aiSuccess = 72; }
    else if (severity === 'High') { outcome = 'Good'; resolutionTime = 22; aiSuccess = 84; }
    else if (severity === 'Low' || !hasActiveScenario) { outcome = 'Excellent'; resolutionTime = 8; aiSuccess = 96; }

    const newMatch: HistoricalMatch = {
      id: `match-${state.historicalMatches.length + 1}`,
      date: new Date().toISOString().split('T')[0],
      scenarioName: state.activeScenario?.name || 'Normal Operations',
      severity: state.activeScenario?.severity || 'Low',
      peakCrowd: Math.round(crowdAvg * state.simulationSettings.crowdMultiplier * state.data.length),
      totalIncidents: hasActiveScenario ? Math.floor(Math.random() * 10) + 5 : Math.floor(Math.random() * 3),
      resolutionTimeMinutes: resolutionTime,
      aiRecommendationSuccessRate: aiSuccess,
      operationalOutcome: outcome,
      lessonsLearned: hasActiveScenario 
        ? [`ArenaMind learned new containment patterns for ${state.activeScenario?.name}.`, 'Adjusted volunteer routing algorithms based on recovery lag.'] 
        : ['Baseline match completed successfully with standard parameters.']
    };

    const newMetrics = {
      predictionAccuracy: Math.min(99.9, state.learningMetrics.predictionAccuracy + (aiSuccess > 90 ? 0.3 : -0.1)),
      operationalEfficiency: Math.min(99.9, state.learningMetrics.operationalEfficiency + (outcome === 'Excellent' ? 0.5 : -0.2)),
      averageRecoveryTime: Math.max(5.0, state.learningMetrics.averageRecoveryTime * 0.95), // slowly improving
      incidentResolutionRate: Math.min(99.9, state.learningMetrics.incidentResolutionRate + 0.2),
      falsePositiveRate: Math.max(0.5, state.learningMetrics.falsePositiveRate - 0.1),
      matchesAnalyzed: state.learningMetrics.matchesAnalyzed + 1
    };

    state.addTimelineEvent({
      title: 'Simulation Archived to Tournament Memory',
      description: `Match analysis complete. ArenaMind learned ${newMatch.lessonsLearned.length} new operational patterns.`,
      type: 'AI'
    });

    return { 
      historicalMatches: [newMatch, ...state.historicalMatches],
      learningMetrics: newMetrics,
      activeScenario: null
    };
  }),
  
  getEvolvingConfidence: (baseConfidence, scenarioName) => {
    const { historicalMatches } = get();
    // If the AI has seen this scenario before, boost confidence slightly
    let confidenceBoost = 0;
    if (scenarioName) {
      const pastOccurrences = historicalMatches.filter(m => m.scenarioName === scenarioName).length;
      confidenceBoost = Math.min(10, pastOccurrences * 2.5); // Max +10% boost
    }
    // Also boost globally based on total matches analyzed
    const globalBoost = Math.min(5, historicalMatches.length * 0.5);
    
    return Math.min(99, Math.round(baseConfidence + confidenceBoost + globalBoost));
  },
  
  calculateReadinessScore: () => set((state) => {
    // A dynamic score representing how "ready" the stadium is for an event
    // Based on volunteer ratio, network degradation, historical efficiency, and active scenarios
    let score = 100;
    
    // Penalize for bad ratios
    const { data, simulationSettings, learningMetrics, activeScenario } = state;
    if (data.length > 0) {
      const avgVolRatio = data.reduce((acc, curr) => acc + (curr.crowd_count / Math.max(1, curr.volunteers_available)), 0) / data.length;
      const trueRatio = avgVolRatio * (simulationSettings.crowdMultiplier / simulationSettings.volunteerMultiplier);
      if (trueRatio > 500) score -= 15;
      else if (trueRatio > 250) score -= 5;
    }

    if (simulationSettings.networkDegradation > 0.3) score -= 10;
    if (activeScenario) {
      if (activeScenario.severity === 'Critical') score -= 30;
      if (activeScenario.severity === 'High') score -= 15;
      if (activeScenario.severity === 'Medium') score -= 5;
    }

    // Boost score via historical operational efficiency (AI Learning)
    const learningBoost = (learningMetrics.operationalEfficiency - 85) * 0.5; 
    score += learningBoost;

    return { readinessScore: Math.max(0, Math.min(100, Math.round(score))) };
  }),
  
  // Notification Methods
  addNotification: (event) => set((state) => {
    const newNotif = {
      ...event,
      id: crypto.randomUUID(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };
    return { notifications: [newNotif, ...state.notifications] };
  }),
  
  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
  })),
  
  clearAllNotifications: () => set(() => ({ notifications: [] }))
}));
