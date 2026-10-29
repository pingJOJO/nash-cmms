import { 
  WorkOrder, 
  Asset, 
  PreventiveMaintenance, 
  Part, 
  Location, 
  MaintenanceRequest, 
  Meter, 
  UserMember, 
  Vendor,
  SystemSettings 
} from '../types/cmms';

export const INITIAL_WORK_ORDERS: WorkOrder[] = [
  {
    id: 'WO000001',
    title: 'Fix leaking pipe near central riser',
    description: 'A pipe is leaking in the main building basement near the central water riser valve manifold.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    locationName: 'Main Building',
    locationAddress: '100 Innovation Way, Suite 100',
    assetId: 'AST-001',
    assetName: 'HVAC-001',
    assetStatus: 'OPERATIONAL',
    dueDate: '2026-09-11 12:00',
    expectedStartDate: '2026-09-10 08:00',
    estimatedDurationHours: 3.0,
    category: 'Plumbing',
    assignedToId: 'USR-001',
    assignedToName: 'Omar Dabobash',
    assignedToAvatar: 'O',
    createdById: 'USR-001',
    createdByName: 'Omar Dabobash',
    createdAt: '09/10/26 08:14',
    updatedAt: '09/10/26 08:45',
    requiresSignature: true,
    tasks: [
      { id: 'T1', title: 'Shut off isolation valve B2', completed: true },
      { id: 'T2', title: 'Drain residual pressure from manifold', completed: true },
      { id: 'T3', title: 'Replace corroded brass joint fitting', completed: false },
      { id: 'T4', title: 'Perform 15-minute pressure test at 60 PSI', completed: false }
    ],
    labors: [
      {
        id: 'L1',
        workerName: 'Omar Dabobash',
        hours: 1.25,
        hourlyRate: 45,
        date: '09/10/26',
        description: 'Line isolation and replacement joint installation'
      }
    ],
    additionalCosts: [
      {
        id: 'AC1',
        description: 'Emergency plumber callout fee',
        amount: 85.00,
        category: 'Contractor',
        date: '09/10/26'
      }
    ],
    parts: [
      {
        id: 'P1',
        partId: 'PRT-004',
        partName: '2-inch Brass Coupling',
        quantity: 2,
        unitCost: 12.50
      }
    ],
    comments: [
      {
        id: 'C1',
        authorName: 'Omar Dabobash',
        text: 'Water supply shut off to sector. Work underway.',
        createdAt: '09/10/26 08:35'
      }
    ]
  },
  {
    id: 'WO000002',
    title: 'Replace air filter in HVAC-001',
    description: 'Replace the air filter in HVAC-001 according to quarterly maintenance guidelines.',
    status: 'ON_HOLD',
    priority: 'LOW',
    locationName: 'Warehouse A',
    locationAddress: '742 Evergreen Terrace, Sector 4',
    assetId: 'AST-001',
    assetName: 'HVAC-001',
    assetStatus: 'DOWN',
    dueDate: '2026-09-18 17:00',
    expectedStartDate: '2026-09-12 09:00',
    estimatedDurationHours: 1.5,
    category: 'HVAC',
    assignedToId: 'USR-001',
    assignedToName: 'Omar Dabobash',
    assignedToAvatar: 'O',
    createdById: 'USR-001',
    createdByName: 'Omar Dabobash',
    createdAt: '09/10/26 08:14',
    updatedAt: '09/10/26 08:30',
    requiresSignature: false,
    tasks: [
      { id: 'T1', title: 'Power down HVAC-001 unit safely', completed: true },
      { id: 'T2', title: 'Remove front access panel and extract old pleated filter', completed: false },
      { id: 'T3', title: 'Inspect condenser coils for dust build-up', completed: false },
      { id: 'T4', title: 'Install new MERV-13 filter and restore power', completed: false }
    ],
    labors: [
      {
        id: 'L1',
        workerName: 'Omar Dabobash',
        hours: 0.5,
        hourlyRate: 45,
        date: '09/10/26',
        description: 'Initial unit diagnostic and filter sizing'
      }
    ],
    additionalCosts: [],
    parts: [
      {
        id: 'P1',
        partId: 'PRT-001',
        partName: 'Air Filter (MERV-13)',
        quantity: 1,
        unitCost: 15.99
      }
    ],
    comments: [
      {
        id: 'C1',
        authorName: 'Omar Dabobash',
        text: 'Waiting for replacement filter delivery from supplier. Unit placed on hold temporarily.',
        createdAt: '09/10/26 08:25'
      }
    ]
  },
  {
    id: 'WO000003',
    title: 'Emergency Generator 500kVA Load Test',
    description: 'Perform monthly scheduled 30-minute load bank test on backup generator GEN-001.',
    status: 'OPEN',
    priority: 'MEDIUM',
    locationName: 'Production Floor',
    locationAddress: 'Plant 2, North Yard',
    assetId: 'AST-003',
    assetName: 'GEN-001',
    assetStatus: 'EMERGENCY_SHUTDOWN',
    dueDate: '2026-09-15 16:00',
    expectedStartDate: '2026-09-15 14:00',
    estimatedDurationHours: 2.0,
    category: 'Electrical',
    assignedToId: 'USR-002',
    assignedToName: 'Sarah Connor',
    assignedToAvatar: 'S',
    createdById: 'USR-001',
    createdByName: 'Omar Dabobash',
    createdAt: '09/10/26 09:00',
    updatedAt: '09/10/26 09:00',
    requiresSignature: false,
    tasks: [
      { id: 'T1', title: 'Verify coolant and oil levels before crank', completed: false },
      { id: 'T2', title: 'Inspect transfer switch contacts and interlocks', completed: false },
      { id: 'T3', title: 'Record output voltage, frequency (60Hz), and oil pressure at 15 min', completed: false }
    ],
    labors: [],
    additionalCosts: [],
    parts: [],
    comments: []
  },
  {
    id: 'WO000004',
    title: 'Server Room CRAC Unit B Compressor Tripped',
    description: 'High discharge pressure alarm triggered on Liebert CRAC-01. Data Center room temp elevated to 78°F.',
    status: 'IN_PROGRESS',
    priority: 'CRITICAL',
    locationName: 'Data Center Annex',
    locationAddress: 'Floor 2, Clean Room 102',
    assetId: 'AST-006',
    assetName: 'CRAC-01',
    assetStatus: 'DOWN',
    dueDate: '2026-09-10 11:30',
    expectedStartDate: '2026-09-10 09:15',
    estimatedDurationHours: 2.5,
    category: 'HVAC',
    assignedToId: 'USR-001',
    assignedToName: 'Omar Dabobash',
    assignedToAvatar: 'O',
    createdById: 'USR-004',
    createdByName: 'Elena Rostova',
    createdAt: '09/10/26 09:10',
    updatedAt: '09/10/26 09:20',
    requiresSignature: true,
    tasks: [
      { id: 'T1', title: 'Engage portable spot cooling backup units', completed: true },
      { id: 'T2', title: 'Check condenser fan motor contactor and fuses', completed: true },
      { id: 'T3', title: 'Inspect R410A suction and liquid line pressures with digital manifold', completed: false },
      { id: 'T4', title: 'Reset high pressure cutout and test compressor restart', completed: false }
    ],
    labors: [
      {
        id: 'L1',
        workerName: 'Omar Dabobash',
        hours: 0.75,
        hourlyRate: 45,
        date: '09/10/26',
        description: 'Disaster recovery spot cooler deployment and circuit testing'
      }
    ],
    additionalCosts: [],
    parts: [
      {
        id: 'P1',
        partId: 'PRT-003',
        partName: 'Fuse 2A (Fast-Blow Ceramic)',
        quantity: 2,
        unitCost: 2.99
      },
      {
        id: 'P2',
        partId: 'PRT-008',
        partName: 'Contactor 3-Pole 40A 24V Coil',
        quantity: 1,
        unitCost: 68.20
      }
    ],
    comments: [
      {
        id: 'C1',
        authorName: 'Elena Rostova',
        text: 'Critical: Secondary failover redundant unit has taken over 60% load. Need primary CRAC online ASAP.',
        createdAt: '09/10/26 09:12'
      }
    ]
  },
  {
    id: 'WO000005',
    title: 'Hydraulic Stamping Press Seal Leakage & Pressure Drop',
    description: 'Komatsu 200-Ton press hydraulic cylinder showing oil seepage around rod gland seal. System pressure dropping from 2800 PSI to 2100 PSI.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    locationName: 'Production Floor',
    locationAddress: 'Plant 2, Stamping Bay A-4',
    assetId: 'AST-005',
    assetName: 'PRESS-01',
    assetStatus: 'DOWN',
    dueDate: '2026-09-12 18:00',
    expectedStartDate: '2026-09-11 08:00',
    estimatedDurationHours: 4.5,
    category: 'Mechanical',
    assignedToId: 'USR-005',
    assignedToName: 'Marcus Vance',
    assignedToAvatar: 'M',
    createdById: 'USR-001',
    createdByName: 'Omar Dabobash',
    createdAt: '09/10/26 07:30',
    updatedAt: '09/10/26 08:00',
    requiresSignature: true,
    tasks: [
      { id: 'T1', title: 'Lockout/Tagout (LOTO) hydraulic power unit and mechanical safety blocks', completed: true },
      { id: 'T2', title: 'De-pressurize accumulator bank completely', completed: true },
      { id: 'T3', title: 'Disassemble cylinder front head and extract worn Viton rod seal', completed: false },
      { id: 'T4', title: 'Hone chrome cylinder rod and install new seal kit', completed: false },
      { id: 'T5', title: 'Re-torque head bolts to 320 ft-lbs and perform pressure calibration', completed: false }
    ],
    labors: [
      {
        id: 'L1',
        workerName: 'Marcus Vance',
        hours: 2.0,
        hourlyRate: 50,
        date: '09/10/26',
        description: 'LOTO execution, accumulator bleeding, and cylinder front disassembly'
      }
    ],
    additionalCosts: [
      {
        id: 'AC1',
        description: 'High-tonnage hydraulic torque wrench rental',
        amount: 140.00,
        category: 'Tool Rental',
        date: '09/10/26'
      }
    ],
    parts: [
      {
        id: 'P1',
        partId: 'PRT-004',
        partName: 'Hydraulic O-Ring & Rod Seal Kit (Viton 75D)',
        quantity: 1,
        unitCost: 42.50
      },
      {
        id: 'P2',
        partId: 'PRT-009',
        partName: 'High-Pressure Hydraulic Hose 1/2in 4000 PSI',
        quantity: 1,
        unitCost: 54.00
      }
    ],
    comments: [
      {
        id: 'C1',
        authorName: 'Marcus Vance',
        text: 'Old rod seal was severely hardened from thermal cycles. New Viton 75D kit staged.',
        createdAt: '09/10/26 08:15'
      }
    ]
  },
  {
    id: 'WO000006',
    title: 'Conveyor 3 Drive Motor Bearing Vibration Anomaly',
    description: 'Vibration sensor on drive motor M-03 reporting 6.8 mm/s RMS (exceeds ISO warning threshold 4.5 mm/s). High pitched whine audible on line.',
    status: 'ON_HOLD',
    priority: 'HIGH',
    locationName: 'Production Floor',
    locationAddress: 'Packaging Line 3',
    assetId: 'AST-008',
    assetName: 'CONV-03',
    assetStatus: 'DOWN',
    dueDate: '2026-09-14 16:00',
    expectedStartDate: '2026-09-13 14:00',
    estimatedDurationHours: 2.0,
    category: 'Mechanical',
    assignedToId: 'USR-005',
    assignedToName: 'Marcus Vance',
    assignedToAvatar: 'M',
    createdById: 'USR-001',
    createdByName: 'Omar Dabobash',
    createdAt: '09/09/26 15:40',
    updatedAt: '09/10/26 08:10',
    requiresSignature: false,
    tasks: [
      { id: 'T1', title: 'Perform vibration spectrum analysis (FFT) to confirm outer race defect', completed: true },
      { id: 'T2', title: 'Uncouple motor from gearbox and pull drive sprocket', completed: false },
      { id: 'T3', title: 'Press out old bearings and mount new SKF 6205-2RSH bearings', completed: false },
      { id: 'T4', title: 'Perform laser shaft alignment (within 0.05 mm tolerance)', completed: false }
    ],
    labors: [
      {
        id: 'L1',
        workerName: 'Marcus Vance',
        hours: 1.0,
        hourlyRate: 50,
        date: '09/09/26',
        description: 'Vibration telemetry logging and acoustic measurement'
      }
    ],
    additionalCosts: [],
    parts: [
      {
        id: 'P1',
        partId: 'PRT-006',
        partName: 'SKF 6205-2RSH Deep Groove Ball Bearing',
        quantity: 2,
        unitCost: 18.75
      }
    ],
    comments: [
      {
        id: 'C1',
        authorName: 'Marcus Vance',
        text: 'Awaiting scheduled line changeover window at 14:00 tomorrow to uncouple drive.',
        createdAt: '09/10/26 08:05'
      }
    ]
  },
  {
    id: 'WO000007',
    title: 'Forklift FL-04 Brake Inspection & Hydraulic Fluid Flush',
    description: 'Routine 250-hour service for Toyota electric forklift FL-04. Service brakes spongy, mast cylinders due for fluid flush.',
    status: 'COMPLETED',
    priority: 'MEDIUM',
    locationName: 'Warehouse A',
    locationAddress: 'Fleet Maintenance Bay',
    assetId: 'AST-002',
    assetName: 'TRUCK-01',
    assetStatus: 'OPERATIONAL',
    dueDate: '2026-09-08 17:00',
    expectedStartDate: '2026-09-08 09:00',
    estimatedDurationHours: 3.5,
    category: 'Fleet',
    assignedToId: 'USR-003',
    assignedToName: 'Alex Chen',
    assignedToAvatar: 'A',
    createdById: 'USR-001',
    createdByName: 'Omar Dabobash',
    createdAt: '09/07/26 11:20',
    updatedAt: '09/08/26 16:30',
    requiresSignature: true,
    tasks: [
      { id: 'T1', title: 'Check brake shoe wear and adjust parking cable tension', completed: true },
      { id: 'T2', title: 'Drain hydraulic tank and replace return line filter', completed: true },
      { id: 'T3', title: 'Refill with 8 gallons of ISO 46 hydraulic fluid', completed: true },
      { id: 'T4', title: 'Conduct full mast lift and tilt load test (2,000 lbs test weight)', completed: true }
    ],
    labors: [
      {
        id: 'L1',
        workerName: 'Alex Chen',
        hours: 3.5,
        hourlyRate: 40,
        date: '09/08/26',
        description: 'Complete brake relining, fluid flush, and dynamic braking tests'
      }
    ],
    additionalCosts: [
      {
        id: 'AC1',
        description: 'Hazardous waste oil disposal manifest fee',
        amount: 35.00,
        category: 'Environmental',
        date: '09/08/26'
      }
    ],
    parts: [
      {
        id: 'P1',
        partId: 'PRT-005',
        partName: 'Synthetic Hydraulic Oil ISO VG 46 (5-Gal Pail)',
        quantity: 2,
        unitCost: 185.00
      }
    ],
    comments: [
      {
        id: 'C1',
        authorName: 'Alex Chen',
        text: 'Brake performance restored to OEM spec. Mast operates smoothly with zero cavitation noise.',
        createdAt: '09/08/26 16:25'
      }
    ]
  },
  {
    id: 'WO000008',
    title: 'Chiller Evaporator Descaling & Chemical Water Treatment',
    description: 'Perform monthly water chemistry sampling, biocide addition, and conductivity calibration on Trane 400-ton chiller loop.',
    status: 'OPEN',
    priority: 'MEDIUM',
    locationName: 'Main Building',
    locationAddress: 'Roof Chiller Penthouse',
    assetId: 'AST-007',
    assetName: 'CHILL-02',
    assetStatus: 'OPERATIONAL',
    dueDate: '2026-09-17 15:00',
    expectedStartDate: '2026-09-17 10:00',
    estimatedDurationHours: 3.0,
    category: 'HVAC',
    assignedToId: 'USR-001',
    assignedToName: 'Omar Dabobash',
    assignedToAvatar: 'O',
    createdById: 'USR-001',
    createdByName: 'Omar Dabobash',
    createdAt: '09/10/26 09:15',
    updatedAt: '09/10/26 09:15',
    requiresSignature: false,
    tasks: [
      { id: 'T1', title: 'Test closed loop water samples for pH (target 8.5-9.5) and TDS', completed: false },
      { id: 'T2', title: 'Inspect automated chemical dosing pump and injection quill', completed: false },
      { id: 'T3', title: 'Replenish corrosion inhibitor and non-oxidizing biocide', completed: false },
      { id: 'T4', title: 'Log evaporator approach temperature', completed: false }
    ],
    labors: [],
    additionalCosts: [],
    parts: [
      {
        id: 'P1',
        partId: 'PRT-011',
        partName: 'Industrial pH Buffer Calibration Solution',
        quantity: 1,
        unitCost: 28.50
      }
    ],
    comments: []
  },
  {
    id: 'WO000009',
    title: 'Emergency Lighting Battery Discharge 90-Min Safety Test',
    description: 'NFPA 101 Life Safety Code compliance test. Verify all 42 emergency exit signs and dual-head battery units illuminate for full 90 minutes.',
    status: 'COMPLETED',
    priority: 'LOW',
    locationName: 'Warehouse A',
    locationAddress: 'Sectors 1 through 6',
    assetId: 'AST-003',
    assetName: 'GEN-001',
    assetStatus: 'OPERATIONAL',
    dueDate: '2026-09-05 18:00',
    expectedStartDate: '2026-09-05 15:00',
    estimatedDurationHours: 2.0,
    category: 'Safety',
    assignedToId: 'USR-002',
    assignedToName: 'Sarah Connor',
    assignedToAvatar: 'S',
    createdById: 'USR-006',
    createdByName: 'David Miller',
    createdAt: '09/04/26 14:00',
    updatedAt: '09/05/26 17:30',
    requiresSignature: true,
    tasks: [
      { id: 'T1', title: 'Simulate AC power loss via circuit breaker panel LP-1B', completed: true },
      { id: 'T2', title: 'Inspect all 42 egress emergency lamps across warehouse floor', completed: true },
      { id: 'T3', title: 'Replace 2 failed sealed lead-acid 6V 4.5Ah battery packs', completed: true },
      { id: 'T4', title: 'Affix inspection compliance tags and sign safety binder', completed: true }
    ],
    labors: [
      {
        id: 'L1',
        workerName: 'Sarah Connor',
        hours: 2.0,
        hourlyRate: 52,
        date: '09/05/26',
        description: 'Complete egress audit, battery replacements, and safety logging'
      }
    ],
    additionalCosts: [],
    parts: [
      {
        id: 'P1',
        partId: 'PRT-003',
        partName: 'Fuse 2A (Fast-Blow Ceramic)',
        quantity: 4,
        unitCost: 2.99
      }
    ],
    comments: [
      {
        id: 'C1',
        authorName: 'Sarah Connor',
        text: 'All egress pathways fully certified and compliant for another 12 months.',
        createdAt: '09/05/26 17:20'
      }
    ]
  },
  {
    id: 'WO000010',
    title: 'Rotary Air Compressor Oil & Separator Filter Change',
    description: 'Atlas Copco GA-75 100 HP rotary screw compressor reached 4,000 running hours. Perform complete oil change, air/oil separator, and intake element replacement.',
    status: 'OPEN',
    priority: 'MEDIUM',
    locationName: 'Production Floor',
    locationAddress: 'Utility Compressor Room 1',
    assetId: 'AST-004',
    assetName: 'COMP-002',
    assetStatus: 'OPERATIONAL',
    dueDate: '2026-09-19 16:00',
    expectedStartDate: '2026-09-19 08:00',
    estimatedDurationHours: 3.0,
    category: 'Mechanical',
    assignedToId: 'USR-005',
    assignedToName: 'Marcus Vance',
    assignedToAvatar: 'M',
    createdById: 'USR-001',
    createdByName: 'Omar Dabobash',
    createdAt: '09/10/26 09:30',
    updatedAt: '09/10/26 09:30',
    requiresSignature: false,
    tasks: [
      { id: 'T1', title: 'Check differential pressure on separator element prior to shutdown', completed: false },
      { id: 'T2', title: 'Drain Roto-Inject fluid from sump and oil cooler', completed: false },
      { id: 'T3', title: 'Install new spin-on oil filter and internal separator cartridge', completed: false },
      { id: 'T4', title: 'Replace heavy-duty air intake filter cartridge', completed: false },
      { id: 'T5', title: 'Refill with 8 gallons synthetic compressor fluid and check for leaks', completed: false }
    ],
    labors: [],
    additionalCosts: [],
    parts: [
      {
        id: 'P1',
        partId: 'PRT-005',
        partName: 'Synthetic Compressor Oil ISO VG 46 (5-Gal Pail)',
        quantity: 2,
        unitCost: 185.00
      },
      {
        id: 'P2',
        partId: 'PRT-001',
        partName: 'Air Filter (MERV-13 Heavy Duty)',
        quantity: 1,
        unitCost: 15.99
      }
    ],
    comments: []
  }
];

export const INITIAL_ASSETS: Asset[] = [
  {
    id: 'AST-001',
    name: 'HVAC-001',
    status: 'DOWN',
    locationName: 'Warehouse A',
    area: 'Roof Section B',
    model: 'Carrier WeatherMaster 48HC',
    barcode: 'BC-99201',
    category: 'HVAC Unit',
    description: 'Central packaged rooftop HVAC unit servicing Warehouse A distribution bays with economizer.',
    primaryWorker: 'Omar Dabobash',
    createdAt: '09/01/26'
  },
  {
    id: 'AST-002',
    name: 'TRUCK-01',
    status: 'OPERATIONAL',
    locationName: 'Warehouse A',
    area: 'Fleet Maintenance Bay',
    model: 'Ford F-150 SuperDuty Service Bed',
    barcode: 'BC-88102',
    category: 'Vehicle',
    description: 'Facility response pickup truck equipped with crane hoist, welder, and emergency tool chests.',
    primaryWorker: 'Alex Chen',
    createdAt: '08/15/26'
  },
  {
    id: 'AST-003',
    name: 'GEN-001',
    status: 'EMERGENCY_SHUTDOWN',
    locationName: 'Production Floor',
    area: 'Auxiliary Power Shed',
    model: 'Caterpillar C15 500kVA Diesel Generator',
    barcode: 'BC-77304',
    category: 'Generator',
    description: 'Primary emergency standby generator for life safety egress, data center, and toxic exhaust scrubbers.',
    primaryWorker: 'Sarah Connor',
    createdAt: '07/20/26'
  },
  {
    id: 'AST-004',
    name: 'COMP-002',
    status: 'OPERATIONAL',
    locationName: 'Production Floor',
    area: 'Utility Compressor Room 1',
    model: 'Atlas Copco GA-75 VSD+ (100 HP)',
    barcode: 'BC-66405',
    category: 'Air Compressor',
    description: 'Variable speed drive rotary screw air compressor providing 125 PSI plant-wide pneumatic header.',
    primaryWorker: 'Marcus Vance',
    createdAt: '06/10/26'
  },
  {
    id: 'AST-005',
    name: 'PRESS-01',
    status: 'DOWN',
    locationName: 'Production Floor',
    area: 'Stamping Bay A-4',
    model: 'Komatsu OBS 200-Ton Mechanical Press',
    barcode: 'BC-55219',
    category: 'Heavy Machinery',
    description: 'Heavy gauge steel sheet metal blanking and stamping press with dual optical safety light curtains.',
    primaryWorker: 'Marcus Vance',
    createdAt: '05/18/26'
  },
  {
    id: 'AST-006',
    name: 'CRAC-01',
    status: 'DOWN',
    locationName: 'Data Center Annex',
    area: 'Floor 2, Clean Room 102',
    model: 'Vertiv Liebert DS 35kW Precision Cooling',
    barcode: 'BC-44183',
    category: 'HVAC Unit',
    description: 'Downflow computer room air conditioner unit with dual digital scroll compressors and EC fans.',
    primaryWorker: 'Omar Dabobash',
    createdAt: '04/12/26'
  },
  {
    id: 'AST-007',
    name: 'CHILL-02',
    status: 'OPERATIONAL',
    locationName: 'Main Building',
    area: 'Roof Chiller Penthouse',
    model: 'Trane CenTraVac 400-Ton Centrifugal Chiller',
    barcode: 'BC-33902',
    category: 'HVAC Unit',
    description: 'High efficiency low-pressure central chiller supplying 44°F chilled water to building AHUs.',
    primaryWorker: 'Omar Dabobash',
    createdAt: '03/25/26'
  },
  {
    id: 'AST-008',
    name: 'CONV-03',
    status: 'DOWN',
    locationName: 'Production Floor',
    area: 'Packaging Line 3',
    model: 'Dorner 2200 Modular Belt Conveyor (80ft)',
    barcode: 'BC-22874',
    category: 'Material Handling',
    description: 'High-speed parcel transport conveyor line with integrated optical sorting gates and optical photo-eyes.',
    primaryWorker: 'Marcus Vance',
    createdAt: '03/01/26'
  },
  {
    id: 'AST-009',
    name: 'RO-SYS-01',
    status: 'OPERATIONAL',
    locationName: 'Production Floor',
    area: 'Water Treatment Annex',
    model: 'Evoqua Vantage 50 GPM Industrial RO',
    barcode: 'BC-11765',
    category: 'Water Treatment',
    description: 'Multi-stage reverse osmosis water demineralizer supplying pure deionized water for steam boilers.',
    primaryWorker: 'David Miller',
    createdAt: '02/14/26'
  },
  {
    id: 'AST-010',
    name: 'FORK-04',
    status: 'OPERATIONAL',
    locationName: 'Warehouse A',
    area: 'Loading Docks 1-8',
    model: 'Toyota 8FBE20 3-Wheel Electric Forklift',
    barcode: 'BC-99041',
    category: 'Vehicle',
    description: '4,000 lb capacity narrow aisle electric forklift with regenerative braking and side-shifter.',
    primaryWorker: 'Alex Chen',
    createdAt: '01/20/26'
  }
];

export const INITIAL_PMS: PreventiveMaintenance[] = [
  {
    id: 'PM0001',
    name: 'Quarterly HVAC Comprehensive Inspection',
    workOrderTitle: 'HVAC Inspection & Belt Adjustment',
    priority: 'MEDIUM',
    description: 'Quarterly PM covering filters, fan bearings, condensate lines, and economizer dampers.',
    frequency: 'Quarterly',
    nextWorkOrder: '10/01/26',
    worker: 'Omar Dabobash',
    assignedTo: 'Omar Dabobash',
    locationName: 'Warehouse A',
    category: 'HVAC'
  },
  {
    id: 'PM0002',
    name: 'Weekly Generator No-Load Exercise',
    workOrderTitle: 'Generator Checkup & Battery Health',
    priority: 'HIGH',
    description: 'Weekly battery terminal voltage test, fuel day-tank inspection, and 10-minute idle warm-up run.',
    frequency: 'Weekly',
    nextWorkOrder: '09/17/26',
    worker: 'Sarah Connor',
    assignedTo: 'Sarah Connor',
    locationName: 'Production Floor',
    category: 'Electrical'
  },
  {
    id: 'PM0003',
    name: 'Monthly Air Compressor Oil & Separator Inspection',
    workOrderTitle: 'Air Compressor Sump Sampling & Filter Differential',
    priority: 'MEDIUM',
    description: 'Inspect air/oil separator delta pressure gauge, blow down aftercooler moisture trap, check belt tension.',
    frequency: 'Monthly',
    nextWorkOrder: '09/25/26',
    worker: 'Marcus Vance',
    assignedTo: 'Marcus Vance',
    locationName: 'Production Floor',
    category: 'Mechanical'
  },
  {
    id: 'PM0004',
    name: 'Semi-Annual Stamping Press Hydraulic Fluid Analysis',
    workOrderTitle: 'Press Hydraulic Fluid Sampling & LOTO Inspection',
    priority: 'HIGH',
    description: 'Extract bottle sample for ISO 4406 particle count, viscosity test, and acid number titration.',
    frequency: 'Semi-Annual',
    nextWorkOrder: '10/10/26',
    worker: 'Marcus Vance',
    assignedTo: 'Marcus Vance',
    locationName: 'Production Floor',
    category: 'Mechanical'
  },
  {
    id: 'PM0005',
    name: 'Bi-Weekly Forklift Mast & Chain Lubrication',
    workOrderTitle: 'Forklift Mast Chains & Hydraulic Cylinder Lube',
    priority: 'LOW',
    description: 'Grease mast slider channels, inspect lift chain elongation with gauge, check battery electrolyte specific gravity.',
    frequency: 'Bi-Weekly',
    nextWorkOrder: '09/16/26',
    worker: 'Alex Chen',
    assignedTo: 'Alex Chen',
    locationName: 'Warehouse A',
    category: 'Fleet'
  },
  {
    id: 'PM0006',
    name: 'Monthly Server Room Cooling Filter Flush',
    workOrderTitle: 'CRAC Unit Filter Replacement & Humidifier Pan Clean',
    priority: 'HIGH',
    description: 'Replace dual air filters, flush infrared humidifier drain pan with disinfectant, verify water leak sensor cables.',
    frequency: 'Monthly',
    nextWorkOrder: '09/30/26',
    worker: 'Omar Dabobash',
    assignedTo: 'Omar Dabobash',
    locationName: 'Data Center Annex',
    category: 'HVAC'
  },
  {
    id: 'PM0007',
    name: 'Annual Fire Suppression & Deluge Certified Test',
    workOrderTitle: 'Annual Wet Pipe Sprinkler Flow & Backflow Certification',
    priority: 'CRITICAL',
    description: 'Main drain flow test, inspect inspector test valve pressure drop, calibrate waterflow alarm pressure switches.',
    frequency: 'Annually',
    nextWorkOrder: '11/15/26',
    worker: 'David Miller',
    assignedTo: 'David Miller',
    locationName: 'Main Building',
    category: 'Safety'
  },
  {
    id: 'PM0008',
    name: 'Quarterly Chiller Water Treatment Sampling',
    workOrderTitle: 'Chiller Evaporator Water Analysis & Bromine Dosing',
    priority: 'MEDIUM',
    description: 'Sample cooling tower water for legionella testing, replenish scale inhibitor, inspect drift eliminators.',
    frequency: 'Quarterly',
    nextWorkOrder: '12/01/26',
    worker: 'Omar Dabobash',
    assignedTo: 'Omar Dabobash',
    locationName: 'Main Building',
    category: 'HVAC'
  }
];

export const INITIAL_PARTS: Part[] = [
  {
    id: 'PRT-001',
    name: 'Air Filter (MERV-13 24x24x2)',
    cost: 15.99,
    quantity: 10,
    minQuantity: 4,
    barcode: 'AF-001',
    area: 'Bin A-12',
    category: 'Filters',
    description: 'High efficiency pleated air filter for commercial HVAC units and air handlers.',
    assignedTo: 'Omar Dabobash',
    createdAt: '09/10/26 08:14'
  },
  {
    id: 'PRT-002',
    name: 'V-Belt (Industrial B-Section B-72)',
    cost: 25.50,
    quantity: 5,
    minQuantity: 2,
    barcode: 'VB-001',
    area: 'Bin B-04',
    category: 'Belts',
    description: 'Heavy duty static-dissipative rubber drive belt for blower pulleys and compressors.',
    assignedTo: 'Omar Dabobash',
    createdAt: '09/10/26 08:14'
  },
  {
    id: 'PRT-003',
    name: 'Fuse 2A (Fast-Blow Ceramic 250V)',
    cost: 2.99,
    quantity: 20,
    minQuantity: 10,
    barcode: 'F-002A',
    area: 'Bin E-01',
    category: 'Electrical Components',
    description: '2 Amp 250V 5x20mm ceramic auxiliary control circuit protection fuse.',
    assignedTo: 'Sarah Connor',
    createdAt: '09/10/26 08:14'
  },
  {
    id: 'PRT-004',
    name: 'Hydraulic O-Ring & Rod Seal Kit (Viton 75D)',
    cost: 42.50,
    quantity: 8,
    minQuantity: 3,
    barcode: 'SEAL-75D',
    area: 'Bin H-08',
    category: 'Seals & Gaskets',
    description: 'High temperature fluorocarbon Viton rod seal, buffer ring, and wiper for hydraulic cylinders.',
    assignedTo: 'Marcus Vance',
    createdAt: '09/01/26 10:00'
  },
  {
    id: 'PRT-005',
    name: 'Synthetic Compressor Oil ISO VG 46 (5-Gal Pail)',
    cost: 185.00,
    quantity: 6,
    minQuantity: 2,
    barcode: 'OIL-VG46',
    area: 'Chemical Pallet R-2',
    category: 'Lubricants & Fluids',
    description: '8,000-hour extended life synthetic polyalphaolefin (PAO) rotary screw compressor fluid.',
    assignedTo: 'Marcus Vance',
    createdAt: '08/20/26 14:15'
  },
  {
    id: 'PRT-006',
    name: 'SKF 6205-2RSH Deep Groove Ball Bearing',
    cost: 18.75,
    quantity: 14,
    minQuantity: 5,
    barcode: 'BRG-6205',
    area: 'Bin C-03',
    category: 'Bearings',
    description: '25x52x15mm rubber sealed electric motor quality bearing with premium synthetic grease.',
    assignedTo: 'Marcus Vance',
    createdAt: '08/10/26 09:30'
  },
  {
    id: 'PRT-007',
    name: 'Centrifugal Pump Impeller (316 Stainless)',
    cost: 340.00,
    quantity: 2,
    minQuantity: 1,
    barcode: 'PMP-IMP-316',
    area: 'Bin P-01',
    category: 'Pump Parts',
    description: 'Precision balanced 6.5-inch enclosed impeller for water booster circulation pumps.',
    assignedTo: 'Omar Dabobash',
    createdAt: '07/15/26 11:00'
  },
  {
    id: 'PRT-008',
    name: 'Contactor 3-Pole 40A 24V Coil (Schneider LC1D40)',
    cost: 68.20,
    quantity: 9,
    minQuantity: 3,
    barcode: 'ELE-CNT-40A',
    area: 'Bin E-05',
    category: 'Electrical Components',
    description: 'IEC rated 3-phase magnetic motor contactor with 24VAC control coil and auxiliary contacts.',
    assignedTo: 'Sarah Connor',
    createdAt: '07/02/26 16:45'
  },
  {
    id: 'PRT-009',
    name: 'High-Pressure Hydraulic Hose 1/2in 4000 PSI (6ft)',
    cost: 54.00,
    quantity: 4,
    minQuantity: 2,
    barcode: 'HSE-4000-6F',
    area: 'Rack H-1',
    category: 'Hoses & Fittings',
    description: 'Two-wire steel braid hydraulic hose with crimped 1/2-inch JIC female swivel ends.',
    assignedTo: 'Marcus Vance',
    createdAt: '06/28/26 08:30'
  },
  {
    id: 'PRT-010',
    name: 'Forklift Heavy-Duty Traction Drive Tyre',
    cost: 210.00,
    quantity: 4,
    minQuantity: 2,
    barcode: 'TYR-TYT-21',
    area: 'Tire Bay 4',
    category: 'Fleet Parts',
    description: 'Non-marking smooth solid polyurethane compound drive wheel for electric warehouse forklifts.',
    assignedTo: 'Alex Chen',
    createdAt: '06/15/26 13:00'
  },
  {
    id: 'PRT-011',
    name: 'Industrial pH Buffer Calibration Solution (4.01/7.00)',
    cost: 28.50,
    quantity: 12,
    minQuantity: 4,
    barcode: 'CHM-PH-500',
    area: 'Lab Cabinet L-2',
    category: 'Chemicals & Reagents',
    description: 'NIST traceable calibration standards for automated boiler water and cooling tower pH sensors.',
    assignedTo: 'Omar Dabobash',
    createdAt: '06/01/26 10:20'
  },
  {
    id: 'PRT-012',
    name: 'LED Explosion-Proof Luminaire 100W 120-277V',
    cost: 165.00,
    quantity: 7,
    minQuantity: 3,
    barcode: 'LGT-EXP-100W',
    area: 'Bin L-09',
    category: 'Lighting',
    description: 'Class I Division 2 certified hazardous location LED ceiling light fixture with die-cast housing.',
    assignedTo: 'Sarah Connor',
    createdAt: '05/20/26 15:10'
  }
];

export const INITIAL_LOCATIONS: Location[] = [
  {
    id: 'LOC-001',
    name: 'Warehouse A',
    address: '742 Evergreen Terrace, Sector 4',
    description: 'Main distribution warehouse with 12 loading docks, high-bay pallet racking, and material handling bays.',
    createdBy: 'Omar Dabobash',
    createdAt: '08/01/26'
  },
  {
    id: 'LOC-002',
    name: 'Main Building',
    address: '100 Innovation Way, Suite 100',
    description: 'Corporate headquarters, executive offices, quality control laboratories, and central cafeteria.',
    createdBy: 'Omar Dabobash',
    createdAt: '08/01/26'
  },
  {
    id: 'LOC-003',
    name: 'Production Floor',
    address: 'Plant 2, North Yard',
    description: 'Primary automated manufacturing assembly lines, stamping presses, and robotic welding cells.',
    createdBy: 'Sarah Connor',
    createdAt: '08/10/26'
  },
  {
    id: 'LOC-004',
    name: 'Data Center Annex',
    address: 'Floor 2, Clean Room 102',
    description: 'High-density enterprise server racks, dual CRAC precision climate control, and UPS battery backup arrays.',
    createdBy: 'Elena Rostova',
    createdAt: '08/12/26'
  },
  {
    id: 'LOC-005',
    name: 'Chemical Storage Vault',
    address: 'North Perimeter Bunker',
    description: 'Fire-rated hazardous material bunker with continuous exhaust ventilation, explosion-proof lighting, and containment berms.',
    createdBy: 'David Miller',
    createdAt: '08/15/26'
  },
  {
    id: 'LOC-006',
    name: 'Loading Docks 1-8',
    address: 'Warehouse A Logistics Apron',
    description: 'Hydraulic dock levelers, high-speed roll-up doors, vehicle restraint systems, and shipping staging.',
    createdBy: 'Alex Chen',
    createdAt: '08/18/26'
  }
];

export const INITIAL_REQUESTS: MaintenanceRequest[] = [
  {
    id: 'REQ-101',
    title: 'AC unit making loud grinding squeal in Warehouse A',
    priority: 'HIGH',
    status: 'CONVERTED',
    locationName: 'Warehouse A',
    assetName: 'HVAC-001',
    createdBy: 'Warehouse Supervisor (Tom Jenkins)',
    createdAt: '09/10/26 07:45',
    description: 'Loud vibrational squeal noticed upon morning shift spin-up. Airflow in distribution bay feels warm.'
  },
  {
    id: 'REQ-102',
    title: 'Conveyor Line 3 optical sensor false tripping',
    priority: 'HIGH',
    status: 'PENDING',
    locationName: 'Production Floor',
    assetName: 'CONV-03',
    createdBy: 'Production Lead (Maria Santos)',
    createdAt: '09/10/26 08:30',
    description: 'Cardboard box packages accumulating at discharge turn. Photo-eye reflector is misaligned or caked in cardboard dust.'
  },
  {
    id: 'REQ-103',
    title: 'Dock Leveler #4 hydraulic cylinder slow to rise',
    priority: 'MEDIUM',
    status: 'APPROVED',
    locationName: 'Loading Docks 1-8',
    assetName: 'Hydraulic Dock Leveler 4',
    createdBy: 'Logistics Coordinator (Jake Briggs)',
    createdAt: '09/09/26 14:15',
    description: 'Takes over 40 seconds to extend lip onto truck trailer bed. Possible low fluid or air pocket in hydraulic line.'
  },
  {
    id: 'REQ-104',
    title: 'Water pooling under server room raised floor tile 14',
    priority: 'CRITICAL',
    status: 'CONVERTED',
    locationName: 'Data Center Annex',
    assetName: 'CRAC-01',
    createdBy: 'IT Infrastructure Lead (Kevin Zhao)',
    createdAt: '09/09/26 16:50',
    description: 'Moisture detector alarm sounded. Condensate drain pan from CRAC unit might be overflowing or clogged with biofilm.'
  },
  {
    id: 'REQ-105',
    title: 'Overhead Bridge Crane pendant cable insulation peeling',
    priority: 'HIGH',
    status: 'PENDING',
    locationName: 'Production Floor',
    assetName: 'Bridge Crane 5-Ton',
    createdBy: 'Safety Officer (David Miller)',
    createdAt: '09/08/26 11:10',
    description: 'Push-button pendant control drop cable outer jacket split open, exposing inner color-coded copper conductor insulation.'
  },
  {
    id: 'REQ-106',
    title: 'Eye wash station weekly inspection tag missing',
    priority: 'LOW',
    status: 'APPROVED',
    locationName: 'Chemical Storage Vault',
    assetName: 'Safety Shower Station #2',
    createdBy: 'Environmental Tech (Laura Kim)',
    createdAt: '09/08/26 09:00',
    description: 'Emergency eye wash station requires flow flushing and new inspection compliance punch tag.'
  }
];

export const INITIAL_METERS: Meter[] = [
  {
    id: 'MTR-01',
    name: 'Main Domestic Water Inflow Meter',
    nextReadingDue: '09/20/26',
    unit: 'Gallons x 100',
    lastReading: 48920,
    locationName: 'Main Building',
    assetName: 'Plumbing System',
    createdBy: 'Omar Dabobash',
    createdAt: '08/01/26'
  },
  {
    id: 'MTR-02',
    name: 'HVAC-001 Compressor Run Hours',
    nextReadingDue: '09/15/26',
    unit: 'Hours',
    lastReading: 3420,
    locationName: 'Warehouse A',
    assetName: 'HVAC-001',
    createdBy: 'Omar Dabobash',
    createdAt: '08/01/26'
  },
  {
    id: 'MTR-03',
    name: 'Atlas Copco GA-75 Loaded Run Hours',
    nextReadingDue: '09/18/26',
    unit: 'Hours',
    lastReading: 3988,
    locationName: 'Production Floor',
    assetName: 'COMP-002',
    createdBy: 'Marcus Vance',
    createdAt: '08/05/26'
  },
  {
    id: 'MTR-04',
    name: 'Plant 2 Primary Substation Electrical Power',
    nextReadingDue: '09/30/26',
    unit: 'Kilowatt-Hours (kWh)',
    lastReading: 1284500,
    locationName: 'Production Floor',
    assetName: 'Main Substation 480V',
    createdBy: 'Sarah Connor',
    createdAt: '08/01/26'
  },
  {
    id: 'MTR-05',
    name: 'Industrial RO System Feed Permeate Totalizer',
    nextReadingDue: '09/22/26',
    unit: 'Gallons (x1000)',
    lastReading: 89450,
    locationName: 'Production Floor',
    assetName: 'RO-SYS-01',
    createdBy: 'David Miller',
    createdAt: '08/10/26'
  },
  {
    id: 'MTR-06',
    name: 'Main Steam Boiler Natural Gas Flow Meter',
    nextReadingDue: '09/25/26',
    unit: 'Thousand Cubic Feet (MCF)',
    lastReading: 15420,
    locationName: 'Production Floor',
    assetName: 'Boiler 1',
    createdBy: 'Marcus Vance',
    createdAt: '08/12/26'
  }
];

export const INITIAL_USERS: UserMember[] = [
  {
    id: 'USR-001',
    name: 'Omar Dabobash',
    email: 'omar@nexcmms.online',
    phone: '+1 (555) 234-5678',
    role: 'Administrator',
    jobTitle: 'Lead Facility & Maintenance Engineer',
    hourlyRate: 45.00,
    scheduled: true,
    lastLogin: 'Today, 08:14'
  },
  {
    id: 'USR-002',
    name: 'Sarah Connor',
    email: 'sarah@nexcmms.online',
    phone: '+1 (555) 987-6543',
    role: 'Technician',
    jobTitle: 'Master Electrician & High Voltage Specialist',
    hourlyRate: 52.00,
    scheduled: true,
    lastLogin: 'Today, 07:30'
  },
  {
    id: 'USR-003',
    name: 'Alex Chen',
    email: 'alex@nexcmms.online',
    phone: '+1 (555) 345-6789',
    role: 'Technician',
    jobTitle: 'Fleet Specialist & Mobile Equipment Mechanic',
    hourlyRate: 40.00,
    scheduled: true,
    lastLogin: 'Yesterday, 16:45'
  },
  {
    id: 'USR-004',
    name: 'Elena Rostova',
    email: 'elena@nexcmms.online',
    phone: '+1 (555) 876-5432',
    role: 'Manager',
    jobTitle: 'Operations & Infrastructure Manager',
    hourlyRate: 58.00,
    scheduled: true,
    lastLogin: 'Today, 09:12'
  },
  {
    id: 'USR-005',
    name: 'Marcus Vance',
    email: 'marcus@nexcmms.online',
    phone: '+1 (555) 432-1098',
    role: 'Technician',
    jobTitle: 'Industrial Millwright & Hydraulic Specialist',
    hourlyRate: 50.00,
    scheduled: true,
    lastLogin: 'Today, 08:00'
  },
  {
    id: 'USR-006',
    name: 'David Miller',
    email: 'david@nexcmms.online',
    phone: '+1 (555) 654-3210',
    role: 'Technician',
    jobTitle: 'EHS Safety Officer & Code Compliance Tech',
    hourlyRate: 44.00,
    scheduled: false,
    lastLogin: '09/08/26'
  }
];

export const INITIAL_VENDORS: Vendor[] = [
  {
    id: 'VND-01',
    companyName: 'Apex Industrial Supply',
    contactName: 'Mark Vance',
    email: 'sales@apexsupply.com',
    phone: '+1 (800) 555-0199',
    website: 'https://apexsupply.com',
    vendorType: 'Parts Supplier',
    hourlyRate: 0,
    description: 'Primary authorized supplier for mechanical belts, seals, valves, and MRO fasteners.'
  },
  {
    id: 'VND-02',
    companyName: 'Reliable HVAC Solutions',
    contactName: 'Brian Caldwell',
    email: 'service@reliablehvac.com',
    phone: '+1 (800) 555-4422',
    website: 'https://reliablehvac.com',
    vendorType: 'HVAC Contractor',
    hourlyRate: 95.00,
    description: 'Certified Carrier and Trane commercial refrigeration, chiller overhaul, and cooling tower contractor.'
  },
  {
    id: 'VND-03',
    companyName: 'Motion Industries Power Transmission',
    contactName: 'Sarah Jenkins',
    email: 'orders@motionindustries.internal',
    phone: '+1 (800) 526-9328',
    website: 'https://motion.com',
    vendorType: 'Bearing & Motion Distributor',
    hourlyRate: 0,
    description: 'Certified SKF, Timken, and Baldor-Reliance distributor for bearings, gearboxes, and electric motors.'
  },
  {
    id: 'VND-04',
    companyName: 'Johnson Controls Life Safety & Security',
    contactName: 'Carlos Ramirez',
    email: 'service@jci.com',
    phone: '+1 (800) 555-8844',
    website: 'https://johnsoncontrols.com',
    vendorType: 'Fire & Security Contractor',
    hourlyRate: 110.00,
    description: 'NFPA certified contractor for dry/wet fire suppression, deluge valves, smoke dampers, and card access.'
  },
  {
    id: 'VND-05',
    companyName: 'Atlas Copco Compressed Air Technical Services',
    contactName: 'Hans Van Der Berg',
    email: 'service@us.atlascopco.com',
    phone: '+1 (866) 266-7788',
    website: 'https://atlascopco.com',
    vendorType: 'OEM Factory Service',
    hourlyRate: 125.00,
    description: 'Factory-certified technicians for GA-series rotary screw air compressor maintenance and airend rebuilds.'
  },
  {
    id: 'VND-06',
    companyName: 'Grainger MRO Solutions',
    contactName: 'Enterprise Account Support',
    email: 'b2b@grainger.com',
    phone: '+1 (888) 361-8649',
    website: 'https://grainger.com',
    vendorType: 'General Industrial Distributor',
    hourlyRate: 0,
    description: 'Consumables, PPE, lockouts, electrical fuses, wire, test meters, and maintenance tooling.'
  }
];

export const INITIAL_SETTINGS: SystemSettings = {
  language: 'English',
  dateFormat: 'MM/DD/YY',
  timeZone: 'Etc/GMT+9',
  currency: 'Dollar - $',
  preWorkOrderLeadDays: 1,
  csvSeparator: ',',
  brandColor: '#0ea5e9'
};
