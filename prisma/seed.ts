import process from 'node:process';
import { 
  PrismaClient, 
  UserRole, 
  WorkOrderStatus, 
  Priority, 
  AssetStatus, 
  RequestStatus,
  ABCClass,
  RiskLevel,
  SubscriptionTier,
  AuditAction
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting NASH CMMS Database Seeding...');

  // 1. Seed System Settings
  console.log('⚙️  Seeding System Settings...');
  await prisma.systemSetting.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      language: 'English',
      dateFormat: 'MM/DD/YY',
      timeZone: 'Etc/GMT+9',
      currency: 'Dollar - $',
      preWorkOrderLeadDays: 1,
      csvSeparator: ',',
      brandColor: '#0ea5e9'
    }
  });

  // 2. Seed Users
  console.log('👥 Seeding Users & Technicians...');
  const usersData = [
    {
      id: 'USR-001',
      name: 'Omar Dabobash',
      email: 'omar@nash-cmms.internal',
      phone: '+1 (555) 234-5678',
      role: UserRole.ADMINISTRATOR,
      jobTitle: 'Lead Facility & Maintenance Engineer',
      hourlyRate: 45.00,
      scheduled: true,
      lastLogin: 'Today, 08:14',
      avatar: 'O'
    },
    {
      id: 'USR-002',
      name: 'Sarah Connor',
      email: 'sarah@nash-cmms.internal',
      phone: '+1 (555) 987-6543',
      role: UserRole.TECHNICIAN,
      jobTitle: 'Master Electrician & High Voltage Specialist',
      hourlyRate: 52.00,
      scheduled: true,
      lastLogin: 'Today, 07:30',
      avatar: 'S'
    },
    {
      id: 'USR-003',
      name: 'Alex Chen',
      email: 'alex@nash-cmms.internal',
      phone: '+1 (555) 345-6789',
      role: UserRole.TECHNICIAN,
      jobTitle: 'Fleet Specialist & Mobile Equipment Mechanic',
      hourlyRate: 40.00,
      scheduled: true,
      lastLogin: 'Yesterday, 16:45',
      avatar: 'A'
    },
    {
      id: 'USR-004',
      name: 'Elena Rostova',
      email: 'elena@nash-cmms.internal',
      phone: '+1 (555) 876-5432',
      role: UserRole.MANAGER,
      jobTitle: 'Operations & Infrastructure Manager',
      hourlyRate: 58.00,
      scheduled: true,
      lastLogin: 'Today, 09:12',
      avatar: 'E'
    },
    {
      id: 'USR-005',
      name: 'Marcus Vance',
      email: 'marcus@nash-cmms.internal',
      phone: '+1 (555) 432-1098',
      role: UserRole.TECHNICIAN,
      jobTitle: 'Industrial Millwright & Hydraulic Specialist',
      hourlyRate: 50.00,
      scheduled: true,
      lastLogin: 'Today, 08:00',
      avatar: 'M'
    },
    {
      id: 'USR-006',
      name: 'David Miller',
      email: 'david@nash-cmms.internal',
      phone: '+1 (555) 654-3210',
      role: UserRole.TECHNICIAN,
      jobTitle: 'EHS Safety Officer & Code Compliance Tech',
      hourlyRate: 44.00,
      scheduled: false,
      lastLogin: '09/08/26',
      avatar: 'D'
    }
  ];

  for (const user of usersData) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: user,
      create: user
    });
  }

  // 3. Seed Locations
  console.log('📍 Seeding Facility Locations...');
  const locationsData = [
    {
      id: 'LOC-001',
      name: 'Warehouse A',
      address: '742 Evergreen Terrace, Sector 4',
      description: 'Main distribution warehouse with 12 loading docks, high-bay pallet racking, and material handling bays.',
      createdById: 'USR-001'
    },
    {
      id: 'LOC-002',
      name: 'Main Building',
      address: '100 Innovation Way, Suite 100',
      description: 'Corporate headquarters, executive offices, quality control laboratories, and central cafeteria.',
      createdById: 'USR-001'
    },
    {
      id: 'LOC-003',
      name: 'Production Floor',
      address: 'Plant 2, North Yard',
      description: 'Primary automated manufacturing assembly lines, stamping presses, and robotic welding cells.',
      createdById: 'USR-002'
    },
    {
      id: 'LOC-004',
      name: 'Data Center Annex',
      address: 'Floor 2, Clean Room 102',
      description: 'High-density enterprise server racks, dual CRAC precision climate control, and UPS battery backup arrays.',
      createdById: 'USR-004'
    },
    {
      id: 'LOC-005',
      name: 'Chemical Storage Vault',
      address: 'North Perimeter Bunker',
      description: 'Fire-rated hazardous material bunker with continuous exhaust ventilation, explosion-proof lighting, and containment berms.',
      createdById: 'USR-006'
    },
    {
      id: 'LOC-006',
      name: 'Loading Docks 1-8',
      address: 'Warehouse A Logistics Apron',
      description: 'Hydraulic dock levelers, high-speed roll-up doors, vehicle restraint systems, and shipping staging.',
      createdById: 'USR-003'
    }
  ];

  for (const loc of locationsData) {
    await prisma.location.upsert({
      where: { id: loc.id },
      update: loc,
      create: loc
    });
  }

  // 4. Seed Categories
  console.log('🏷️  Seeding Operational Categories...');
  const categoriesData = [
    { id: 'CAT-WO-PLUMB', name: 'Plumbing', type: 'WORK_ORDER' },
    { id: 'CAT-WO-HVAC', name: 'HVAC', type: 'WORK_ORDER' },
    { id: 'CAT-WO-ELEC', name: 'Electrical', type: 'WORK_ORDER' },
    { id: 'CAT-WO-MECH', name: 'Mechanical', type: 'WORK_ORDER' },
    { id: 'CAT-WO-FLEET', name: 'Fleet', type: 'WORK_ORDER' },
    { id: 'CAT-WO-GEN', name: 'General', type: 'WORK_ORDER' },
    { id: 'CAT-WO-SAFETY', name: 'Safety', type: 'WORK_ORDER' },
    { id: 'CAT-AST-HVAC', name: 'HVAC Unit', type: 'ASSET' },
    { id: 'CAT-AST-VEH', name: 'Vehicle', type: 'ASSET' },
    { id: 'CAT-AST-GEN', name: 'Generator', type: 'ASSET' },
    { id: 'CAT-AST-COMP', name: 'Air Compressor', type: 'ASSET' },
    { id: 'CAT-AST-HEAVY', name: 'Heavy Machinery', type: 'ASSET' },
    { id: 'CAT-AST-MH', name: 'Material Handling', type: 'ASSET' },
    { id: 'CAT-AST-WATER', name: 'Water Treatment', type: 'ASSET' },
    { id: 'CAT-PRT-MECH', name: 'Mechanical Components', type: 'PART' },
    { id: 'CAT-PRT-ELEC', name: 'Electrical & Controls', type: 'PART' },
    { id: 'CAT-PRT-HVAC', name: 'HVAC & Filtration', type: 'PART' },
    { id: 'CAT-PRT-FLUID', name: 'Fluids & Lubricants', type: 'PART' },
    { id: 'CAT-PRT-PLUMB', name: 'Plumbing & Valves', type: 'PART' }
  ];

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: cat,
      create: cat
    });
  }

  // 5. Seed Assets
  console.log('🏭 Seeding Equipment & Industrial Assets...');
  const assetsData = [
    {
      id: 'AST-001',
      name: 'HVAC-001',
      status: AssetStatus.DOWN,
      locationId: 'LOC-001',
      area: 'Roof Section B',
      model: 'Carrier WeatherMaster 48HC',
      barcode: 'BC-99201',
      categoryId: 'CAT-AST-HVAC',
      description: 'Central packaged rooftop HVAC unit servicing Warehouse A distribution bays with economizer.',
      primaryWorkerId: 'USR-001'
    },
    {
      id: 'AST-002',
      name: 'TRUCK-01',
      status: AssetStatus.OPERATIONAL,
      locationId: 'LOC-001',
      area: 'Fleet Maintenance Bay',
      model: 'Ford F-150 SuperDuty Service Bed',
      barcode: 'BC-88102',
      categoryId: 'CAT-AST-VEH',
      description: 'Facility response pickup truck equipped with crane hoist, welder, and emergency tool chests.',
      primaryWorkerId: 'USR-003'
    },
    {
      id: 'AST-003',
      name: 'GEN-001',
      status: AssetStatus.EMERGENCY_SHUTDOWN,
      locationId: 'LOC-003',
      area: 'Auxiliary Power Shed',
      model: 'Caterpillar C15 500kVA Diesel Generator',
      barcode: 'BC-77304',
      categoryId: 'CAT-AST-GEN',
      description: 'Primary emergency standby generator for life safety egress, data center, and toxic exhaust scrubbers.',
      primaryWorkerId: 'USR-002'
    },
    {
      id: 'AST-004',
      name: 'COMP-002',
      status: AssetStatus.OPERATIONAL,
      locationId: 'LOC-003',
      area: 'Utility Compressor Room 1',
      model: 'Atlas Copco GA-75 VSD+ (100 HP)',
      barcode: 'BC-66405',
      categoryId: 'CAT-AST-COMP',
      description: 'Variable speed drive rotary screw air compressor providing 125 PSI plant-wide pneumatic header.',
      primaryWorkerId: 'USR-005'
    },
    {
      id: 'AST-005',
      name: 'PRESS-01',
      status: AssetStatus.DOWN,
      locationId: 'LOC-003',
      area: 'Stamping Bay A-4',
      model: 'Komatsu OBS 200-Ton Mechanical Press',
      barcode: 'BC-55219',
      categoryId: 'CAT-AST-HEAVY',
      description: 'Heavy gauge steel sheet metal blanking and stamping press with dual optical safety light curtains.',
      primaryWorkerId: 'USR-005'
    },
    {
      id: 'AST-006',
      name: 'CRAC-01',
      status: AssetStatus.DOWN,
      locationId: 'LOC-004',
      area: 'Floor 2, Clean Room 102',
      model: 'Vertiv Liebert DS 35kW Precision Cooling',
      barcode: 'BC-44183',
      categoryId: 'CAT-AST-HVAC',
      description: 'Downflow computer room air conditioner unit with dual digital scroll compressors and EC fans.',
      primaryWorkerId: 'USR-001'
    },
    {
      id: 'AST-007',
      name: 'CHILL-02',
      status: AssetStatus.OPERATIONAL,
      locationId: 'LOC-002',
      area: 'Roof Chiller Penthouse',
      model: 'Trane CenTraVac 400-Ton Centrifugal Chiller',
      barcode: 'BC-33902',
      categoryId: 'CAT-AST-HVAC',
      description: 'High efficiency low-pressure central chiller supplying 44°F chilled water to building AHUs.',
      primaryWorkerId: 'USR-001'
    },
    {
      id: 'AST-008',
      name: 'CONV-03',
      status: AssetStatus.DOWN,
      locationId: 'LOC-003',
      area: 'Packaging Line 3',
      model: 'Dorner 2200 Modular Belt Conveyor (80ft)',
      barcode: 'BC-22874',
      categoryId: 'CAT-AST-MH',
      description: 'High-speed parcel transport conveyor line with integrated optical sorting gates and optical photo-eyes.',
      primaryWorkerId: 'USR-005'
    },
    {
      id: 'AST-009',
      name: 'RO-SYS-01',
      status: AssetStatus.OPERATIONAL,
      locationId: 'LOC-003',
      area: 'Water Treatment Annex',
      model: 'Evoqua Vantage 50 GPM Industrial RO',
      barcode: 'BC-11765',
      categoryId: 'CAT-AST-WATER',
      description: 'Multi-stage reverse osmosis water demineralizer supplying pure deionized water for steam boilers.',
      primaryWorkerId: 'USR-006'
    },
    {
      id: 'AST-010',
      name: 'FORK-04',
      status: AssetStatus.OPERATIONAL,
      locationId: 'LOC-001',
      area: 'Loading Docks 1-8',
      model: 'Toyota 8FBE20 3-Wheel Electric Forklift',
      barcode: 'BC-99041',
      categoryId: 'CAT-AST-VEH',
      description: '4,000 lb capacity narrow aisle electric forklift with regenerative braking and side-shifter.',
      primaryWorkerId: 'USR-003'
    }
  ];

  for (const asset of assetsData) {
    await prisma.asset.upsert({
      where: { id: asset.id },
      update: asset,
      create: asset
    });
  }

  // 6. Seed Parts
  console.log('📦 Seeding Inventory & Spare Parts...');
  const partsData = [
    {
      id: 'PRT-001',
      name: 'Air Filter (MERV-13, 24x24x2)',
      cost: 15.99,
      quantity: 48,
      minQuantity: 12,
      barcode: 'PART-001-AF',
      area: 'Aisle 3, Shelf B2',
      categoryId: 'CAT-PRT-HVAC',
      description: 'High efficiency pleated synthetic air filter for rooftop AHUs and clean room intake dampers.',
      assignedToId: 'USR-001'
    },
    {
      id: 'PRT-002',
      name: 'V-Belt 4L420 (Drive Belt)',
      cost: 8.50,
      quantity: 14,
      minQuantity: 6,
      barcode: 'PART-002-VB',
      area: 'Aisle 2, Bin 14',
      categoryId: 'CAT-PRT-MECH',
      description: 'Standard industrial wrapped rubber V-belt for exhaust fans, blowers, and motor sheaves.',
      assignedToId: 'USR-005'
    },
    {
      id: 'PRT-003',
      name: 'Synthetic Compressor Oil ISO 46 (5 Gal)',
      cost: 145.00,
      quantity: 4,
      minQuantity: 2,
      barcode: 'PART-003-OIL',
      area: 'Flammable Liquids Cabinet C',
      categoryId: 'CAT-PRT-FLUID',
      description: 'Full synthetic PAO lubricant for rotary screw air compressor sumps with 8,000-hour drain intervals.',
      assignedToId: 'USR-005'
    },
    {
      id: 'PRT-004',
      name: '2-inch Brass Coupling Fitting',
      cost: 12.50,
      quantity: 32,
      minQuantity: 10,
      barcode: 'PART-004-BC',
      area: 'Aisle 1, Rack D',
      categoryId: 'CAT-PRT-PLUMB',
      description: 'Threaded lead-free cast brass pipe coupling rated for 200 PSI potable and chilled water lines.',
      assignedToId: 'USR-001'
    },
    {
      id: 'PRT-005',
      name: '20A 3-Pole Circuit Breaker (Square D)',
      cost: 65.00,
      quantity: 8,
      minQuantity: 4,
      barcode: 'PART-005-CB',
      area: 'Electrical Room Cabinet A',
      categoryId: 'CAT-PRT-ELEC',
      description: 'Bolt-on commercial miniature circuit breaker for 480V distribution load centers and motor starters.',
      assignedToId: 'USR-002'
    },
    {
      id: 'PRT-006',
      name: 'High-Temperature Grease EP2 (14oz)',
      cost: 7.25,
      quantity: 22,
      minQuantity: 10,
      barcode: 'PART-006-GR',
      area: 'Aisle 2, Shelf A1',
      categoryId: 'CAT-PRT-FLUID',
      description: 'Lithium complex heavy-duty extreme pressure grease for conveyor pillow block roller bearings.',
      assignedToId: 'USR-005'
    },
    {
      id: 'PRT-007',
      name: 'Pillow Block Bearing 1-7/16" Bore (SKF)',
      cost: 58.75,
      quantity: 2,
      minQuantity: 4,
      barcode: 'PART-007-PB',
      area: 'Aisle 2, Bin 28',
      categoryId: 'CAT-PRT-MECH',
      description: 'Cast iron housing self-aligning ball bearing unit with eccentric locking collar.',
      assignedToId: 'USR-005'
    },
    {
      id: 'PRT-008',
      name: 'Hydraulic Cylinder Seal Kit (OBS-200)',
      cost: 210.00,
      quantity: 1,
      minQuantity: 2,
      barcode: 'PART-008-SK',
      area: 'Specialty Parts Cage',
      categoryId: 'CAT-PRT-MECH',
      description: 'Complete OEM nitrile and polyurethane rod, piston, and wiper seal replacement pack.',
      assignedToId: 'USR-005'
    },
    {
      id: 'PRT-009',
      name: 'Industrial RO Membrane Element (4040)',
      cost: 385.00,
      quantity: 3,
      minQuantity: 2,
      barcode: 'PART-009-RO',
      area: 'Water Treatment Storage',
      categoryId: 'CAT-PRT-PLUMB',
      description: 'Polyamide thin-film composite high-rejection reverse osmosis membrane spiral wound element.',
      assignedToId: 'USR-006'
    },
    {
      id: 'PRT-010',
      name: 'Hazardous Location LED Ceiling Fixture',
      cost: 175.00,
      quantity: 6,
      minQuantity: 3,
      barcode: 'PART-010-LF',
      area: 'Electrical Annex Bin 4',
      categoryId: 'CAT-PRT-ELEC',
      description: 'Class I Division 2 certified hazardous location LED ceiling light fixture with die-cast housing.',
      assignedToId: 'USR-002'
    }
  ];

  for (const part of partsData) {
    await prisma.part.upsert({
      where: { id: part.id },
      update: part,
      create: part
    });
  }

  // 7. Seed Vendors
  console.log('🏢 Seeding Suppliers & Contractors...');
  const vendorsData = [
    {
      id: 'VND-01',
      companyName: 'Apex Industrial Supply',
      contactName: 'Mark Vance',
      email: 'sales@apexsupply.com',
      phone: '+1 (800) 555-0199',
      website: 'https://apexsupply.com',
      vendorType: 'Parts Supplier',
      hourlyRate: 0.00,
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
      hourlyRate: 0.00,
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
      hourlyRate: 0.00,
      description: 'Consumables, PPE, lockouts, electrical fuses, wire, test meters, and maintenance tooling.'
    }
  ];

  for (const vendor of vendorsData) {
    await prisma.vendor.upsert({
      where: { id: vendor.id },
      update: vendor,
      create: vendor
    });
  }

  // 8. Seed Preventive Maintenance Triggers
  console.log('🔄 Seeding Preventive Maintenance Schedules...');
  const pmsData = [
    {
      id: 'PM0001',
      name: 'Quarterly HVAC Comprehensive Inspection',
      workOrderTitle: 'HVAC Inspection & Belt Adjustment',
      priority: Priority.MEDIUM,
      description: 'Quarterly PM covering filters, fan bearings, condensate lines, and economizer dampers.',
      frequency: 'Quarterly',
      scheduleRule: 'FREQ=MONTHLY;INTERVAL=3',
      nextDueDate: new Date('2026-10-01T08:00:00Z'),
      assetId: 'AST-001',
      locationId: 'LOC-001',
      assignedToId: 'USR-001'
    },
    {
      id: 'PM0002',
      name: 'Emergency Generator Monthly Full Load Bank Test',
      workOrderTitle: 'Monthly 30-Min Generator Load Test',
      priority: Priority.HIGH,
      description: 'Monthly 30-minute full building load transfer simulation and diesel fuel water separator drain.',
      frequency: 'Monthly',
      scheduleRule: 'FREQ=MONTHLY;INTERVAL=1',
      nextDueDate: new Date('2026-09-28T09:00:00Z'),
      assetId: 'AST-003',
      locationId: 'LOC-003',
      assignedToId: 'USR-002'
    },
    {
      id: 'PM0003',
      name: 'Air Compressor Sump Lubrication & Oil Analysis',
      workOrderTitle: 'Compressor Oil Change & Particle Analysis',
      priority: Priority.MEDIUM,
      description: 'Sample oil for ICP metal spectrometer test, replace spin-on oil filter and separator cartridge.',
      frequency: 'Semi-Annually',
      scheduleRule: 'FREQ=MONTHLY;INTERVAL=6',
      nextDueDate: new Date('2026-10-15T08:00:00Z'),
      assetId: 'AST-004',
      locationId: 'LOC-003',
      assignedToId: 'USR-005'
    },
    {
      id: 'PM0004',
      name: 'Toyota Forklift 250-Hour Mast & Brake Service',
      workOrderTitle: 'Forklift Safety Inspection & Chain Lube',
      priority: Priority.LOW,
      description: 'Inspect hoist chains, check brake pad thickness, top off battery deionized electrolyte cells.',
      frequency: 'Bi-Monthly',
      scheduleRule: 'FREQ=MONTHLY;INTERVAL=2',
      nextDueDate: new Date('2026-09-25T13:00:00Z'),
      assetId: 'AST-010',
      locationId: 'LOC-001',
      assignedToId: 'USR-003'
    },
    {
      id: 'PM0005',
      name: 'Data Center CRAC Humidity & Condensate Flush',
      workOrderTitle: 'CRAC Clean Room Inspection & Pan Treatment',
      priority: Priority.CRITICAL,
      description: 'Clean infrared humidifier quartz lamps, inspect steam canister, and flush condensate drain lines.',
      frequency: 'Monthly',
      scheduleRule: 'FREQ=MONTHLY;INTERVAL=1',
      nextDueDate: new Date('2026-09-30T10:00:00Z'),
      assetId: 'AST-006',
      locationId: 'LOC-004',
      assignedToId: 'USR-001'
    },
    {
      id: 'PM0006',
      name: 'Hydraulic Stamping Press Safety Curtain Calibration',
      workOrderTitle: 'Press Optical Light Curtain Stop-Time Test',
      priority: Priority.CRITICAL,
      description: 'OSHA 1910.217 compliant optical light curtain response time verification and clutch brake gap check.',
      frequency: 'Quarterly',
      scheduleRule: 'FREQ=MONTHLY;INTERVAL=3',
      nextDueDate: new Date('2026-10-05T07:00:00Z'),
      assetId: 'AST-005',
      locationId: 'LOC-003',
      assignedToId: 'USR-005'
    },
    {
      id: 'PM0007',
      name: 'Reverse Osmosis Clean-in-Place (CIP) Acid Wash',
      workOrderTitle: 'RO Membrane Descaling & pH Sensor Recalibration',
      priority: Priority.MEDIUM,
      description: 'Perform low-pH citric acid flush to remove carbonate scaling, followed by permeate flush.',
      frequency: 'Bi-Monthly',
      scheduleRule: 'FREQ=MONTHLY;INTERVAL=2',
      nextDueDate: new Date('2026-10-20T08:00:00Z'),
      assetId: 'AST-009',
      locationId: 'LOC-003',
      assignedToId: 'USR-006'
    },
    {
      id: 'PM0008',
      name: 'Packaging Conveyor Line 3 Roller Alignment',
      workOrderTitle: 'Conveyor Drive Chain Tensioning & Thermography',
      priority: Priority.LOW,
      description: 'FLIR infrared thermography scan of all drive bearings under full load and chain tension check.',
      frequency: 'Monthly',
      scheduleRule: 'FREQ=MONTHLY;INTERVAL=1',
      nextDueDate: new Date('2026-10-10T14:00:00Z'),
      assetId: 'AST-008',
      locationId: 'LOC-003',
      assignedToId: 'USR-005'
    }
  ];

  for (const pm of pmsData) {
    await prisma.preventiveMaintenance.upsert({
      where: { id: pm.id },
      update: pm,
      create: pm
    });
  }

  // 9. Seed Maintenance Requests
  console.log('📬 Seeding Maintenance Requests...');
  const requestsData = [
    {
      id: 'REQ-101',
      title: 'AC unit making loud grinding squeal in Warehouse A',
      priority: Priority.HIGH,
      status: RequestStatus.PENDING,
      locationId: 'LOC-001',
      assetId: 'AST-001',
      createdById: 'USR-004',
      description: 'Operators in picking bays 4 through 8 reported a sharp screeching metal noise every time the compressor cycles on.'
    },
    {
      id: 'REQ-102',
      title: 'Conveyor Line 3 belt slipping during peak shift',
      priority: Priority.MEDIUM,
      status: RequestStatus.APPROVED,
      locationId: 'LOC-003',
      assetId: 'AST-008',
      createdById: 'USR-005',
      description: 'Parcels are jamming at discharge transfer chute because drive roller belt is slipping under heavy cartons.'
    },
    {
      id: 'REQ-103',
      title: 'Server Room temperature spiking to 78°F',
      priority: Priority.CRITICAL,
      status: RequestStatus.CONVERTED,
      locationId: 'LOC-004',
      assetId: 'AST-006',
      createdById: 'USR-004',
      description: 'SNMP temperature probes alarmed high thermal threshold in aisle 4. CRAC unit high head pressure cut-out active.'
    },
    {
      id: 'REQ-104',
      title: 'Oil pooling under hydraulic press bed',
      priority: Priority.HIGH,
      status: RequestStatus.APPROVED,
      locationId: 'LOC-003',
      assetId: 'AST-005',
      createdById: 'USR-002',
      description: 'Puddle of hydraulic oil noticed during morning pre-shift inspection underneath lower cylinder platen.'
    },
    {
      id: 'REQ-105',
      title: 'Loading dock door #4 jammed halfway',
      priority: Priority.MEDIUM,
      status: RequestStatus.PENDING,
      locationId: 'LOC-006',
      createdById: 'USR-003',
      description: 'Roll-up commercial door motor stalls when rising past 4 feet. Trucks cannot back into dock 4.'
    },
    {
      id: 'REQ-106',
      title: 'Chemical vault exhaust fan warning indicator lit',
      priority: Priority.CRITICAL,
      status: RequestStatus.PENDING,
      locationId: 'LOC-005',
      createdById: 'USR-006',
      description: 'Differential pressure sensor across scrubber exhaust duct indicates low airflow CFM below OSHA safety baseline.'
    }
  ];

  for (const req of requestsData) {
    await prisma.maintenanceRequest.upsert({
      where: { id: req.id },
      update: req,
      create: req
    });
  }

  // 10. Seed Meters
  console.log('⚡ Seeding Telemetry Meters...');
  const metersData = [
    {
      id: 'MTR-01',
      name: 'Main Facility Water Meter',
      nextReadingDue: new Date('2026-10-01T08:00:00Z'),
      unit: 'Gallons',
      lastReading: 485290.00,
      locationId: 'LOC-002',
      createdById: 'USR-001'
    },
    {
      id: 'MTR-02',
      name: 'Substation Peak Demand Meter',
      nextReadingDue: new Date('2026-09-30T08:00:00Z'),
      unit: 'kWh',
      lastReading: 128450.50,
      locationId: 'LOC-003',
      createdById: 'USR-002'
    },
    {
      id: 'MTR-03',
      name: 'Rotary Compressor Run-Time Hour Meter',
      nextReadingDue: new Date('2026-10-05T08:00:00Z'),
      unit: 'Hours',
      lastReading: 4210.00,
      assetId: 'AST-004',
      locationId: 'LOC-003',
      createdById: 'USR-005'
    },
    {
      id: 'MTR-04',
      name: 'Toyota Forklift 04 Operating Hours',
      nextReadingDue: new Date('2026-09-28T08:00:00Z'),
      unit: 'Hours',
      lastReading: 1845.20,
      assetId: 'AST-010',
      locationId: 'LOC-001',
      createdById: 'USR-003'
    },
    {
      id: 'MTR-05',
      name: 'Standby Generator Engine Run Meter',
      nextReadingDue: new Date('2026-10-15T08:00:00Z'),
      unit: 'Hours',
      lastReading: 312.80,
      assetId: 'AST-003',
      locationId: 'LOC-003',
      createdById: 'USR-002'
    }
  ];

  for (const mtr of metersData) {
    await prisma.meter.upsert({
      where: { id: mtr.id },
      update: mtr,
      create: mtr
    });
  }

  // 11. Seed Work Orders with Nested Relations
  console.log('📋 Seeding Full Work Orders (Tasks, Labor, Parts, Costs, Comments)...');
  const workOrdersData = [
    {
      id: 'WO000001',
      code: 'WO000001',
      title: 'Fix leaking pipe near central riser',
      description: 'A pipe is leaking in the main building basement near the central water riser valve manifold.',
      status: WorkOrderStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      locationId: 'LOC-002',
      assetId: 'AST-001',
      categoryId: 'CAT-WO-PLUMB',
      assignedToId: 'USR-001',
      createdById: 'USR-001',
      dueDate: new Date('2026-09-11T12:00:00Z'),
      expectedStartDate: new Date('2026-09-10T08:00:00Z'),
      estimatedDurationHours: 3.0,
      requiresSignature: true,
      tasks: [
        { title: 'Shut off isolation valve B2', completed: true, orderIndex: 1 },
        { title: 'Drain residual pressure from manifold', completed: true, orderIndex: 2 },
        { title: 'Replace corroded brass joint fitting', completed: false, orderIndex: 3 },
        { title: 'Perform 15-minute pressure test at 60 PSI', completed: false, orderIndex: 4 }
      ],
      labors: [
        {
          userId: 'USR-001',
          hours: 1.25,
          hourlyRate: 45.00,
          date: new Date('2026-09-10T08:30:00Z'),
          description: 'Line isolation and replacement joint installation'
        }
      ],
      additionalCosts: [
        {
          description: 'Emergency plumber callout fee',
          amount: 85.00,
          category: 'Contractor',
          date: new Date('2026-09-10T08:30:00Z')
        }
      ],
      parts: [
        { partId: 'PRT-004', quantity: 2, unitCost: 12.50 }
      ],
      comments: [
        {
          userId: 'USR-001',
          text: 'Water supply shut off to sector. Work underway.',
          createdAt: new Date('2026-09-10T08:35:00Z')
        }
      ]
    },
    {
      id: 'WO000002',
      code: 'WO000002',
      title: 'Replace air filter in HVAC-001',
      description: 'Replace the air filter in HVAC-001 according to quarterly maintenance guidelines.',
      status: WorkOrderStatus.ON_HOLD,
      priority: Priority.LOW,
      locationId: 'LOC-001',
      assetId: 'AST-001',
      categoryId: 'CAT-WO-HVAC',
      assignedToId: 'USR-001',
      createdById: 'USR-001',
      dueDate: new Date('2026-09-18T17:00:00Z'),
      expectedStartDate: new Date('2026-09-12T09:00:00Z'),
      estimatedDurationHours: 1.5,
      requiresSignature: false,
      tasks: [
        { title: 'Power down HVAC-001 unit safely', completed: true, orderIndex: 1 },
        { title: 'Remove front access panel and extract old pleated filter', completed: false, orderIndex: 2 },
        { title: 'Inspect condenser coils for dust build-up', completed: false, orderIndex: 3 },
        { title: 'Install new MERV-13 filter and restore power', completed: false, orderIndex: 4 }
      ],
      labors: [
        {
          userId: 'USR-001',
          hours: 0.5,
          hourlyRate: 45.00,
          date: new Date('2026-09-10T08:20:00Z'),
          description: 'Initial unit diagnostic and filter sizing'
        }
      ],
      additionalCosts: [],
      parts: [
        { partId: 'PRT-001', quantity: 1, unitCost: 15.99 }
      ],
      comments: [
        {
          userId: 'USR-001',
          text: 'Waiting for replacement filter delivery from supplier. Unit placed on hold temporarily.',
          createdAt: new Date('2026-09-10T08:25:00Z')
        }
      ]
    },
    {
      id: 'WO000003',
      code: 'WO000003',
      title: 'Emergency Generator 500kVA Load Test',
      description: 'Perform monthly scheduled 30-minute load bank test on backup generator GEN-001.',
      status: WorkOrderStatus.OPEN,
      priority: Priority.MEDIUM,
      locationId: 'LOC-003',
      assetId: 'AST-003',
      categoryId: 'CAT-WO-ELEC',
      assignedToId: 'USR-002',
      createdById: 'USR-001',
      dueDate: new Date('2026-09-15T16:00:00Z'),
      expectedStartDate: new Date('2026-09-15T08:00:00Z'),
      estimatedDurationHours: 2.0,
      requiresSignature: true,
      tasks: [
        { title: 'Verify diesel fuel level is above 85%', completed: false, orderIndex: 1 },
        { title: 'Inspect starting battery terminal voltage (min 24.8V)', completed: false, orderIndex: 2 },
        { title: 'Initiate manual transfer switch test sequence', completed: false, orderIndex: 3 },
        { title: 'Record output voltage, frequency, and oil pressure at 15 min mark', completed: false, orderIndex: 4 }
      ],
      labors: [],
      additionalCosts: [],
      parts: [],
      comments: []
    },
    {
      id: 'WO000004',
      code: 'WO000004',
      title: 'Server Room CRAC Unit High Temperature Alarm',
      description: 'CRAC-01 reported high room temperature of 78°F. Immediate inspection of refrigerant pressure required.',
      status: WorkOrderStatus.IN_PROGRESS,
      priority: Priority.CRITICAL,
      locationId: 'LOC-004',
      assetId: 'AST-006',
      categoryId: 'CAT-WO-HVAC',
      assignedToId: 'USR-001',
      createdById: 'USR-004',
      dueDate: new Date('2026-09-10T18:00:00Z'),
      expectedStartDate: new Date('2026-09-10T09:00:00Z'),
      estimatedDurationHours: 4.0,
      requiresSignature: true,
      tasks: [
        { title: 'Inspect digital scroll compressor status and error codes', completed: true, orderIndex: 1 },
        { title: 'Check suction and discharge refrigerant pressures (R-410A)', completed: true, orderIndex: 2 },
        { title: 'Clear clogged condensate drain line trap', completed: false, orderIndex: 3 },
        { title: 'Verify temperature drops below 68°F on room sensors', completed: false, orderIndex: 4 }
      ],
      labors: [
        {
          userId: 'USR-001',
          hours: 1.5,
          hourlyRate: 45.00,
          date: new Date('2026-09-10T09:15:00Z'),
          description: 'Diagnosed thermal overload trip on compressor circuit 1'
        }
      ],
      additionalCosts: [
        {
          description: 'Refrigerant R-410A top-off (4 lbs)',
          amount: 140.00,
          category: 'Supplies',
          date: new Date('2026-09-10T09:15:00Z')
        }
      ],
      parts: [],
      comments: [
        {
          userId: 'USR-001',
          text: 'Compressor 1 had tripped on high head pressure due to condenser coil blockage. Cleaning underway.',
          createdAt: new Date('2026-09-10T09:30:00Z')
        }
      ]
    },
    {
      id: 'WO000005',
      code: 'WO000005',
      title: 'Rotary Screw Compressor 4000h Overhaul',
      description: 'Atlas Copco GA-75 rotary screw air compressor has reached 4,000 run hours. Perform major preventative service.',
      status: WorkOrderStatus.OPEN,
      priority: Priority.MEDIUM,
      locationId: 'LOC-003',
      assetId: 'AST-004',
      categoryId: 'CAT-WO-MECH',
      assignedToId: 'USR-005',
      createdById: 'USR-001',
      dueDate: new Date('2026-09-22T17:00:00Z'),
      expectedStartDate: new Date('2026-09-20T08:00:00Z'),
      estimatedDurationHours: 6.0,
      requiresSignature: true,
      tasks: [
        { title: 'Lockout/Tagout main 480V breaker', completed: false, orderIndex: 1 },
        { title: 'Drain and flush compressor oil sump', completed: false, orderIndex: 2 },
        { title: 'Replace oil separator cartridge and air intake filter', completed: false, orderIndex: 3 },
        { title: 'Grease motor bearings with OEM specified Polyrex EM', completed: false, orderIndex: 4 },
        { title: 'Test minimum pressure valve and thermostatic valve operation', completed: false, orderIndex: 5 }
      ],
      labors: [],
      additionalCosts: [],
      parts: [
        { partId: 'PRT-003', quantity: 1, unitCost: 145.00 }
      ],
      comments: []
    },
    {
      id: 'WO000006',
      code: 'WO000006',
      title: 'Hydraulic Press 200T Cylinder Seal Leak',
      description: 'Hydraulic fluid is bypassing rod seal on Komatsu 200-Ton press, causing pressure loss during stroke.',
      status: WorkOrderStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      locationId: 'LOC-003',
      assetId: 'AST-005',
      categoryId: 'CAT-WO-MECH',
      assignedToId: 'USR-005',
      createdById: 'USR-002',
      dueDate: new Date('2026-09-14T15:00:00Z'),
      expectedStartDate: new Date('2026-09-11T07:30:00Z'),
      estimatedDurationHours: 8.0,
      requiresSignature: true,
      tasks: [
        { title: 'Secure hydraulic ram with safety drop-bars', completed: true, orderIndex: 1 },
        { title: 'Depressurize accumulator manifold to 0 PSI', completed: true, orderIndex: 2 },
        { title: 'Disassemble front cylinder gland and extract damaged U-cup seal', completed: false, orderIndex: 3 },
        { title: 'Install replacement nitrile/polyurethane seal kit', completed: false, orderIndex: 4 },
        { title: 'Cycle ram 20 times under 150 ton test block and verify no weepage', completed: false, orderIndex: 5 }
      ],
      labors: [
        {
          userId: 'USR-005',
          hours: 2.0,
          hourlyRate: 50.00,
          date: new Date('2026-09-11T08:00:00Z'),
          description: 'Disassembly and safety bar placement'
        }
      ],
      additionalCosts: [],
      parts: [
        { partId: 'PRT-008', quantity: 1, unitCost: 210.00 }
      ],
      comments: [
        {
          userId: 'USR-005',
          text: 'Piston rod shows minor micro-scoring. Polished with 600 grit emery cloth. Ready for seal install.',
          createdAt: new Date('2026-09-11T09:00:00Z')
        }
      ]
    },
    {
      id: 'WO000007',
      code: 'WO000007',
      title: 'Toyota Forklift 04 Scheduled Brake Inspection',
      description: 'Quarterly brake pad thickness inspection and hydraulic mast chain lubrication for Forklift 04.',
      status: WorkOrderStatus.COMPLETED,
      priority: Priority.LOW,
      locationId: 'LOC-001',
      assetId: 'AST-010',
      categoryId: 'CAT-WO-FLEET',
      assignedToId: 'USR-003',
      createdById: 'USR-001',
      dueDate: new Date('2026-09-08T16:00:00Z'),
      expectedStartDate: new Date('2026-09-08T10:00:00Z'),
      estimatedDurationHours: 2.5,
      requiresSignature: false,
      tasks: [
        { title: 'Inspect drive wheel brake shoe friction material (min 3mm)', completed: true, orderIndex: 1 },
        { title: 'Adjust parking brake lever cable tension', completed: true, orderIndex: 2 },
        { title: 'Lubricate dual mast roller leaf chains with spray lube', completed: true, orderIndex: 3 },
        { title: 'Test regenerative braking cutoff and horn', completed: true, orderIndex: 4 }
      ],
      labors: [
        {
          userId: 'USR-003',
          hours: 2.25,
          hourlyRate: 40.00,
          date: new Date('2026-09-08T10:30:00Z'),
          description: 'Full brake overhaul and mast chain lubrication'
        }
      ],
      additionalCosts: [],
      parts: [
        { partId: 'PRT-006', quantity: 1, unitCost: 7.25 }
      ],
      comments: [
        {
          userId: 'USR-003',
          text: 'Brake linings at 5mm (good condition). Mast lubed. Returned to logistics active pool.',
          createdAt: new Date('2026-09-08T12:45:00Z')
        }
      ]
    },
    {
      id: 'WO000008',
      code: 'WO000008',
      title: 'Packaging Conveyor Line 3 Bearing Replacement',
      description: 'Drive end pillow block roller bearing showing excessive vibration (>4.5 mm/s RMS) and temperature rise.',
      status: WorkOrderStatus.OPEN,
      priority: Priority.HIGH,
      locationId: 'LOC-003',
      assetId: 'AST-008',
      categoryId: 'CAT-WO-MECH',
      assignedToId: 'USR-005',
      createdById: 'USR-002',
      dueDate: new Date('2026-09-16T17:00:00Z'),
      expectedStartDate: new Date('2026-09-14T13:00:00Z'),
      estimatedDurationHours: 3.5,
      requiresSignature: true,
      tasks: [
        { title: 'Relieve belt tension using drive screw jacks', completed: false, orderIndex: 1 },
        { title: 'Loosen shaft set screws and pull worn bearing', completed: false, orderIndex: 2 },
        { title: 'Mount replacement SKF pillow block unit and torque to 45 ft-lbs', completed: false, orderIndex: 3 },
        { title: 'Laser align pulleys and verify belt tracking', completed: false, orderIndex: 4 }
      ],
      labors: [],
      additionalCosts: [],
      parts: [
        { partId: 'PRT-007', quantity: 2, unitCost: 58.75 }
      ],
      comments: []
    },
    {
      id: 'WO000009',
      code: 'WO000009',
      title: 'Water Treatment Reverse Osmosis Membrane Flush',
      description: 'Demineralizer permeate conductivity has climbed to 45 uS/cm. Perform automated CIP acid descaling cycle.',
      status: WorkOrderStatus.COMPLETED,
      priority: Priority.MEDIUM,
      locationId: 'LOC-003',
      assetId: 'AST-009',
      categoryId: 'CAT-WO-PLUMB',
      assignedToId: 'USR-006',
      createdById: 'USR-001',
      dueDate: new Date('2026-09-05T15:00:00Z'),
      expectedStartDate: new Date('2026-09-05T08:00:00Z'),
      estimatedDurationHours: 4.0,
      requiresSignature: false,
      tasks: [
        { title: 'Isolate pure water supply header from boiler feed tanks', completed: true, orderIndex: 1 },
        { title: 'Circulate 2% citric acid cleaning solution for 90 minutes', completed: true, orderIndex: 2 },
        { title: 'Flush system with raw feed water until pH normalizes (6.8-7.2)', completed: true, orderIndex: 3 },
        { title: 'Verify permeate conductivity drops below 10 uS/cm', completed: true, orderIndex: 4 }
      ],
      labors: [
        {
          userId: 'USR-006',
          hours: 3.75,
          hourlyRate: 44.00,
          date: new Date('2026-09-05T08:30:00Z'),
          description: 'CIP wash and conductivity calibration'
        }
      ],
      additionalCosts: [
        {
          description: 'Specialty citric acid cleaning chemical drum',
          amount: 195.00,
          category: 'Chemicals',
          date: new Date('2026-09-05T08:30:00Z')
        }
      ],
      parts: [],
      comments: [
        {
          userId: 'USR-006',
          text: 'Permeate conductivity normalized at 6.2 uS/cm. Differential pressure normal.',
          createdAt: new Date('2026-09-05T12:30:00Z')
        }
      ]
    },
    {
      id: 'WO000010',
      code: 'WO000010',
      title: 'Chemical Vault Explosion-Proof Light Replacement',
      description: 'Emergency exit perimeter LED fixture inside chemical bunker flickering intermittently.',
      status: WorkOrderStatus.OPEN,
      priority: Priority.HIGH,
      locationId: 'LOC-005',
      categoryId: 'CAT-WO-ELEC',
      assignedToId: 'USR-002',
      createdById: 'USR-006',
      dueDate: new Date('2026-09-17T12:00:00Z'),
      expectedStartDate: new Date('2026-09-16T09:00:00Z'),
      estimatedDurationHours: 2.0,
      requiresSignature: true,
      tasks: [
        { title: 'Obtain hot work / hazardous environment entry permit', completed: false, orderIndex: 1 },
        { title: 'Calibrate portable 4-gas detector before entering bunker', completed: false, orderIndex: 2 },
        { title: 'De-energize lighting circuit breaker Panel C #14', completed: false, orderIndex: 3 },
        { title: 'Replace fixture with Class I Div 2 rated LED luminaire and verify seal conduit fitting', completed: false, orderIndex: 4 }
      ],
      labors: [],
      additionalCosts: [],
      parts: [
        { partId: 'PRT-010', quantity: 1, unitCost: 175.00 }
      ],
      comments: []
    }
  ];

  for (const wo of workOrdersData) {
    // Delete existing relations if re-seeding to ensure clean sync
    await prisma.workOrderTask.deleteMany({ where: { workOrderId: wo.id } });
    await prisma.laborLog.deleteMany({ where: { workOrderId: wo.id } });
    await prisma.additionalCost.deleteMany({ where: { workOrderId: wo.id } });
    await prisma.workOrderPart.deleteMany({ where: { workOrderId: wo.id } });
    await prisma.comment.deleteMany({ where: { workOrderId: wo.id } });

    await prisma.workOrder.upsert({
      where: { id: wo.id },
      update: {
        code: wo.code,
        title: wo.title,
        description: wo.description,
        status: wo.status,
        priority: wo.priority,
        locationId: wo.locationId,
        assetId: wo.assetId || null,
        categoryId: wo.categoryId,
        assignedToId: wo.assignedToId,
        createdById: wo.createdById,
        dueDate: wo.dueDate,
        expectedStartDate: wo.expectedStartDate,
        estimatedDurationHours: wo.estimatedDurationHours,
        requiresSignature: wo.requiresSignature
      },
      create: {
        id: wo.id,
        code: wo.code,
        title: wo.title,
        description: wo.description,
        status: wo.status,
        priority: wo.priority,
        locationId: wo.locationId,
        assetId: wo.assetId || null,
        categoryId: wo.categoryId,
        assignedToId: wo.assignedToId,
        createdById: wo.createdById,
        dueDate: wo.dueDate,
        expectedStartDate: wo.expectedStartDate,
        estimatedDurationHours: wo.estimatedDurationHours,
        requiresSignature: wo.requiresSignature
      }
    });

    // Create Tasks
    if (wo.tasks?.length) {
      await prisma.workOrderTask.createMany({
        data: wo.tasks.map(t => ({
          workOrderId: wo.id,
          title: t.title,
          completed: t.completed,
          orderIndex: t.orderIndex
        }))
      });
    }

    // Create Labors
    if (wo.labors?.length) {
      await prisma.laborLog.createMany({
        data: wo.labors.map(l => ({
          workOrderId: wo.id,
          userId: l.userId,
          hours: l.hours,
          hourlyRate: l.hourlyRate,
          date: l.date,
          description: l.description
        }))
      });
    }

    // Create Additional Costs
    if (wo.additionalCosts?.length) {
      await prisma.additionalCost.createMany({
        data: wo.additionalCosts.map(c => ({
          workOrderId: wo.id,
          description: c.description,
          amount: c.amount,
          category: c.category,
          date: c.date
        }))
      });
    }

    // Create Parts Used
    if (wo.parts?.length) {
      await prisma.workOrderPart.createMany({
        data: wo.parts.map(p => ({
          workOrderId: wo.id,
          partId: p.partId,
          quantity: p.quantity,
          unitCost: p.unitCost
        }))
      });
    }

    // Create Comments
    if (wo.comments?.length) {
      await prisma.comment.createMany({
        data: wo.comments.map(c => ({
          workOrderId: wo.id,
          userId: c.userId,
          text: c.text,
          createdAt: c.createdAt
        }))
      });
    }
  }

  // 11. Seed V2 Subscriptions (Hospital & Factory Tier)
  console.log('💳 Seeding V2 Subscriptions...');
  await prisma.subscription.deleteMany();
  await prisma.subscription.create({
    data: {
      id: 'SUB-HOSPITAL-01',
      tier: SubscriptionTier.HOSPITAL_FACTORY,
      maxAssets: 600,
      maxUsers: 20,
      maxLocations: 3,
      featuresEnabled: ['QR', 'WORK_ORDERS', 'PM', 'VOICE', 'BOM', 'CALIBRATION', 'AUDIT', 'WAREHOUSE_HIERARCHY'],
      startsAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true
    }
  });

  // 12. Seed V2 Warehouse Hierarchy
  console.log('🏬 Seeding V2 Warehouse Locations...');
  const whMain = await prisma.warehouseLocation.upsert({
    where: { code: 'WH-MAIN' },
    update: {},
    create: {
      code: 'WH-MAIN',
      label: 'Main Industrial & Medical Logistics Warehouse',
      level: 'WAREHOUSE',
      qrCode: 'LOC:WH-MAIN',
      colorCode: '#0284c7'
    }
  });

  const zoneA = await prisma.warehouseLocation.upsert({
    where: { code: 'ZONE-A' },
    update: {},
    create: {
      code: 'ZONE-A',
      label: 'Zone A — Biomedical & Clean Spares',
      level: 'ZONE',
      qrCode: 'LOC:ZONE-A',
      colorCode: '#10b981',
      parentId: whMain.id
    }
  });

  const rack01 = await prisma.warehouseLocation.upsert({
    where: { code: 'RACK-A01' },
    update: {},
    create: {
      code: 'RACK-A01',
      label: 'Rack A01 — Sterile Sensors & Filters',
      level: 'RACK',
      qrCode: 'LOC:RACK-A01',
      parentId: zoneA.id
    }
  });

  const bin01 = await prisma.warehouseLocation.upsert({
    where: { code: 'BIN-A01-01' },
    update: {},
    create: {
      code: 'BIN-A01-01',
      label: 'Bin A-01-01 (Top Shelf)',
      level: 'BIN',
      qrCode: 'LOC:BIN-A01-01',
      parentId: rack01.id
    }
  });

  // 13. Update parts with ABC Class and Locations
  console.log('📦 Updating Parts with ABC Class & Warehouse Locations...');
  const allParts = await prisma.part.findMany();
  for (let i = 0; i < allParts.length; i++) {
    const p = allParts[i];
    const abc = i % 3 === 0 ? ABCClass.A_CRITICAL : (i % 3 === 1 ? ABCClass.B_ESSENTIAL : ABCClass.C_GENERAL);
    await prisma.part.update({
      where: { id: p.id },
      data: {
        abcClass: abc,
        warehouseLocationId: bin01.id
      }
    });
  }

  // 14. Update assets with Life File data (HCAC / JCI)
  console.log('🏥 Updating Assets with Life File & Risk Levels...');
  const allAssets = await prisma.asset.findMany();
  for (let i = 0; i < allAssets.length; i++) {
    const a = allAssets[i];
    const risk = i % 3 === 0 ? RiskLevel.HIGH : (i % 3 === 1 ? RiskLevel.MEDIUM : RiskLevel.LOW);
    await prisma.asset.update({
      where: { id: a.id },
      data: {
        riskLevel: risk,
        purchaseDate: new Date('2023-01-15'),
        purchasePrice: (i + 1) * 4500,
        warrantyExpiry: new Date('2027-01-15'),
        manufacturer: 'Dräger / Carrier Medical & Industrial Systems'
      }
    });
  }

  // 15. Seed BOM & Calibrations
  console.log('🔬 Seeding BOM & Medical Calibration Records...');
  if (allAssets.length > 0 && allParts.length > 0) {
    const targetAsset = allAssets[0];
    await prisma.assetBOM.deleteMany({ where: { assetId: targetAsset.id } });
    await prisma.assetBOM.create({
      data: {
        assetId: targetAsset.id,
        partId: allParts[0].id,
        quantityNeeded: 2,
        notes: 'Critical replacement every 6 months per HCAC clinical standard'
      }
    });

    await prisma.calibrationRecord.deleteMany({ where: { assetId: targetAsset.id } });
    await prisma.calibrationRecord.create({
      data: {
        assetId: targetAsset.id,
        calibrationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        nextDueDate: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000),
        vendor: 'Jordan National Metrology & Calibration Institute',
        result: 'PASS',
        certificateUrl: 'https://cert.metrology.gov.jo/CAL-2026-9901.pdf',
        notes: 'Passed ISO 17025 precision tolerance test without deviation.'
      }
    });

    // 16. Seed AuditLog
    console.log('📋 Seeding Immutable Audit Logs...');
    await prisma.auditLog.create({
      data: {
        action: AuditAction.CALIBRATION,
        entityType: 'Asset',
        entityId: targetAsset.id,
        userId: usersData[0].id,
        assetId: targetAsset.id,
        newValue: 'Annual medical calibration completed (Result: PASS, Valid 12 months)'
      }
    });
  }

  console.log('✅ NASH CMMS Database Seeding Completed Successfully!');
  console.log('📊 Summary:');
  console.log(`   - Users: ${usersData.length}`);
  console.log(`   - Locations: ${locationsData.length}`);
  console.log(`   - Categories: ${categoriesData.length}`);
  console.log(`   - Assets: ${assetsData.length}`);
  console.log(`   - Parts: ${partsData.length}`);
  console.log(`   - Vendors: ${vendorsData.length}`);
  console.log(`   - PM Schedules: ${pmsData.length}`);
  console.log(`   - Requests: ${requestsData.length}`);
  console.log(`   - Meters: ${metersData.length}`);
  console.log(`   - Work Orders: ${workOrdersData.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed with error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
