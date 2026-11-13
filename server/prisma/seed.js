// HANSAI SHIPPING LINE — Complete Realistic Seed Script
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function seedDatabase() {
  console.log('--- Cleaning existing database records ---');
  // Order of deletion to avoid foreign key constraints
  await prisma.auditLog.deleteMany();
  await prisma.calculatorHistory.deleteMany();
  await prisma.tHCTransaction.deleteMany();
  await prisma.taxTransaction.deleteMany();
  await prisma.taxConfiguration.deleteMany();
  await prisma.exchangeRate.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.financialTransaction.deleteMany();
  await prisma.document.deleteMany();
  await prisma.shipmentTracking.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.rentalPayment.deleteMany();
  await prisma.containerRental.deleteMany();
  await prisma.containerSale.deleteMany();
  await prisma.containerPurchase.deleteMany();
  await prisma.maintenance.deleteMany();
  await prisma.container.deleteMany();
  await prisma.vesselSchedule.deleteMany();
  await prisma.vesselSurvey.deleteMany();
  await prisma.vesselDocument.deleteMany();
  await prisma.vesselOperationalExpense.deleteMany();
  await prisma.vesselMaintenance.deleteMany();
  await prisma.vesselSale.deleteMany();
  await prisma.vesselPurchase.deleteMany();
  await prisma.vesselSpecification.deleteMany();
  await prisma.vessel.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();

  console.log('--- Seeding Roles & Permissions ---');
  const roles = [
    {
      name: 'Super Admin',
      description: 'Full system privileges across all corporate divisions and configuration',
      permissions: JSON.stringify(['all']),
      isSystem: true,
    },
    {
      name: 'Administrator',
      description: 'Operational and commercial administration, user accounts, and master data',
      permissions: JSON.stringify(['view:all', 'edit:all', 'delete:operations', 'finance:manage']),
      isSystem: true,
    },
    {
      name: 'Finance Manager',
      description: 'Full financial accounting, invoicing, tax, cashflow, P&L, and audits',
      permissions: JSON.stringify(['finance:all', 'invoice:all', 'reports:finance', 'tax:all']),
      isSystem: true,
    },
    {
      name: 'Shipping Manager',
      description: 'Shipment operations, B/L documentation, vessel schedules, and logistics',
      permissions: JSON.stringify(['shipment:all', 'vessel:schedule', 'tracking:all', 'reports:shipping']),
      isSystem: true,
    },
    {
      name: 'Container Manager',
      description: 'Container depot inventory, rentals, leasing contracts, purchase & sales',
      permissions: JSON.stringify(['container:all', 'rental:all', 'containertrade:all']),
      isSystem: true,
    },
    {
      name: 'Operational Staff',
      description: 'Daily data entry, tracking status updates, and container movements',
      permissions: JSON.stringify(['shipment:read', 'shipment:update', 'container:read', 'tracking:update']),
      isSystem: true,
    },
    {
      name: 'Viewer',
      description: 'Read-only access to executive dashboards, reports, and tracking',
      permissions: JSON.stringify(['view:read']),
      isSystem: true,
    },
  ];

  for (const r of roles) {
    await prisma.role.create({ data: r });
  }

  console.log('--- Seeding Users with Secure Passwords ---');
  const passwordHash = await bcrypt.hash('hansai123', 10);
  const ceoPasswordHash = await bcrypt.hash('Cendoldawet28', 10);
  const users = [
    {
      email: 'anselvarian@gmail.com',
      password: ceoPasswordHash,
      name: 'Hansel Varian',
      role: 'Super Admin',
      department: 'Chief Executive Officer',
      phone: '+62 811-928-4401',
    },
    {
      email: 'finance@hansai.com',
      password: passwordHash,
      name: 'Siti Nurhaliza, CPA',
      role: 'Finance Manager',
      department: 'Treasury & Financial Planning',
      phone: '+62 812-345-6789',
    },
    {
      email: 'shipping@hansai.com',
      password: passwordHash,
      name: 'Budi Santoso',
      role: 'Shipping Manager',
      department: 'Fleet & Shipping Operations',
      phone: '+62 813-888-9900',
    },
    {
      email: 'container@hansai.com',
      password: passwordHash,
      name: 'Darmawan Kusuma',
      role: 'Container Manager',
      department: 'Container Equipment & Logistics',
      phone: '+62 815-777-1234',
    },
    {
      email: 'staff@hansai.com',
      password: passwordHash,
      name: 'Maya Indriani',
      role: 'Operational Staff',
      department: 'Documentation & Customer Support',
      phone: '+62 817-222-3344',
    },
    {
      email: 'viewer@hansai.com',
      password: passwordHash,
      name: 'David Tan (Auditor)',
      role: 'Viewer',
      department: 'External Audit & Board Review',
      phone: '+65 9123-4567',
    },
  ];

  const createdUsers = [];
  for (const u of users) {
    createdUsers.push(await prisma.user.create({ data: u }));
  }

  console.log('--- Seeding Exchange Rates ---');
  const exchangeRates = [
    { baseCurrency: 'USD', targetCurrency: 'IDR', rate: 16250.0 },
    { baseCurrency: 'USD', targetCurrency: 'EUR', rate: 0.92 },
    { baseCurrency: 'USD', targetCurrency: 'SGD', rate: 1.34 },
    { baseCurrency: 'USD', targetCurrency: 'CNY', rate: 7.23 },
    { baseCurrency: 'USD', targetCurrency: 'INR', rate: 84.15 },
    { baseCurrency: 'USD', targetCurrency: 'AED', rate: 3.67 },
    { baseCurrency: 'USD', targetCurrency: 'MYR', rate: 4.45 },
  ];
  for (const er of exchangeRates) {
    await prisma.exchangeRate.create({ data: er });
  }

  console.log('--- Seeding Tax Configurations ---');
  const taxConfigs = [
    {
      code: 'BM_GENERAL',
      name: 'Bea Masuk Standard Import Duty',
      category: 'Import Duty',
      ratePercent: 5.0,
      taxBaseFormula: 'CIF',
      description: 'General tariff for industrial commodities (HS 84-85)',
    },
    {
      code: 'PPN_IMPORT',
      name: 'Pajak Pertambahan Nilai (PPN) Impor',
      category: 'Import VAT',
      ratePercent: 11.0,
      taxBaseFormula: 'CIF+BM',
      description: 'Standard Indonesian VAT applied to import CIF + Duty value',
    },
    {
      code: 'PPH22_IMPORT_API',
      name: 'PPh Pasal 22 Impor (Angka Pengenal Importir)',
      category: 'Income Tax',
      ratePercent: 2.5,
      taxBaseFormula: 'CIF+BM',
      description: 'Withholding income tax for licensed API importers',
    },
    {
      code: 'PPH22_IMPORT_NON_API',
      name: 'PPh Pasal 22 Impor (Non-API)',
      category: 'Income Tax',
      ratePercent: 7.5,
      taxBaseFormula: 'CIF+BM',
      description: 'Withholding tax for non-licensed importers',
    },
    {
      code: 'PPH23_FREIGHT',
      name: 'PPh Pasal 23 Jasa Forwarding & Sewa',
      category: 'Income Tax',
      ratePercent: 2.0,
      taxBaseFormula: 'Gross Freight',
      description: 'Domestic freight forwarding and container rental withholding',
    },
  ];
  for (const tc of taxConfigs) {
    await prisma.taxConfiguration.create({ data: tc });
  }

  console.log('--- Seeding 30 Customers ---');
  const customerList = [
    { companyName: 'PT Indofood Sukses Makmur Tbk', contactPerson: 'Agus Wijaya', email: 'procurement@indofood.co.id', phone: '+62 21 5795 8822', address: 'Sudirman Plaza, Indofood Tower 23rd Fl, Jakarta', country: 'Indonesia', customerType: 'Corporate', creditLimit: 250000, outstandingBalance: 42500 },
    { companyName: 'PT Astra International Logistics', contactPerson: 'Linda Kurnia', email: 'freight@astra.co.id', phone: '+62 21 6522 555', address: 'Menara Astra, Jl. Jend. Sudirman Kav 5-6, Jakarta', country: 'Indonesia', customerType: 'Corporate', creditLimit: 500000, outstandingBalance: 88000 },
    { companyName: 'Siam Cement Global Trading Pte Ltd', contactPerson: 'Somchai Prasert', email: 'logistics@scgtrading.sg', phone: '+65 6789 1234', address: '10 Marina Boulevard, Marina Bay Financial Centre, Singapore', country: 'Singapore', customerType: 'Trader', creditLimit: 300000, outstandingBalance: 24500 },
    { companyName: 'Emirates Petrochem FZE', contactPerson: 'Rashid Al-Maktoum', email: 'supply@emiratespetro.ae', phone: '+971 4 881 5566', address: 'Jebel Ali Free Zone, South Zone 2, Dubai', country: 'United Arab Emirates', customerType: 'Corporate', creditLimit: 400000, outstandingBalance: 65000 },
    { companyName: 'Tata Steel Global Logistics Ltd', contactPerson: 'Rajesh Sharma', email: 'shipping@tatasteel.com', phone: '+91 22 6665 8282', address: 'Bombay House, 24 Homi Mody Street, Mumbai', country: 'India', customerType: 'Corporate', creditLimit: 350000, outstandingBalance: 32000 },
    { companyName: 'Sinochem International Corp', contactPerson: 'Zhang Wei', email: 'supplychain@sinochem.com.cn', phone: '+86 21 6100 8888', address: 'Pudong New Area, Century Avenue 800, Shanghai', country: 'China', customerType: 'Trader', creditLimit: 450000, outstandingBalance: 95000 },
    { companyName: 'Sime Darby Plantation Berhad', contactPerson: 'Nor Faridah', email: 'exports@simedarby.com', phone: '+60 3 7848 4000', address: 'Main Tower, Oasis Square, Ara Damansara, Petaling Jaya', country: 'Malaysia', customerType: 'Corporate', creditLimit: 200000, outstandingBalance: 18000 },
    { companyName: 'Saudi Basic Industries Corp (SABIC)', contactPerson: 'Faisal Al-Otaibi', email: 'freight@sabic.com', phone: '+966 11 225 8000', address: 'SABIC HQ, Airport Road, Riyadh', country: 'Saudi Arabia', customerType: 'Corporate', creditLimit: 600000, outstandingBalance: 120000 },
    { companyName: 'PT Mayora Indah Tbk', contactPerson: 'Kevin Gunawan', email: 'export.sales@mayora.co.id', phone: '+62 21 5655 318', address: 'Gedung Mayora, Jl. Tomang Raya 21-23, Jakarta Barat', country: 'Indonesia', customerType: 'Corporate', creditLimit: 180000, outstandingBalance: 12500 },
    { companyName: 'Reliance Industries Logistics', contactPerson: 'Amit Patel', email: 'shipping.dept@ril.com', phone: '+91 22 3555 5000', address: 'Maker Chambers IV, Nariman Point, Mumbai', country: 'India', customerType: 'Corporate', creditLimit: 400000, outstandingBalance: 54000 },
    { companyName: 'PT Semen Indonesia (Persero) Tbk', contactPerson: 'Bambang Soediro', email: 'logistics@sig.id', phone: '+62 31 398 1732', address: 'South Quarter Tower A, Jl. TB Simatupang, Jakarta', country: 'Indonesia', customerType: 'Corporate', creditLimit: 300000, outstandingBalance: 31000 },
    { companyName: 'Wilmar International Limited', contactPerson: 'Grace Lim', email: 'shipping@wilmar-intl.com', phone: '+65 6216 0244', address: '28 Biopolis Road, Singapore', country: 'Singapore', customerType: 'Corporate', creditLimit: 500000, outstandingBalance: 46000 },
    { companyName: 'PT Kalbe Farma Tbk', contactPerson: 'Dr. Diana Kusuma', email: 'import.pharma@kalbe.co.id', phone: '+62 21 4287 3888', address: 'Jl. Let. Jend Suprapto Kav 4, Cempaka Putih, Jakarta', country: 'Indonesia', customerType: 'Corporate', creditLimit: 150000, outstandingBalance: 8500 },
    { companyName: 'Zhejiang Rongsheng Chemical Co', contactPerson: 'Chen Liang', email: 'freight@rongsheng.com', phone: '+86 571 8286 1111', address: 'Xiaoshan Economic Development Zone, Hangzhou', country: 'China', customerType: 'Corporate', creditLimit: 350000, outstandingBalance: 72000 },
    { companyName: 'Al-Jomaih Holdings Ltd', contactPerson: 'Mansoor Al-Hassan', email: 'cargo@aljomaih.com.sa', phone: '+966 13 898 0000', address: 'King Abdulaziz Road, Al-Khobar', country: 'Saudi Arabia', customerType: 'Trader', creditLimit: 250000, outstandingBalance: 41000 },
    { companyName: 'PT Gudang Garam Tbk', contactPerson: 'Handoko Sutanto', email: 'supplychain@gudanggaramtbk.com', phone: '+62 354 682 000', address: 'Jl. Semampir II/1, Kediri, Jawa Timur', country: 'Indonesia', customerType: 'Corporate', creditLimit: 220000, outstandingBalance: 15000 },
    { companyName: 'Petronas Chemical Marketing Ltd', contactPerson: 'Hazwan Azman', email: 'petchem.ship@petronas.com', phone: '+60 3 2051 5000', address: 'Tower 1, PETRONAS Twin Towers, Kuala Lumpur', country: 'Malaysia', customerType: 'Corporate', creditLimit: 400000, outstandingBalance: 61000 },
    { companyName: 'DP World Container Services', contactPerson: 'Tariq Mansour', email: 'container.ops@dpworld.com', phone: '+971 4 889 7000', address: 'DP World Head Office, JAFZA, Dubai', country: 'United Arab Emirates', customerType: 'Freight Forwarder', creditLimit: 500000, outstandingBalance: 89000 },
    { companyName: 'PT Unilever Indonesia Tbk', contactPerson: 'Fitri Handayani', email: 'logistics.id@unilever.com', phone: '+62 21 8082 7000', address: 'Grha Unilever, Green Office Park Kav 3, BSD City', country: 'Indonesia', customerType: 'Corporate', creditLimit: 350000, outstandingBalance: 29000 },
    { companyName: 'Adani Logistics Limited', contactPerson: 'Vikas Deshmukh', email: 'freight@adani.com', phone: '+91 79 2656 5555', address: 'Adani Shantigram, S.G. Highway, Ahmedabad', country: 'India', customerType: 'Freight Forwarder', creditLimit: 400000, outstandingBalance: 52000 },
    { companyName: 'PT Charoen Pokphand Indonesia', contactPerson: 'Erwin Susanto', email: 'feed.import@cp.co.id', phone: '+62 21 691 9999', address: 'Jl. Ancol Barat VIII No. 1, Jakarta Utara', country: 'Indonesia', customerType: 'Corporate', creditLimit: 250000, outstandingBalance: 34000 },
    { companyName: 'COSCO Shipping Logistics (SG)', contactPerson: 'Wang Qiang', email: 'booking@cosco.com.sg', phone: '+65 6323 1188', address: 'Suntec Tower 2, 9 Temasek Boulevard, Singapore', country: 'Singapore', customerType: 'Freight Forwarder', creditLimit: 300000, outstandingBalance: 44000 },
    { companyName: 'PT Krakatau Steel (Persero) Tbk', contactPerson: 'Didik Prasetyo', email: 'purchasing@krakatausteel.com', phone: '+62 254 392 000', address: 'Krakatau Industrial Estate, Cilegon, Banten', country: 'Indonesia', customerType: 'Corporate', creditLimit: 350000, outstandingBalance: 59000 },
    { companyName: 'Qingdao Port Logistics Co Ltd', contactPerson: 'Liu Tao', email: 'qingdaofreight@qdport.com', phone: '+86 532 8298 2000', address: 'Gangji Road, Shibei District, Qingdao', country: 'China', customerType: 'Freight Forwarder', creditLimit: 280000, outstandingBalance: 22000 },
    { companyName: 'Larsen & Toubro Heavy Eng', contactPerson: 'Ramesh Nair', email: 'he-shipping@larsentoubro.com', phone: '+91 22 6752 5656', address: 'L&T House, Ballard Estate, Mumbai', country: 'India', customerType: 'Corporate', creditLimit: 450000, outstandingBalance: 78000 },
    { companyName: 'Gulf Stevedoring Contracting Co', contactPerson: 'Waleed Al-Ghamdi', email: 'ops@gscargo.sa', phone: '+966 12 647 1111', address: 'Jeddah Islamic Port Gate 3, Jeddah', country: 'Saudi Arabia', customerType: 'Freight Forwarder', creditLimit: 200000, outstandingBalance: 16000 },
    { companyName: 'PT Japfa Comfeed Indonesia Tbk', contactPerson: 'Antonius Teddy', email: 'shipping@japfacomfeed.co.id', phone: '+62 21 5316 8888', address: 'Wisma Millenia 7th Fl, Jl. MT Haryono Kav 16, Jakarta', country: 'Indonesia', customerType: 'Corporate', creditLimit: 200000, outstandingBalance: 19500 },
    { companyName: 'Keppel Logistics Pte Ltd', contactPerson: 'Tan Chong Meng', email: 'logistics@keppellog.com', phone: '+65 6861 6800', address: '7 Gul Circle, Jurong Industrial Estate, Singapore', country: 'Singapore', customerType: 'Freight Forwarder', creditLimit: 300000, outstandingBalance: 28000 },
    { companyName: 'PT Petrosea Tbk Logistics', contactPerson: 'Eko Sudrajat', email: 'ops.logistics@petrosea.com', phone: '+62 21 7583 0101', address: 'Indy Bintaro Office Park, Sektor VII Bintaro Jaya', country: 'Indonesia', customerType: 'Corporate', creditLimit: 250000, outstandingBalance: 37000 },
    { companyName: 'Al-Futtaim Logistics LLC', contactPerson: 'Ibrahim Khalil', email: 'customer@aflogistics.ae', phone: '+971 4 881 9999', address: 'Jebel Ali South, Plot S20202, Dubai', country: 'United Arab Emirates', customerType: 'Freight Forwarder', creditLimit: 350000, outstandingBalance: 48000 },
  ];

  const createdCustomers = [];
  for (const c of customerList) {
    createdCustomers.push(await prisma.customer.create({ data: c }));
  }

  console.log('--- Seeding 20 Suppliers ---');
  const supplierList = [
    { companyName: 'Singamas Container Holdings Ltd', contactPerson: 'Wong Ka Fai', email: 'sales@singamas.com', phone: '+852 2598 7831', address: 'Hong Kong Plaza, 188 Connaught Rd, Hong Kong', country: 'Hong Kong', serviceType: 'Container Depot', paymentTerms: 'Net 30' },
    { companyName: 'CIMC Containers Co Ltd', contactPerson: 'Li Jun', email: 'cimc.sales@cimc.com', phone: '+86 755 2669 1130', address: 'CIMC R&D Center, Shekou, Shenzhen', country: 'China', serviceType: 'Container Depot', paymentTerms: 'Net 45' },
    { companyName: 'PT PAL Indonesia (Persero)', contactPerson: 'Ir. Suryo Atmojo', email: 'shiprepair@pal.co.id', phone: '+62 31 329 2275', address: 'Ujung Surabaya, Jawa Timur', country: 'Indonesia', serviceType: 'Shipyard', paymentTerms: 'Net 30' },
    { companyName: 'Batam Shipyard & Marine Engineering', contactPerson: 'Teddy Sanjaya', email: 'docking@batam-marine.com', phone: '+62 778 392 888', address: 'Tanjung Uncang Industrial Area, Batam', country: 'Indonesia', serviceType: 'Shipyard', paymentTerms: 'Net 30' },
    { companyName: 'PT Samudera Indonesia Tbk (Feeder)', contactPerson: 'Rizal Iskandar', email: 'feeder.ops@samudera.id', phone: '+62 21 548 0088', address: 'Samudera Building, Jl. Letjen S. Parman Kav 35, Jakarta', country: 'Indonesia', serviceType: 'Feeder', paymentTerms: 'Net 15' },
    { companyName: 'PSA Singapore Feeder Services', contactPerson: 'Michael Neo', email: 'feeder@globalpsa.com', phone: '+65 6274 7111', address: 'PSA Horizons, 1 Harbour Drive, Singapore', country: 'Singapore', serviceType: 'Feeder', paymentTerms: 'Net 30' },
    { companyName: 'Biro Klasifikasi Indonesia (BKI)', contactPerson: 'Capt. Bambang M.', email: 'survey@bki.co.id', phone: '+62 21 430 1017', address: 'Jl. Yos Sudarso No. 38-40, Tanjung Priok, Jakarta', country: 'Indonesia', serviceType: 'Surveyor', paymentTerms: 'Net 15' },
    { companyName: 'Lloyds Register Asia Marine', contactPerson: 'Capt. Robert Jenkins', email: 'singapore.survey@lr.org', phone: '+65 6278 9444', address: '1 Fusionopolis Place, Galaxis, Singapore', country: 'Singapore', serviceType: 'Surveyor', paymentTerms: 'Net 30' },
    { companyName: 'PT Pelabuhan Indonesia (Pelindo IV/II)', contactPerson: 'Herman Prasetyo', email: 'marine.services@pelindo.co.id', phone: '+62 21 430 1080', address: 'Gedung Pelindo, Jl. Pasoso No. 1, Tanjung Priok', country: 'Indonesia', serviceType: 'Shipping Line', paymentTerms: 'Net 15' },
    { companyName: 'Jurong Port Marine Services', contactPerson: 'Desmond Koh', email: 'ops@jp.com.sg', phone: '+65 6265 0666', address: '37 Jurong Port Road, Singapore', country: 'Singapore', serviceType: 'Shipping Line', paymentTerms: 'Net 30' },
    { companyName: 'PT Djakarta Lloyd (Persero)', contactPerson: 'Rachman Hakim', email: 'fleet@djakartalloyd.co.id', phone: '+62 21 345 6201', address: 'Jl. Senen Raya No. 44, Jakarta Pusat', country: 'Indonesia', serviceType: 'Shipping Line', paymentTerms: 'Net 30' },
    { companyName: 'PT Pertamina Trans Kontinental', contactPerson: 'Budi Santosa', email: 'charter.marine@pertamina.com', phone: '+62 21 3192 3000', address: 'Jl. Cikini Raya No. 84-86, Menteng, Jakarta', country: 'Indonesia', serviceType: 'Shipping Line', paymentTerms: 'Net 30' },
    { companyName: 'Nantong CIMC Heavy Industry Ltd', contactPerson: 'Huang Jing', email: 'marine.sales@nantong-cimc.cn', phone: '+86 513 8599 8000', address: 'Gangzha District, Nantong, Jiangsu', country: 'China', serviceType: 'Shipyard', paymentTerms: 'Net 60' },
    { companyName: 'Dubai Drydocks World FZC', contactPerson: 'Sultan Al-Suwaidi', email: 'contracts@drydocks.gov.ae', phone: '+971 4 345 0626', address: 'Al Mina Road, Dubai Maritime City, Dubai', country: 'United Arab Emirates', serviceType: 'Shipyard', paymentTerms: 'Net 30' },
    { companyName: 'Cochin Shipyard Limited', contactPerson: 'Sunil Kumar', email: 'commercial@cochinshipyard.in', phone: '+91 484 250 1200', address: 'Perumanoor PO, Kochi, Kerala', country: 'India', serviceType: 'Shipyard', paymentTerms: 'Net 45' },
    { companyName: 'PT Mitra Bahari Sentosa (Bunker)', contactPerson: 'Dedi Kurniawan', email: 'bunker@mitrabahari.co.id', phone: '+62 21 4393 2100', address: 'Jl. Enggano No. 12, Tanjung Priok, Jakarta', country: 'Indonesia', serviceType: 'Shipping Line', paymentTerms: 'Net 15' },
    { companyName: 'Sea Consortium Pte Ltd (X-Press)', contactPerson: 'Arun George', email: 'ops@sea-consortium.com', phone: '+65 6839 8888', address: '11 Keppel Road, ABI Plaza, Singapore', country: 'Singapore', serviceType: 'Feeder', paymentTerms: 'Net 30' },
    { companyName: 'PT Caraka Yasa Trucking Services', contactPerson: 'Wahyu Hidayat', email: 'dispatch@carakayasa.com', phone: '+62 21 435 0099', address: 'Jl. Cakung Cilincing Km 3, Jakarta Timur', country: 'Indonesia', serviceType: 'Trucking', paymentTerms: 'Net 15' },
    { companyName: 'Intertek Marine Testing Services', contactPerson: 'Goh Boon Huat', email: 'marine.sg@intertek.com', phone: '+65 6777 5611', address: '200 Cantonment Road, Singapore', country: 'Singapore', serviceType: 'Surveyor', paymentTerms: 'Net 30' },
    { companyName: 'PT Waruna Nusa Sentana Shipyard', contactPerson: 'Alexander Wong', email: 'docking@waruna-group.com', phone: '+62 61 685 1000', address: 'Belawan Industrial Estate, Medan, Sumatera Utara', country: 'Indonesia', serviceType: 'Shipyard', paymentTerms: 'Net 30' },
  ];

  const createdSuppliers = [];
  for (const s of supplierList) {
    createdSuppliers.push(await prisma.supplier.create({ data: s }));
  }

  console.log('--- Seeding 100 Containers ---');
  const containerTypes = [
    '20FT Standard',
    '40FT Standard',
    '40FT High Cube',
    '20FT Refrigerated',
    '40FT Refrigerated',
    'Open Top',
    'Flat Rack',
  ];
  const locations = [
    'Jakarta Tanjung Priok Depot',
    'Surabaya Teluk Lamong Depot',
    'Batam Kabil Depot',
    'Singapore Keppel Distripark',
    'Port Klang Northport',
    'Shanghai Yangshan Terminal',
    'Dubai Jebel Ali Depot',
  ];
  const conditions = [
    'Brand New',
    'IICL Standard',
    'Cargo Worthy (CW)',
    'Wind & Water Tight (WWT)',
    'Fair Condition',
  ];
  const statuses = [
    'Available',
    'Rented',
    'In Transit',
    'Available',
    'Under Maintenance',
    'Rented',
    'Sold',
  ];

  const createdContainers = [];
  for (let i = 1; i <= 100; i++) {
    const type = containerTypes[(i - 1) % containerTypes.length];
    const padded = String(200000 + i).padStart(6, '0');
    const checkDigit = (i % 9) + 1;
    const containerNumber = `HNSU-${padded}-${checkDigit}`;
    const status = i > 85 ? 'Sold' : statuses[i % statuses.length];
    const loc = locations[i % locations.length];
    const cond = conditions[i % conditions.length];

    let basePrice = 2800;
    if (type.includes('40FT High Cube')) basePrice = 4500;
    else if (type.includes('40FT')) basePrice = 4200;
    else if (type.includes('Refrigerated')) basePrice = 14500;
    else if (type.includes('Flat') || type.includes('Open')) basePrice = 5200;

    const purchaseDate = new Date(Date.now() - (i * 12 + 100) * 86400000);
    const lastInsp = new Date(Date.now() - (i % 30 + 5) * 86400000);
    const nextMaint = new Date(Date.now() + (60 - (i % 45)) * 86400000);

    const c = await prisma.container.create({
      data: {
        containerNumber,
        containerType: type,
        owner: 'HANSAI SHIPPING LINE',
        purchaseDate,
        purchasePrice: basePrice,
        currentValue: status === 'Sold' ? 0 : Math.round(basePrice * 0.88),
        condition: cond,
        currentLocation: loc,
        status,
        lastInspection: lastInsp,
        nextMaintenance: nextMaint,
        notes: `Inspected under ISO/IICL-6 standard. Unit #${i}`,
      },
    });
    createdContainers.push(c);
  }

  console.log('--- Seeding 15 Container Rentals ---');
  const rentalStatuses = ['Active', 'Active', 'Active', 'Returned', 'Overdue'];
  const createdRentals = [];
  for (let r = 0; r < 15; r++) {
    const cust = createdCustomers[r % createdCustomers.length];
    const cont = createdContainers[r * 3 + 1]; // pick rented containers
    const rate = cont.containerType.includes('Refrigerated') ? 450 : cont.containerType.includes('40') ? 220 : 140;
    const durationDays = 30 + (r * 15);
    const startDate = new Date(Date.now() - (r * 8 + 10) * 86400000);
    const endDate = new Date(startDate.getTime() + durationDays * 86400000);
    const isOverdue = r === 4 || r === 9;
    const status = isOverdue ? 'Overdue' : (r % 4 === 0 ? 'Returned' : 'Active');
    const lateDays = isOverdue ? 12 : 0;
    const lateFee = lateDays * 15;
    const damageFee = r === 2 ? 150 : 0;
    const total = (rate * Math.round(durationDays / 30)) + lateFee + damageFee;
    const paid = status === 'Returned' ? total : total * 0.6;
    const outstanding = total - paid;

    const rental = await prisma.containerRental.create({
      data: {
        contractNumber: `RNT-2026-${String(r + 1).padStart(3, '0')}`,
        customerId: cust.id,
        containerId: cont.id,
        startDate,
        endDate: isOverdue ? new Date(Date.now() - 5 * 86400000) : endDate,
        returnDate: status === 'Returned' ? new Date() : null,
        rateType: 'Monthly',
        rentalRate: rate,
        depositAmount: rate * 1.5,
        lateFeePerDay: 15,
        calculatedLateFee: lateFee,
        damageCharges: damageFee,
        totalRentalAmount: total,
        paidAmount: paid,
        outstandingAmount: outstanding,
        status,
        paymentStatus: outstanding <= 0 ? 'Paid' : (paid > 0 ? 'Partial' : 'Pending'),
        notes: `Commercial leasing agreement for project logistics.`,
      },
    });
    createdRentals.push(rental);

    // Create rental payment record
    if (paid > 0) {
      await prisma.rentalPayment.create({
        data: {
          rentalId: rental.id,
          paymentDate: new Date(startDate.getTime() + 2 * 86400000),
          amount: paid,
          paymentMethod: 'Bank Transfer',
          referenceNumber: `PAY-RNT-${String(r + 1).padStart(4, '0')}`,
          notes: 'Advance deposit & 1st month rental settlement',
        },
      });
    }
  }

  console.log('--- Seeding 20 Container Purchases ---');
  for (let p = 0; p < 20; p++) {
    const supp = createdSuppliers[p % createdSuppliers.length];
    const type = containerTypes[p % containerTypes.length];
    const price = type.includes('Refrigerated') ? 13500 : (type.includes('40') ? 4100 : 2600);
    const transport = 250;
    const inspect = 120;
    const repair = p % 3 === 0 ? 350 : 0;
    const other = 80;
    const totalAcq = price + transport + inspect + repair + other;

    await prisma.containerPurchase.create({
      data: {
        purchaseNumber: `CPO-2026-${String(p + 1).padStart(3, '0')}`,
        supplierId: supp.id,
        containerNumber: `HNSU-2048${String(p + 10).padStart(2, '0')}-9`,
        containerType: type,
        condition: 'Cargo Worthy (CW)',
        purchaseDate: new Date(Date.now() - (p * 15 + 20) * 86400000),
        purchasePrice: price,
        transportationCost: transport,
        inspectionCost: inspect,
        repairCost: repair,
        otherCosts: other,
        totalAcquisitionCost: totalAcq,
        paymentStatus: p % 5 === 0 ? 'Partial' : 'Paid',
        notes: `Batch equipment acquisition from ${supp.companyName}`,
      },
    });
  }

  console.log('--- Seeding 15 Container Sales ---');
  for (let s = 0; s < 15; s++) {
    const buyer = createdCustomers[(s + 5) % createdCustomers.length];
    const cont = createdContainers[85 + s]; // use containers marked as Sold
    const acqCost = cont.purchasePrice + 350;
    const sellingPrice = Math.round(acqCost * 1.35);
    const delivery = 200;
    const other = 100;
    const totalRev = sellingPrice;
    const grossProfit = sellingPrice - acqCost - delivery - other;

    await prisma.containerSale.create({
      data: {
        saleNumber: `CSL-2026-${String(s + 1).padStart(3, '0')}`,
        buyerId: buyer.id,
        containerId: cont.id,
        containerNumber: cont.containerNumber,
        containerType: cont.containerType,
        salesDate: new Date(Date.now() - (s * 10 + 5) * 86400000),
        sellingPrice,
        deliveryCost: delivery,
        otherCosts: other,
        totalSalesRevenue: totalRev,
        acquisitionCost: acqCost,
        grossProfit,
        paymentStatus: s % 4 === 0 ? 'Partial' : 'Paid',
        notes: `Equipment trading sale to ${buyer.companyName}. Transfer of ownership certificate issued.`,
      },
    });
  }

  console.log('--- Seeding 20 Container Maintenance Records ---');
  for (let m = 0; m < 20; m++) {
    const cont = createdContainers[m * 4];
    await prisma.maintenance.create({
      data: {
        containerId: cont.id,
        serviceType: m % 2 === 0 ? 'Container Floor & Wall Repair' : 'Pre-Trip Inspection (PTI) & Reefer Unit Refill',
        cost: m % 2 === 0 ? 320 : 650,
        serviceDate: new Date(Date.now() - (m * 7 + 10) * 86400000),
        completionDate: new Date(Date.now() - (m * 7 + 8) * 86400000),
        serviceProvider: 'PT Samudera Container Depot Services',
        status: 'Completed',
        notes: `Routine structural and safety maintenance completed under ISO standards.`,
      },
    });
  }

  console.log('--- Seeding 29 Vessels (Module 21) across all 7 Categories ---');
  // 5 Tugboats, 5 Barges, 3 Oil Tankers, 5 LCT, 3 Container Ships, 3 Bulk Carriers, 5 Fast Crew Boats
  const vesselDataList = [
    // 5 Tugboats
    {
      code: 'VSL-TGB-01', name: 'TB HANSAI PIONEER 01', type: 'Tugboat', imo: '9845112', reg: 'ID-JKT-2018-881', flag: 'Indonesia', year: 2018, shipyard: 'PT PAL Indonesia', country: 'Indonesia', classSoc: 'BKI', condition: 'Good', opStatus: 'Operational', price: 1850000, value: 1650000, loc: 'Port of Tanjung Priok, Jakarta',
      specs: { loa: 32.5, lbp: 29.8, breadth: 9.8, depth: 4.8, draft: 3.6, gt: 298, nt: 90, dwt: 350, maker: 'Caterpillar', model: '3516B-HD', power: 3200, count: 2, fuelType: 'MGO', fuelCons: 280, sSpeed: 11.5, maxSpeed: 13.0, crew: 10, classStatus: 'In Class' },
      specific: { bollardPullTon: 45.0, towingEquipment: 'Double Drum Hydraulic Towing Winch 50T Brake', config: 'Twin Screw Kort Nozzle' }
    },
    {
      code: 'VSL-TGB-02', name: 'TB HANSAI TITAN 02', type: 'Tugboat', imo: '9876231', reg: 'ID-BTM-2020-412', flag: 'Indonesia', year: 2020, shipyard: 'Batam Marine Engineering', country: 'Indonesia', classSoc: 'ABS', condition: 'Excellent', opStatus: 'Operational', price: 2400000, value: 2200000, loc: 'Batam Waters, Riau Islands',
      specs: { loa: 34.0, lbp: 31.0, breadth: 10.5, depth: 5.2, draft: 4.0, gt: 380, nt: 114, dwt: 420, maker: 'Yanmar', model: '6EY26W', power: 4000, count: 2, fuelType: 'MGO', fuelCons: 340, sSpeed: 12.0, maxSpeed: 13.5, crew: 12, classStatus: 'In Class' },
      specific: { bollardPullTon: 55.0, towingEquipment: 'Electro-Hydraulic Waterfall Towing Winch 75T', config: 'Azimuth Stern Drive (ASD)' }
    },
    {
      code: 'VSL-TGB-03', name: 'TB HANSAI BRAVO 03', type: 'Tugboat', imo: '9781190', reg: 'ID-SBY-2016-109', flag: 'Indonesia', year: 2016, shipyard: 'Dumas Tanjung Perak Shipyard', country: 'Indonesia', classSoc: 'BKI', condition: 'Good', opStatus: 'Under Charter', price: 1450000, value: 1280000, loc: 'Surabaya Madura Strait',
      specs: { loa: 29.0, lbp: 26.5, breadth: 9.0, depth: 4.2, draft: 3.2, gt: 245, nt: 74, dwt: 280, maker: 'Cummins', model: 'KTA50-M2', power: 2400, count: 2, fuelType: 'MGO', fuelCons: 210, sSpeed: 10.5, maxSpeed: 12.0, crew: 9, classStatus: 'In Class' },
      specific: { bollardPullTon: 32.0, towingEquipment: 'Single Drum Towing Winch 35T', config: 'Twin Fixed Pitch Propellers' }
    },
    {
      code: 'VSL-TGB-04', name: 'TB HANSAI ARROW 04', type: 'Tugboat', imo: '9912044', reg: 'ID-BPN-2022-771', flag: 'Indonesia', year: 2022, shipyard: 'Kariangau Shipyard Balikpapan', country: 'Indonesia', classSoc: 'BKI', condition: 'Excellent', opStatus: 'Operational', price: 2900000, value: 2750000, loc: 'Balikpapan Coal Terminal',
      specs: { loa: 36.0, lbp: 33.2, breadth: 11.2, depth: 5.5, draft: 4.2, gt: 420, nt: 126, dwt: 480, maker: 'Mitsubishi', model: 'S16R2-T2MPTA', power: 4400, count: 2, fuelType: 'MGO', fuelCons: 375, sSpeed: 12.5, maxSpeed: 14.0, crew: 12, classStatus: 'In Class' },
      specific: { bollardPullTon: 62.0, towingEquipment: 'Heavy Duty Towing Winch 90T with Escort Capability', config: 'ASD Tug' }
    },
    {
      code: 'VSL-TGB-05', name: 'TB HANSAI NAUTIC 05', type: 'Tugboat', imo: '9654109', reg: 'ID-JKT-2014-302', flag: 'Indonesia', year: 2014, shipyard: 'PT Daya Radar Utama', country: 'Indonesia', classSoc: 'BKI', condition: 'Fair', opStatus: 'Under Maintenance', price: 1100000, value: 950000, loc: 'Cilegon Anchorage',
      specs: { loa: 28.0, lbp: 25.0, breadth: 8.6, depth: 3.9, draft: 3.0, gt: 210, nt: 63, dwt: 220, maker: 'Yanmar', model: '6N21A-SV', power: 2000, count: 2, fuelType: 'MGO', fuelCons: 180, sSpeed: 10.0, maxSpeed: 11.5, crew: 8, classStatus: 'Due for Survey' },
      specific: { bollardPullTon: 28.0, towingEquipment: 'Hydraulic Towing Hook 30T', config: 'Conventional Twin Screw' }
    },

    // 5 Barges / Tongkang
    {
      code: 'VSL-BRG-01', name: 'BG HANSAI OCEAN 3001', type: 'Barge / Tongkang', imo: null, reg: 'ID-JKT-2019-901B', flag: 'Indonesia', year: 2019, shipyard: 'Batam Marine Engineering', country: 'Indonesia', classSoc: 'BKI', condition: 'Good', opStatus: 'Operational', price: 1600000, value: 1450000, loc: 'Tanjung Priok Outer Anchorage',
      specs: { loa: 91.44, lbp: 88.0, breadth: 24.38, depth: 5.5, draft: 4.3, gt: 3200, nt: 960, dwt: 7500, maker: 'Non-propelled', model: 'Deck Cargo', power: 0, count: 0, fuelType: 'N/A', fuelCons: 0, sSpeed: 7.0, maxSpeed: 8.0, crew: 0, classStatus: 'In Class' },
      specific: { lengthFt: '300 FT', deckLoadCapacity: '8.0 Ton/m2', rakedFlatEnd: 'Raked Bow & Stern', bargeType: 'Deck Cargo Flat Top with Sideboard' }
    },
    {
      code: 'VSL-BRG-02', name: 'BG HANSAI 3002', type: 'Barge / Tongkang', imo: null, reg: 'ID-BTM-2021-112B', flag: 'Indonesia', year: 2021, shipyard: 'PT Nanindah Batam', country: 'Indonesia', classSoc: 'BKI', condition: 'Excellent', opStatus: 'Operational', price: 1850000, value: 1720000, loc: 'Banjarmasin River Terminal',
      specs: { loa: 91.44, lbp: 88.0, breadth: 24.38, depth: 5.5, draft: 4.3, gt: 3250, nt: 975, dwt: 7600, maker: 'Non-propelled', model: 'Spud Barge', power: 0, count: 0, fuelType: 'N/A', fuelCons: 0, sSpeed: 7.0, maxSpeed: 8.0, crew: 0, classStatus: 'In Class' },
      specific: { lengthFt: '300 FT', deckLoadCapacity: '10.0 Ton/m2 Heavy Deck', rakedFlatEnd: 'Twin Raked', bargeType: 'Steel Deck Cargo with Removable Sideboard' }
    },
    {
      code: 'VSL-BRG-03', name: 'BG HANSAI 3301', type: 'Barge / Tongkang', imo: null, reg: 'ID-SBY-2020-554B', flag: 'Indonesia', year: 2020, shipyard: 'PT PAL Indonesia', country: 'Indonesia', classSoc: 'BKI', condition: 'Good', opStatus: 'Under Charter', price: 2300000, value: 2150000, loc: 'Morowali Nickel Port, Sulawesi',
      specs: { loa: 100.58, lbp: 97.0, breadth: 27.43, depth: 6.4, draft: 5.0, gt: 4200, nt: 1260, dwt: 10500, maker: 'Non-propelled', model: 'Heavy Carrier', power: 0, count: 0, fuelType: 'N/A', fuelCons: 0, sSpeed: 6.8, maxSpeed: 7.5, crew: 0, classStatus: 'In Class' },
      specific: { lengthFt: '330 FT', deckLoadCapacity: '12.0 Ton/m2 Extra Heavy', rakedFlatEnd: 'Model Bow Raked', bargeType: 'Jumbo Deck Cargo Barge' }
    },
    {
      code: 'VSL-BRG-04', name: 'BG HANSAI 3302', type: 'Barge / Tongkang', imo: null, reg: 'ID-JKT-2022-811B', flag: 'Indonesia', year: 2022, shipyard: 'Batam Shipyard', country: 'Indonesia', classSoc: 'BKI', condition: 'Excellent', opStatus: 'Operational', price: 2500000, value: 2400000, loc: 'Balikpapan Anchorage',
      specs: { loa: 100.58, lbp: 97.0, breadth: 27.43, depth: 6.4, draft: 5.0, gt: 4250, nt: 1275, dwt: 10600, maker: 'Non-propelled', model: 'Bulk Cargo', power: 0, count: 0, fuelType: 'N/A', fuelCons: 0, sSpeed: 6.8, maxSpeed: 7.8, crew: 0, classStatus: 'In Class' },
      specific: { lengthFt: '330 FT', deckLoadCapacity: '12.0 Ton/m2', rakedFlatEnd: 'Raked Bow and Stern', bargeType: 'Sideboard 12FT Heavy Duty Deck Cargo' }
    },
    {
      code: 'VSL-BRG-05', name: 'BG HANSAI 2501', type: 'Barge / Tongkang', imo: null, reg: 'ID-PLB-2015-320B', flag: 'Indonesia', year: 2015, shipyard: 'Palembang River Shipyard', country: 'Indonesia', classSoc: 'BKI', condition: 'Fair', opStatus: 'For Sale', price: 950000, value: 850000, loc: 'Musi River Anchorage, Palembang',
      specs: { loa: 76.2, lbp: 73.0, breadth: 18.28, depth: 4.5, draft: 3.5, gt: 1980, nt: 594, dwt: 4500, maker: 'Non-propelled', model: 'Flat Top', power: 0, count: 0, fuelType: 'N/A', fuelCons: 0, sSpeed: 7.5, maxSpeed: 8.5, crew: 0, classStatus: 'In Class' },
      specific: { lengthFt: '250 FT', deckLoadCapacity: '7.5 Ton/m2', rakedFlatEnd: 'Raked Bow', bargeType: 'General Aggregate Deck Barge' }
    },

    // 3 Oil Tankers
    {
      code: 'VSL-TNK-01', name: 'MT HANSAI PETROLIA 1', type: 'Oil Tanker', imo: '9542018', reg: 'ID-JKT-2015-T01', flag: 'Indonesia', year: 2015, shipyard: 'Fukuoka Shipbuilding', country: 'Japan', classSoc: 'NK', condition: 'Good', opStatus: 'Operational', price: 8200000, value: 7400000, loc: 'Pertamina Terminal Plaju, Palembang',
      specs: { loa: 105.0, lbp: 99.0, breadth: 16.8, depth: 8.8, draft: 6.5, gt: 4200, nt: 1800, dwt: 6500, maker: 'Hanshin Diesel', model: '6LF46', power: 3600, count: 1, fuelType: 'MGO', fuelCons: 380, sSpeed: 12.0, maxSpeed: 13.5, crew: 18, classStatus: 'In Class' },
      specific: { cargoCapacityDwt: 6500, cargoCapacityCbm: 7500, tankConfig: '10 Cargo Tanks + 2 Slop Tanks Epoxy Coated', pumpCapacity: '2 x 500 m3/h Screw Pumps', oilType: 'Clean Petroleum Products (Gasoline, Gasoil)', doubleHull: 'Full Double Hull Double Bottom', safetyCert: 'SIRE Compliant' }
    },
    {
      code: 'VSL-TNK-02', name: 'MT HANSAI LIQUIDUS 2', type: 'Oil Tanker', imo: '9691024', reg: 'ID-JKT-2017-T02', flag: 'Indonesia', year: 2017, shipyard: 'Shin Kurushima Dockyard', country: 'Japan', classSoc: 'BKI', condition: 'Excellent', opStatus: 'Operational', price: 11500000, value: 10600000, loc: 'Tanjung Gerem Terminal, Merak',
      specs: { loa: 118.0, lbp: 111.0, breadth: 18.2, depth: 9.6, draft: 7.2, gt: 5600, nt: 2400, dwt: 8900, maker: 'Makita / MAN B&W', model: '6S35MC', power: 4600, count: 1, fuelType: 'HFO/MGO', fuelCons: 420, sSpeed: 12.5, maxSpeed: 14.0, crew: 20, classStatus: 'In Class' },
      specific: { cargoCapacityDwt: 8900, cargoCapacityCbm: 10200, tankConfig: '12 Marine Line Coated Tanks', pumpCapacity: '4 x 350 m3/h Centrifugal Cargo Pumps', oilType: 'Chemical / Product IMO II Compatible', doubleHull: 'Full Double Hull', safetyCert: 'CDI & Pertamina Approved' }
    },
    {
      code: 'VSL-TNK-03', name: 'MT HANSAI CARRIER 3', type: 'Oil Tanker', imo: '9421102', reg: 'ID-BTM-2012-T03', flag: 'Indonesia', year: 2012, shipyard: 'Hyundai Mipo Dockyard', country: 'South Korea', classSoc: 'ABS', condition: 'Fair', opStatus: 'Under Survey', price: 6800000, value: 5900000, loc: 'Batam Anchorage',
      specs: { loa: 99.0, lbp: 92.0, breadth: 16.0, depth: 8.0, draft: 6.0, gt: 3500, nt: 1400, dwt: 5000, maker: 'Caterpillar MaK', model: '8M25', power: 3200, count: 1, fuelType: 'MGO', fuelCons: 310, sSpeed: 11.5, maxSpeed: 12.8, crew: 16, classStatus: 'Intermediate Survey Due' },
      specific: { cargoCapacityDwt: 5000, cargoCapacityCbm: 5800, tankConfig: '8 Cargo Tanks', pumpCapacity: '2 x 400 m3/h Gear Pumps', oilType: 'Dirty Petroleum Products / Fuel Oil (MFO)', doubleHull: 'Double Hull', safetyCert: 'IOPP Certificate Valid' }
    },

    // 5 Landing Craft Tank (LCT)
    {
      code: 'VSL-LCT-01', name: 'LCT HANSAI VOYAGER 88', type: 'Landing Craft Tank (LCT)', imo: '9820011', reg: 'ID-JKT-2019-L01', flag: 'Indonesia', year: 2019, shipyard: 'PT Dumas Tanjung Perak', country: 'Indonesia', classSoc: 'BKI', condition: 'Good', opStatus: 'Operational', price: 2100000, value: 1950000, loc: 'Halmahera Weda Bay Port',
      specs: { loa: 68.0, lbp: 63.5, breadth: 14.0, depth: 4.5, draft: 3.2, gt: 1100, nt: 330, dwt: 1800, maker: 'Caterpillar', model: '3412 DITA', power: 1600, count: 2, fuelType: 'MGO', fuelCons: 160, sSpeed: 9.5, maxSpeed: 11.0, crew: 12, classStatus: 'In Class' },
      specific: { rampCapacityTon: 60, rampDimensions: '9.0m Length x 6.5m Width Heavy Ramp', deckCapacityTon: 1500, landingCapability: 'Beach Landing & Heavy Project Equipment' }
    },
    {
      code: 'VSL-LCT-02', name: 'LCT HANSAI LOGISTIC 05', type: 'Landing Craft Tank (LCT)', imo: '9854422', reg: 'ID-BPN-2020-L02', flag: 'Indonesia', year: 2020, shipyard: 'Balikpapan Marine Shipyard', country: 'Indonesia', classSoc: 'BKI', condition: 'Excellent', opStatus: 'Operational', price: 2450000, value: 2300000, loc: 'IKN Nusantara Port, East Kalimantan',
      specs: { loa: 75.0, lbp: 70.0, breadth: 15.0, depth: 4.8, draft: 3.5, gt: 1450, nt: 435, dwt: 2200, maker: 'Mitsubishi', model: 'S6R2-MPTA', power: 1800, count: 2, fuelType: 'MGO', fuelCons: 195, sSpeed: 10.0, maxSpeed: 11.5, crew: 14, classStatus: 'In Class' },
      specific: { rampCapacityTon: 80, rampDimensions: '10.5m Length x 7.0m Width Heavy Hydraulic Ramp', deckCapacityTon: 1900, landingCapability: 'Beach & Remote Riverbank Landing' }
    },
    {
      code: 'VSL-LCT-03', name: 'LCT HANSAI NUSANTARA 07', type: 'Landing Craft Tank (LCT)', imo: '9789012', reg: 'ID-SBY-2017-L03', flag: 'Indonesia', year: 2017, shipyard: 'PT PAL Surabaya', country: 'Indonesia', classSoc: 'BKI', condition: 'Good', opStatus: 'Under Charter', price: 1800000, value: 1620000, loc: 'Kupang Port, NTT',
      specs: { loa: 60.0, lbp: 55.0, breadth: 12.0, depth: 3.8, draft: 2.8, gt: 850, nt: 255, dwt: 1300, maker: 'Cummins', model: 'NTA855-M', power: 1200, count: 2, fuelType: 'MGO', fuelCons: 130, sSpeed: 9.0, maxSpeed: 10.2, crew: 11, classStatus: 'In Class' },
      specific: { rampCapacityTon: 50, rampDimensions: '8.0m x 5.8m Steel Ramp Door', deckCapacityTon: 1100, landingCapability: 'Inter-island Logistics & Excavators' }
    },
    {
      code: 'VSL-LCT-04', name: 'LCT HANSAI ANDALAS 09', type: 'Landing Craft Tank (LCT)', imo: '9880199', reg: 'ID-PDG-2021-L04', flag: 'Indonesia', year: 2021, shipyard: 'Batam Shipyard', country: 'Indonesia', classSoc: 'BKI', condition: 'Excellent', opStatus: 'Operational', price: 2600000, value: 2450000, loc: 'Belawan Outer Anchorage, Medan',
      specs: { loa: 80.0, lbp: 74.5, breadth: 16.0, depth: 5.0, draft: 3.6, gt: 1750, nt: 525, dwt: 2600, maker: 'Yanmar', model: '6AYM-WET', power: 2000, count: 2, fuelType: 'MGO', fuelCons: 210, sSpeed: 10.2, maxSpeed: 12.0, crew: 15, classStatus: 'In Class' },
      specific: { rampCapacityTon: 100, rampDimensions: '11.0m x 7.5m Reinforced Ramp Door', deckCapacityTon: 2300, landingCapability: 'Mining Heavy Equipment Transport' }
    },
    {
      code: 'VSL-LCT-05', name: 'LCT HANSAI BORNEO 12', type: 'Landing Craft Tank (LCT)', imo: '9641198', reg: 'ID-TRK-2013-L05', flag: 'Indonesia', year: 2013, shipyard: 'Samarinda Shipyard', country: 'Indonesia', classSoc: 'BKI', condition: 'Fair', opStatus: 'For Sale', price: 1250000, value: 1100000, loc: 'Tarakan Port, North Kalimantan',
      specs: { loa: 55.0, lbp: 50.0, breadth: 11.5, depth: 3.5, draft: 2.5, gt: 650, nt: 195, dwt: 950, maker: 'Weichai', model: 'CW200ZC', power: 1000, count: 2, fuelType: 'MGO', fuelCons: 110, sSpeed: 8.5, maxSpeed: 9.8, crew: 10, classStatus: 'In Class' },
      specific: { rampCapacityTon: 40, rampDimensions: '7.5m x 5.2m Ramp', deckCapacityTon: 800, landingCapability: 'General Cargo & Light Trucks' }
    },

    // 3 Container Ships
    {
      code: 'VSL-CNT-01', name: 'MV HANSAI PACIFIC', type: 'Container Ship', imo: '9358821', reg: 'ID-JKT-2016-C01', flag: 'Indonesia', year: 2016, shipyard: 'Jiangsu New Yangzijiang Shipbuilding', country: 'China', classSoc: 'DNV', condition: 'Good', opStatus: 'Operational', price: 18500000, value: 17200000, loc: 'Port of Tanjung Priok, JICT',
      specs: { loa: 172.0, lbp: 161.0, breadth: 27.6, depth: 14.0, draft: 9.5, gt: 18500, nt: 9200, dwt: 23500, maker: 'MAN B&W', model: '6S60ME-C', power: 14280, count: 1, fuelType: 'HFO/VLSFO', fuelCons: 1150, sSpeed: 17.5, maxSpeed: 19.5, crew: 22, classStatus: 'In Class' },
      specific: { teuCapacity: 1700, feuCapacity: 820, reeferPlugs: 250, craneAvailability: 'Gearless (Port Cranes Required)', cargoHoldCapacityCbm: 28500, maxContainerWeight: '30 Ton per 40FT Bay' }
    },
    {
      code: 'VSL-CNT-02', name: 'MV HANSAI MARINER', type: 'Container Ship', imo: '9481109', reg: 'ID-SBY-2018-C02', flag: 'Indonesia', year: 2018, shipyard: 'Zhejiang Ouhua Shipbuilding', country: 'China', classSoc: 'LR', condition: 'Excellent', opStatus: 'Operational', price: 24000000, value: 22800000, loc: 'Port of Singapore, Pasir Panjang',
      specs: { loa: 195.0, lbp: 183.0, breadth: 30.2, depth: 16.5, draft: 10.5, gt: 26000, nt: 13000, dwt: 34000, maker: 'Wärtsilä Sulzer', model: '7RT-flex68D', power: 18500, count: 1, fuelType: 'VLSFO', fuelCons: 1380, sSpeed: 18.5, maxSpeed: 21.0, crew: 24, classStatus: 'In Class' },
      specific: { teuCapacity: 2500, feuCapacity: 1200, reeferPlugs: 400, craneAvailability: 'Geared: 3 x 45T Ship Cranes with Spreader', cargoHoldCapacityCbm: 42000, maxContainerWeight: '32 Ton' }
    },
    {
      code: 'VSL-CNT-03', name: 'MV HANSAI ATLANTIC', type: 'Container Ship', imo: '9299441', reg: 'ID-JKT-2010-C03', flag: 'Indonesia', year: 2010, shipyard: 'Hanjin Heavy Industries', country: 'South Korea', classSoc: 'ABS', condition: 'Fair', opStatus: 'Under Maintenance', price: 12000000, value: 10800000, loc: 'Surabaya Shipyard Dock',
      specs: { loa: 148.0, lbp: 138.0, breadth: 23.5, depth: 11.8, draft: 8.2, gt: 12500, nt: 6100, dwt: 15800, maker: 'B&W', model: '7S50MC', power: 9800, count: 1, fuelType: 'HFO/MGO', fuelCons: 880, sSpeed: 16.0, maxSpeed: 18.0, crew: 20, classStatus: 'Drydock Scheduled' },
      specific: { teuCapacity: 1100, feuCapacity: 520, reeferPlugs: 160, craneAvailability: 'Geared: 2 x 40T Cranes', cargoHoldCapacityCbm: 19500, maxContainerWeight: '28 Ton' }
    },

    // 3 Bulk Carriers
    {
      code: 'VSL-BLK-01', name: 'MV HANSAI FORTUNE', type: 'Bulk Carrier', imo: '9620045', reg: 'ID-JKT-2016-B01', flag: 'Indonesia', year: 2016, shipyard: 'Imabari Shipbuilding', country: 'Japan', classSoc: 'NK', condition: 'Good', opStatus: 'Operational', price: 19500000, value: 18200000, loc: 'Taboneo Anchorage, South Kalimantan',
      specs: { loa: 179.9, lbp: 172.0, breadth: 28.4, depth: 14.3, draft: 10.0, gt: 23500, nt: 12800, dwt: 38000, maker: 'Mitsui-MAN B&W', model: '6S46ME-B8', power: 7200, count: 1, fuelType: 'VLSFO', fuelCons: 720, sSpeed: 14.0, maxSpeed: 15.5, crew: 21, classStatus: 'In Class' },
      specific: { bulkType: 'Handysize Bulk Carrier', numHolds: 5, numHatches: 5, craneCapacity: '4 x 30.5 Ton Deck Cranes with Grabs', cargoCompatibility: 'Coal, Nickel Ore, Grain, Fertilizer, Clinker' }
    },
    {
      code: 'VSL-BLK-02', name: 'MV HANSAI MINERVA', type: 'Bulk Carrier', imo: '9714418', reg: 'ID-JKT-2019-B02', flag: 'Indonesia', year: 2019, shipyard: 'Tsuneishi Shipbuilding', country: 'Japan', classSoc: 'BKI', condition: 'Excellent', opStatus: 'Operational', price: 27000000, value: 25500000, loc: 'Port of Shanghai Bulk Terminal',
      specs: { loa: 199.9, lbp: 193.0, breadth: 32.26, depth: 18.5, draft: 13.0, gt: 35800, nt: 21000, dwt: 63500, maker: 'MAN B&W', model: '6S50ME-B9', power: 8800, count: 1, fuelType: 'VLSFO/LSMGO', fuelCons: 850, sSpeed: 14.5, maxSpeed: 16.0, crew: 22, classStatus: 'In Class' },
      specific: { bulkType: 'Ultramax Bulk Carrier', numHolds: 5, numHatches: 5, craneCapacity: '4 x 35 Ton Cranes with 12m3 Electro-Hydraulic Grabs', cargoCompatibility: 'Grain, Bauxite, Iron Ore, Coal' }
    },
    {
      code: 'VSL-BLK-03', name: 'MV HANSAI RESOURCE', type: 'Bulk Carrier', imo: '9512399', reg: 'ID-BTM-2013-B03', flag: 'Indonesia', year: 2013, shipyard: 'Cosco Zhoushan Shipyard', country: 'China', classSoc: 'BV', condition: 'Fair', opStatus: 'Under Charter', price: 15500000, value: 14200000, loc: 'Mundra Port, Gujarat, India',
      specs: { loa: 189.9, lbp: 182.0, breadth: 32.26, depth: 17.5, draft: 12.2, gt: 31500, nt: 18200, dwt: 53500, maker: 'Doosan-MAN B&W', model: '6S50MC-C', power: 8200, count: 1, fuelType: 'HFO/MGO', fuelCons: 890, sSpeed: 13.8, maxSpeed: 15.0, crew: 22, classStatus: 'In Class' },
      specific: { bulkType: 'Supramax Bulk Carrier', numHolds: 5, numHatches: 5, craneCapacity: '4 x 30 Ton Cranes', cargoCompatibility: 'Coal, Steel Coils, Cement Clinker, Minerals' }
    },

    // 5 Fast Crew Boats (FCB)
    {
      code: 'VSL-FCB-01', name: 'FCB HANSAI EXPRESS 1', type: 'Fast Crew Boat (FCB)', imo: null, reg: 'ID-JKT-2021-F01', flag: 'Indonesia', year: 2021, shipyard: 'Grandweld Shipyards', country: 'United Arab Emirates', classSoc: 'ABS', condition: 'Excellent', opStatus: 'Operational', price: 3200000, value: 3000000, loc: 'Offshore Madura Strait Oil Field',
      specs: { loa: 41.0, lbp: 38.0, breadth: 8.2, depth: 3.8, draft: 1.8, gt: 260, nt: 78, dwt: 110, maker: 'Caterpillar', model: 'C32 ACERT', power: 4350, count: 3, fuelType: 'MGO', fuelCons: 680, sSpeed: 24.0, maxSpeed: 28.0, crew: 6, classStatus: 'In Class' },
      specific: { passengerCapacity: 75, hullMaterial: 'Marine Grade Aluminium 5083', engineConfig: 'Triple Screw Fixed Pitch Propellers', rangeNauticalMiles: 800, navEquipment: 'Furuno Radar, GPS, AIS, ECDIS, Night Vision FLIR' }
    },
    {
      code: 'VSL-FCB-02', name: 'FCB HANSAI SWIFT 2', type: 'Fast Crew Boat (FCB)', imo: null, reg: 'ID-BTM-2022-F02', flag: 'Indonesia', year: 2022, shipyard: 'Strategic Marine Batam', country: 'Indonesia', classSoc: 'BKI', condition: 'Excellent', opStatus: 'Operational', price: 3500000, value: 3350000, loc: 'Offshore Natuna Gas Field',
      specs: { loa: 42.0, lbp: 39.0, breadth: 8.5, depth: 3.9, draft: 1.9, gt: 285, nt: 85, dwt: 120, maker: 'Cummins', model: 'QSK38-M', power: 4500, count: 3, fuelType: 'MGO', fuelCons: 710, sSpeed: 25.0, maxSpeed: 29.5, crew: 6, classStatus: 'In Class' },
      specific: { passengerCapacity: 80, hullMaterial: 'Aluminium Alloy', engineConfig: 'Triple Waterjet Propulsion (HamiltonJet HTX52)', rangeNauticalMiles: 850, navEquipment: 'Full GMDSS A2, Kongsberg Dynamic Positioning DP1' }
    },
    {
      code: 'VSL-FCB-03', name: 'FCB HANSAI RAPID 3', type: 'Fast Crew Boat (FCB)', imo: null, reg: 'ID-BPN-2020-F03', flag: 'Indonesia', year: 2020, shipyard: 'PT Palindo Marine Batam', country: 'Indonesia', classSoc: 'BKI', condition: 'Good', opStatus: 'Operational', price: 2800000, value: 2600000, loc: 'Balikpapan Offshore Terminal',
      specs: { loa: 38.0, lbp: 35.0, breadth: 7.8, depth: 3.5, draft: 1.7, gt: 220, nt: 66, dwt: 95, maker: 'Baudouin', model: '12M26.3', power: 3600, count: 3, fuelType: 'MGO', fuelCons: 580, sSpeed: 23.0, maxSpeed: 26.5, crew: 5, classStatus: 'In Class' },
      specific: { passengerCapacity: 60, hullMaterial: 'Marine Aluminium 5083', engineConfig: 'Triple Screw Propellers with Bow Thruster', rangeNauticalMiles: 750, navEquipment: 'Simrad Dual Radar, Autopilot, Satellite Phone' }
    },
    {
      code: 'VSL-FCB-04', name: 'FCB HANSAI METEOR 4', type: 'Fast Crew Boat (FCB)', imo: null, reg: 'ID-JKT-2018-F04', flag: 'Indonesia', year: 2018, shipyard: 'Damen Shipyards', country: 'Netherlands', classSoc: 'BV', condition: 'Good', opStatus: 'Under Charter', price: 2950000, value: 2700000, loc: 'Offshore Cirebon Oil Platform',
      specs: { loa: 35.5, lbp: 33.0, breadth: 7.5, depth: 3.4, draft: 1.6, gt: 195, nt: 58, dwt: 80, maker: 'Caterpillar', model: 'C32 ACERT', power: 3800, count: 2, fuelType: 'MGO', fuelCons: 540, sSpeed: 26.0, maxSpeed: 30.0, crew: 5, classStatus: 'In Class' },
      specific: { passengerCapacity: 50, hullMaterial: 'Aluminium Axe Bow Design', engineConfig: 'Twin Fixed Pitch Propellers', rangeNauticalMiles: 700, navEquipment: 'Integrated Bridge System, Fast Rescue Craft' }
    },
    {
      code: 'VSL-FCB-05', name: 'FCB HANSAI VELOX 5', type: 'Fast Crew Boat (FCB)', imo: null, reg: 'ID-BTM-2016-F05', flag: 'Indonesia', year: 2016, shipyard: 'Batam Shipyard', country: 'Indonesia', classSoc: 'BKI', condition: 'Fair', opStatus: 'For Sale', price: 1850000, value: 1650000, loc: 'Batam Marine Base',
      specs: { loa: 32.0, lbp: 29.5, breadth: 7.0, depth: 3.2, draft: 1.5, gt: 160, nt: 48, dwt: 65, maker: 'Cummins', model: 'KTA38-M2', power: 2700, count: 2, fuelType: 'MGO', fuelCons: 420, sSpeed: 21.0, maxSpeed: 24.5, crew: 4, classStatus: 'In Class' },
      specific: { passengerCapacity: 45, hullMaterial: 'Marine Grade Aluminium', engineConfig: 'Twin Propeller', rangeNauticalMiles: 600, navEquipment: 'Standard Coastal Navigation & VHF' }
    },
  ];

  const createdVessels = [];
  for (const vd of vesselDataList) {
    const vessel = await prisma.vessel.create({
      data: {
        vesselCode: vd.code,
        vesselName: vd.name,
        vesselType: vd.type,
        imoNumber: vd.imo,
        registrationNumber: vd.reg,
        flagState: vd.flag,
        yearBuilt: vd.year,
        shipyard: vd.shipyard,
        countryOfBuild: vd.country,
        classificationSociety: vd.classSoc,
        ownershipStatus: vd.opStatus === 'Sold' ? 'Sold' : (vd.opStatus === 'For Sale' ? 'For Sale' : 'Owned'),
        currentLocation: vd.loc,
        condition: vd.condition,
        operationalStatus: vd.opStatus,
        purchasePrice: vd.price,
        currentEstimatedValue: vd.value,
      },
    });
    createdVessels.push(vessel);

    // Create Vessel Specification
    await prisma.vesselSpecification.create({
      data: {
        vesselId: vessel.id,
        loa: vd.specs.loa,
        lbp: vd.specs.lbp,
        breadth: vd.specs.breadth,
        depth: vd.specs.depth,
        draft: vd.specs.draft,
        gt: vd.specs.gt,
        nt: vd.specs.nt,
        dwt: vd.specs.dwt,
        lightshipWeight: Math.round(vd.specs.dwt * 0.4),
        mainEngineMaker: vd.specs.maker,
        mainEngineModel: vd.specs.model,
        mainEnginePowerHp: vd.specs.power,
        mainEngineCount: vd.specs.count,
        auxEngine: vd.specs.count > 0 ? 'Caterpillar C4.4 / Cummins 6BT' : null,
        fuelType: vd.specs.fuelType,
        fuelConsumption: vd.specs.fuelCons,
        serviceSpeed: vd.specs.sSpeed,
        maxSpeed: vd.specs.maxSpeed,
        crewCapacity: vd.specs.crew,
        classificationStatus: vd.specs.classStatus,
        specificSpecsJson: JSON.stringify(vd.specific),
      },
    });
  }

  console.log('--- Seeding Vessel Purchases & Sales ---');
  // 6 Vessel purchases
  for (let vp = 0; vp < 6; vp++) {
    const v = createdVessels[vp];
    const pPrice = v.purchasePrice;
    const survey = 15000;
    const inspect = 12000;
    const legal = 18000;
    const doc = 8000;
    const reg = 10000;
    const delivery = 35000;
    const repair = 45000;
    const other = 12000;
    const totalAcq = pPrice + survey + inspect + legal + doc + reg + delivery + repair + other;

    await prisma.vesselPurchase.create({
      data: {
        purchaseNumber: `VPS-2026-${String(vp + 1).padStart(3, '0')}`,
        vesselId: v.id,
        vesselName: v.vesselName,
        vesselType: v.vesselType,
        seller: 'Global Maritime Holdings Pte Ltd',
        broker: 'Clarksons Platou Marine Brokers',
        purchaseDate: new Date(Date.now() - (vp * 60 + 90) * 86400000),
        agreementNumber: `MOA-HANSAI-${2025 - vp}-${v.vesselCode}`,
        purchasePrice: pPrice,
        currency: 'USD',
        exchangeRate: 16250,
        surveyCost: survey,
        inspectionCost: inspect,
        legalFees: legal,
        documentationCost: doc,
        registrationFees: reg,
        deliveryCost: delivery,
        repairCost: repair,
        otherCosts: other,
        totalAcquisitionCost: totalAcq,
        paymentTerms: '20% Deposit, 80% on Delivery & Protocol of Delivery and Acceptance',
        depositAmount: pPrice * 0.2,
        paidAmount: totalAcq,
        remainingPayment: 0,
        paymentStatus: 'Completed',
        deliveryDate: new Date(Date.now() - (vp * 60 + 80) * 86400000),
        handoverStatus: 'Completed',
        notes: `Acquisition completed under Norwegian Saleform 2012 (NSF 2012). Full survey report filed.`,
      },
    });
  }

  // 3 Vessel Sales
  const saleVessels = [createdVessels[9], createdVessels[17], createdVessels[28]]; // BG HANSAI 2501, LCT HANSAI BORNEO 12, FCB HANSAI VELOX 5
  for (let vs = 0; vs < saleVessels.length; vs++) {
    const v = saleVessels[vs];
    const sPrice = Math.round(v.currentEstimatedValue * 1.15);
    const comm = Math.round(sPrice * 0.025);
    const survey = 8000;
    const legal = 12000;
    const doc = 5000;
    const delivery = 20000;
    const other = 5000;
    const totalRev = sPrice;
    const totalExp = comm + survey + legal + doc + delivery + other;
    const acqCost = v.purchasePrice;
    const realProfit = sPrice - acqCost - totalExp;

    await prisma.vesselSale.create({
      data: {
        saleNumber: `VSL-2026-${String(vs + 1).padStart(3, '0')}`,
        vesselId: v.id,
        vesselName: v.vesselName,
        vesselType: v.vesselType,
        buyer: createdCustomers[vs * 3].companyName,
        broker: 'Braemar Shipping Services',
        salesDate: new Date(Date.now() - (vs * 45 + 15) * 86400000),
        agreementNumber: `MOA-SALE-2026-${vs + 1}`,
        sellingPrice: sPrice,
        currency: 'USD',
        exchangeRate: 16250,
        surveyCost: survey,
        commission: comm,
        legalFees: legal,
        documentationFees: doc,
        deliveryCost: delivery,
        otherCosts: other,
        totalSalesRevenue: totalRev,
        totalSalesExpenses: totalExp,
        originalAcquisitionCost: acqCost,
        accumulatedDepreciation: Math.round(acqCost * 0.18),
        netBookValue: Math.round(acqCost * 0.82),
        realizedTradingProfit: realProfit,
        accountingGainLoss: sPrice - totalExp - Math.round(acqCost * 0.82),
        paymentReceived: sPrice,
        outstandingBalance: 0,
        paymentStatus: 'Paid',
        handoverDate: new Date(Date.now() - (vs * 45 + 5) * 86400000),
        transferStatus: 'Ownership Transferred',
        notes: `Executed Memorandum of Agreement, Bill of Sale and Deletion Certificate successfully registered.`,
      },
    });
  }

  console.log('--- Seeding 20 Vessel Maintenance Records ---');
  const maintTypes = [
    'Annual Drydock & Hull Painting',
    'Special Survey Drydock & Plate Gauging',
    'Main Engine 12,000 Hours Major Overhaul',
    'Tailshaft & Propeller Clearance Inspection',
    'Rudder Pintle Bushing Replacement',
    'Auxiliary Generator Diagnostic & Rewinding',
  ];
  for (let vm = 0; vm < 20; vm++) {
    const v = createdVessels[vm % createdVessels.length];
    const cost = 25000 + (vm * 4500);
    await prisma.vesselMaintenance.create({
      data: {
        vesselId: v.id,
        maintenanceType: maintTypes[vm % maintTypes.length],
        title: `${maintTypes[vm % maintTypes.length]} - ${v.vesselName}`,
        description: `Routine scheduled drydock and marine engineering maintenance according to Class rules.`,
        serviceProvider: vm % 2 === 0 ? 'PT PAL Indonesia Shipyard' : 'Batam Marine Engineering Dock',
        startDate: new Date(Date.now() - (vm * 15 + 20) * 86400000),
        completionDate: new Date(Date.now() - (vm * 15 + 8) * 86400000),
        cost,
        currency: 'USD',
        status: vm === 0 ? 'In Progress' : 'Completed',
        nextScheduledDate: new Date(Date.now() + (365 - (vm * 10)) * 86400000),
        invoiceRef: `INV-DOCK-2026-${String(vm + 101)}`,
      },
    });
  }

  console.log('--- Seeding 20 Vessel Operational Expenses ---');
  const opCategories = ['Fuel', 'Lubricants', 'Crew Salaries', 'Port Charges', 'Port Clearance', 'Insurance', 'Spare Parts'];
  for (let oe = 0; oe < 20; oe++) {
    const v = createdVessels[oe % createdVessels.length];
    const cat = opCategories[oe % opCategories.length];
    let amount = 12500;
    if (cat === 'Fuel') amount = 38000;
    else if (cat === 'Crew Salaries') amount = 22000;
    else if (cat === 'Insurance') amount = 16000;

    await prisma.vesselOperationalExpense.create({
      data: {
        vesselId: v.id,
        category: cat,
        description: `Monthly operational disbursement: ${cat} for ${v.vesselName}`,
        date: new Date(Date.now() - (oe * 6 + 2) * 86400000),
        amount,
        currency: 'USD',
        vendor: 'PT Pertamina Marine / Port Authority',
        receiptNumber: `REC-OPEX-${String(oe + 1).padStart(4, '0')}`,
        status: 'Paid',
      },
    });
  }

  console.log('--- Seeding 15 Vessel Documents ---');
  const docTypes = [
    'Certificate of Registry (Surat Laut)',
    'Certificate of Class (Hull & Machinery)',
    'International Tonnage Certificate',
    'Safety Equipment Certificate',
    'International Load Line Certificate',
    'International Oil Pollution Prevention (IOPP)',
    'Minimum Safe Manning Certificate',
    'Protection & Indemnity (P&I) Insurance Club Cover',
  ];
  for (let vd = 0; vd < 15; vd++) {
    const v = createdVessels[vd % createdVessels.length];
    const isExpiring = vd === 2 || vd === 7;
    const isExpired = vd === 11;
    const expiry = isExpired
      ? new Date(Date.now() - 15 * 86400000)
      : (isExpiring ? new Date(Date.now() + 18 * 86400000) : new Date(Date.now() + (180 + vd * 20) * 86400000));
    const status = isExpired ? 'Expired' : (isExpiring ? 'Expiring Soon' : 'Valid');

    await prisma.vesselDocument.create({
      data: {
        vesselId: v.id,
        documentType: docTypes[vd % docTypes.length],
        documentNumber: `DOC-BKI-2025-${v.vesselCode}-${vd + 10}`,
        issueDate: new Date(Date.now() - 300 * 86400000),
        expiryDate: expiry,
        issuingAuthority: 'Biro Klasifikasi Indonesia (BKI) / Hubla',
        fileUrl: `/uploads/documents/vessel-${v.vesselCode}-cert.pdf`,
        status,
        notes: `Mandatory statutory certification under SOLAS / MARPOL conventions.`,
      },
    });
  }

  console.log('--- Seeding 10 Vessel Surveys ---');
  const surveyTypes = ['Annual Survey', 'Intermediate Survey', 'Special Survey (5-Yearly)', 'Drydock Survey', 'Condition Assessment Survey'];
  for (let sv = 0; sv < 10; sv++) {
    const v = createdVessels[sv % createdVessels.length];
    await prisma.vesselSurvey.create({
      data: {
        vesselId: v.id,
        surveyType: surveyTypes[sv % surveyTypes.length],
        surveyorName: 'Ir. Ahmad Zulkarnain, MRINA',
        surveyorCompany: 'Biro Klasifikasi Indonesia (BKI)',
        surveyDate: new Date(Date.now() - (sv * 25 + 10) * 86400000),
        nextSurveyDueDate: new Date(Date.now() + (365 - (sv * 20)) * 86400000),
        resultStatus: sv === 4 ? 'Passed with Conditions' : 'Passed',
        findings: 'Hull structure, sea chests, cathodic protection anodes and steering gear verified in good condition.',
        recommendations: 'Continue periodic ultrasonic thickness measurements on cargo tank bottoms.',
        fileUrl: `/uploads/surveys/survey-report-${v.vesselCode}.pdf`,
      },
    });
  }

  console.log('--- Seeding 10 Vessel Schedules ---');
  const routes = [
    { pol: 'Jakarta (Tanjung Priok)', pod: 'Singapore (Keppel)', duration: 2 },
    { pol: 'Surabaya (Tanjung Perak)', pod: 'Port Klang', duration: 3 },
    { pol: 'Batam (Batu Ampar)', pod: 'Singapore (Jurong)', duration: 1 },
    { pol: 'Balikpapan (Semayang)', pod: 'Surabaya (Teluk Lamong)', duration: 3 },
    { pol: 'Jakarta (Tanjung Priok)', pod: 'Shanghai (Yangshan)', duration: 7 },
    { pol: 'Singapore (Pasir Panjang)', pod: 'Jebel Ali (Dubai)', duration: 9 },
    { pol: 'Mumbai (Nhava Sheva)', pod: 'Jeddah Islamic Port', duration: 6 },
    { pol: 'Ningbo-Zhoushan', pod: 'Jakarta (Tanjung Priok)', duration: 8 },
  ];
  for (let vs = 0; vs < 10; vs++) {
    const v = createdVessels[vs % createdVessels.length];
    const r = routes[vs % routes.length];
    const etd = new Date(Date.now() + (vs * 3 - 4) * 86400000);
    const eta = new Date(etd.getTime() + r.duration * 86400000);
    const status = vs === 0 ? 'Sailing' : (vs === 1 ? 'Delayed' : (vs < 3 ? 'Arrived' : 'Scheduled'));

    await prisma.vesselSchedule.create({
      data: {
        scheduleNumber: `VSC-2026-${String(vs + 1).padStart(3, '0')}`,
        vesselId: v.id,
        vesselName: v.vesselName,
        voyageNumber: `VOY-${2026}-${String(vs + 1).padStart(2, '0')}E`,
        originPort: r.pol,
        destinationPort: r.pod,
        etd,
        eta,
        actualDeparture: status === 'Sailing' || status === 'Arrived' ? etd : null,
        actualArrival: status === 'Arrived' ? eta : null,
        status,
        notes: `Regular liner service connection. On-time performance monitored.`,
      },
    });
  }

  console.log('--- Seeding 30 Shipments (FCL & LCL) with 12 Tracking Stages ---');
  const trackingStagesList = [
    'Warehouse Preparation',
    'Stuffing',
    'Documentation',
    'Customs Clearance Origin',
    'Gate In',
    'Vessel Departure',
    'In Transit',
    'Vessel Arrival',
    'Customs Clearance Destination',
    'Container Release',
    'Final Delivery',
    'Proof of Delivery',
  ];

  const commodities = [
    { name: 'Automotive Spare Parts', hs: '8708.29.90', weight: 18500, cbm: 48, type: '40FT High Cube' },
    { name: 'Refined Palm Oil (RBD Olein)', hs: '1511.90.20', weight: 21500, cbm: 28, type: '20FT Standard' },
    { name: 'Consumer Electronics & Tablets', hs: '8471.30.20', weight: 12000, cbm: 58, type: '40FT High Cube' },
    { name: 'Frozen Shrimp & Seafood', hs: '0306.17.10', weight: 22000, cbm: 54, type: '40FT Refrigerated' },
    { name: 'Synthetic Textile Yarn', hs: '5402.33.00', weight: 19800, cbm: 62, type: '40FT High Cube' },
    { name: 'Industrial Valve Machinery', hs: '8481.80.30', weight: 6500, cbm: 14, type: 'LCL Cargo' },
    { name: 'Specialty Coffee Beans (Arabica)', hs: '0901.11.10', weight: 19200, cbm: 32, type: '20FT Standard' },
    { name: 'Structural Steel Beams', hs: '7216.33.00', weight: 26000, cbm: 38, type: 'Flat Rack' },
    { name: 'Pharmaceutical API Formulations', hs: '3004.90.99', weight: 4200, cbm: 8.5, type: 'LCL Cargo' },
    { name: 'Natural Rubber (SIR 20)', hs: '4001.22.00', weight: 20100, cbm: 31, type: '20FT Standard' },
  ];

  const shipmentStatuses = [
    'Delivered',
    'In Transit',
    'Vessel Departure',
    'Customs Cleared',
    'Booking Confirmed',
    'Delivered',
  ];

  for (let s = 1; s <= 30; s++) {
    const cust = createdCustomers[(s - 1) % createdCustomers.length];
    const supp = createdSuppliers[(s - 1) % createdSuppliers.length];
    const comm = commodities[(s - 1) % commodities.length];
    const vessel = createdVessels[s % createdVessels.length];
    const route = routes[(s - 1) % routes.length];
    const status = shipmentStatuses[(s - 1) % shipmentStatuses.length];
    const cont = createdContainers[(s - 1) * 2];

    const freightCost = comm.type === 'LCL Cargo' ? 1450 : (comm.type.includes('40') ? 3200 : 1900);
    const thcOrig = 145;
    const thcDest = 180;
    const ins = Math.round(freightCost * 0.08);
    const customs = 220;
    const other = 150;
    const totalCost = freightCost + thcOrig + thcDest + ins + customs + other;
    const sellingRate = Math.round(totalCost * 1.28);

    const etd = new Date(Date.now() - (35 - s) * 86400000);
    const eta = new Date(etd.getTime() + 6 * 86400000);

    const shp = await prisma.shipment.create({
      data: {
        shipmentNumber: `SHP-2026-${String(s).padStart(4, '0')}`,
        customerId: cust.id,
        supplierId: supp.id,
        commodity: comm.name,
        hsCode: comm.hs,
        quantity: comm.type === 'LCL Cargo' ? 12 : 1,
        grossWeight: comm.weight,
        netWeight: Math.round(comm.weight * 0.94),
        volumeCbm: comm.cbm,
        containerNumber: comm.type === 'LCL Cargo' ? 'LCL-CONSOLIDATION' : cont.containerNumber,
        containerType: comm.type,
        incoterms: s % 2 === 0 ? 'CIF' : 'FOB',
        pol: route.pol,
        pod: route.pod,
        finalDestination: route.pod,
        shippingLine: 'HANSAI SHIPPING LINE',
        vesselName: vessel.vesselName,
        voyageNumber: `VOY-2026-${String(s).padStart(2, '0')}`,
        bookingNumber: `BKG-HNS-${202600 + s}`,
        blNumber: `HNSU-BL-${2026000 + s}`,
        etd,
        eta,
        actualDeparture: status !== 'Booking Confirmed' ? etd : null,
        actualArrival: status === 'Delivered' ? eta : null,
        freightCost,
        thcOrigin: thcOrig,
        thcDestination: thcDest,
        insurance: ins,
        customsCharges: customs,
        otherExpenses: other,
        totalCost,
        sellingRate,
        status: status === 'Delivered' ? 'Delivered' : (status === 'Booking Confirmed' ? 'Booking Confirmed' : 'In Transit'),
        notes: `International shipment handled by HANSAI logistics network. Clean Bill of Lading.`,
      },
    });

    // 12-stage tracking timeline
    let completedStagesCount = 12;
    if (status === 'Booking Confirmed') completedStagesCount = 2;
    else if (status === 'Vessel Departure') completedStagesCount = 6;
    else if (status === 'In Transit') completedStagesCount = 7;
    else if (status === 'Customs Cleared') completedStagesCount = 9;

    for (let st = 1; st <= 12; st++) {
      const stageName = trackingStagesList[st - 1];
      const isCompleted = st <= completedStagesCount;
      const isInProgress = st === completedStagesCount + 1 && completedStagesCount < 12;

      await prisma.shipmentTracking.create({
        data: {
          shipmentId: shp.id,
          stageOrder: st,
          stageName,
          status: isCompleted ? 'Completed' : (isInProgress ? 'In Progress' : 'Pending'),
          location: st <= 5 ? route.pol : (st >= 8 ? route.pod : 'At Sea / High Seas Route'),
          timestamp: isCompleted ? new Date(etd.getTime() + (st - 4) * 86400000) : null,
          notes: isCompleted ? `Checkpoint cleared successfully under inspection standard.` : null,
          updatedBy: 'Operations Dispatch Center',
        },
      });
    }

    // Also create THC and Tax transactions for this shipment
    await prisma.tHCTransaction.create({
      data: {
        shipmentId: shp.id,
        portType: 'Origin',
        portName: route.pol,
        containerType: comm.type,
        quantity: 1,
        ratePerContainer: thcOrig,
        additionalHandling: 25,
        vatRate: 11,
        vatAmount: (thcOrig + 25) * 0.11,
        totalThc: (thcOrig + 25) * 1.11,
        currency: 'USD',
      },
    });
  }

  console.log('--- Seeding 35 Invoices and Payments ---');
  const invoiceTypes = [
    'Sales Invoice',
    'Rental Invoice',
    'Container Purchase Invoice',
    'Container Sales Invoice',
    'Vessel Invoice',
    'Proforma Invoice',
  ];

  for (let inv = 1; inv <= 35; inv++) {
    const cust = createdCustomers[(inv - 1) % createdCustomers.length];
    const supp = createdSuppliers[(inv - 1) % createdSuppliers.length];
    const type = invoiceTypes[(inv - 1) % invoiceTypes.length];
    const isSupplierInv = type === 'Container Purchase Invoice';
    const subtotal = 4500 + (inv * 950);
    const taxRate = 11.0;
    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxAmount;
    const isPaid = inv % 3 !== 0;
    const isPartial = inv % 7 === 0;
    const paidAmount = isPaid ? totalAmount : (isPartial ? Math.round(totalAmount * 0.4) : 0);
    const balanceDue = totalAmount - paidAmount;
    const isOverdue = inv === 5 || inv === 12;
    const status = isPaid ? 'Paid' : (isPartial ? 'Partial' : (isOverdue ? 'Overdue' : 'Pending'));

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-2026-${String(inv).padStart(4, '0')}`,
        invoiceType: type,
        customerId: isSupplierInv ? null : cust.id,
        supplierId: isSupplierInv ? supp.id : null,
        issueDate: new Date(Date.now() - (inv * 4 + 10) * 86400000),
        dueDate: isOverdue ? new Date(Date.now() - 5 * 86400000) : new Date(Date.now() + (25 - inv) * 86400000),
        currency: 'USD',
        subtotal,
        taxRate,
        taxAmount,
        totalAmount,
        paidAmount,
        balanceDue,
        status,
        notes: `Standard commercial invoice for maritime freight and container services.`,
        terms: 'Payment due within 30 days of invoice date. Late fee applies.',
      },
    });

    // Invoice line items
    await prisma.invoiceItem.create({
      data: {
        invoiceId: invoice.id,
        description: `Ocean Freight & Logistics Services - Contract Ref #${inv}`,
        quantity: 1,
        unitPrice: subtotal * 0.7,
        amount: subtotal * 0.7,
      },
    });
    await prisma.invoiceItem.create({
      data: {
        invoiceId: invoice.id,
        description: `Terminal Handling Charges (THC) & Port Documentation`,
        quantity: 1,
        unitPrice: subtotal * 0.3,
        amount: subtotal * 0.3,
      },
    });

    // Payment if paid
    if (paidAmount > 0) {
      await prisma.payment.create({
        data: {
          paymentNumber: `RCT-2026-${String(inv).padStart(4, '0')}`,
          invoiceId: invoice.id,
          paymentDate: new Date(Date.now() - (inv * 3) * 86400000),
          amount: paidAmount,
          paymentMethod: 'Bank Transfer (Telegraphic Transfer)',
          referenceNumber: `TRF-BCA-${2026000 + inv}`,
          notes: `Settlement via Citibank / BCA Nostro account.`,
        },
      });
    }
  }

  console.log('--- Seeding 120+ Financial Transactions across 4 Divisions ---');
  const divisions = [
    'Shipping Line',
    'Container Rental',
    'Container Trading',
    'Vessel Trading',
  ];

  const transactionTemplates = [
    { div: 'Shipping Line', type: 'Income', cat: 'Ocean Freight', desc: 'Freight revenue for Asia-Middle East trade lane', baseAmount: 28500 },
    { div: 'Shipping Line', type: 'Expense', cat: 'Fuel', desc: 'Bunkering 45 MT VLSFO at Port of Tanjung Priok', baseAmount: 32000 },
    { div: 'Shipping Line', type: 'Expense', cat: 'Port Charges', desc: 'Pilotage, towage, and berthage dues', baseAmount: 6800 },
    { div: 'Shipping Line', type: 'Expense', cat: 'THC Origin', desc: 'Terminal handling charge settlement to terminal operator', baseAmount: 4200 },
    { div: 'Container Rental', type: 'Income', cat: 'Container Rental', desc: 'Monthly container leasing revenue - Corporate clients', baseAmount: 18500 },
    { div: 'Container Rental', type: 'Expense', cat: 'Maintenance', desc: 'Depot container structural repair & PTI reefer servicing', baseAmount: 3900 },
    { div: 'Container Trading', type: 'Income', cat: 'Container Sales', desc: 'Proceeds from sale of 40FT HC cargo-worthy containers', baseAmount: 42000 },
    { div: 'Container Trading', type: 'Expense', cat: 'Container Purchase', desc: 'Procurement of brand-new ISO container batch', baseAmount: 29000 },
    { div: 'Vessel Trading', type: 'Income', cat: 'Vessel Sales', desc: 'Realized proceeds from Tugboat & Barge sale transaction', baseAmount: 185000 },
    { div: 'Vessel Trading', type: 'Expense', cat: 'Maintenance', desc: 'Vessel drydock overhaul & class survey certification', baseAmount: 65000 },
    { div: 'Shipping Line', type: 'Income', cat: 'Handling Charges', desc: 'Documentation, CFS destuffing & BL release fees', baseAmount: 5400 },
    { div: 'Shipping Line', type: 'Expense', cat: 'Crew Salaries', desc: 'Monthly seafarers and officers payroll disbursement', baseAmount: 45000 },
  ];

  for (let t = 1; t <= 120; t++) {
    const tmpl = transactionTemplates[(t - 1) % transactionTemplates.length];
    const amount = tmpl.baseAmount + (t * 120);
    const date = new Date(Date.now() - (120 - t) * 86400000);
    const rate = 16250;
    const amountIdr = amount * rate;

    await prisma.financialTransaction.create({
      data: {
        transactionNumber: `TRX-2026-${String(t).padStart(4, '0')}`,
        date,
        division: tmpl.div,
        type: tmpl.type,
        category: tmpl.cat,
        amount,
        currency: 'USD',
        exchangeRate: rate,
        amountIdr,
        referenceType: 'General',
        referenceId: `REF-${2026000 + t}`,
        description: tmpl.desc,
        paymentMethod: 'Bank Transfer',
        status: 'Completed',
        createdBy: 'Finance Manager',
      },
    });
  }

  console.log('--- Seeding Calculator Histories & Audit Logs ---');
  await prisma.calculatorHistory.create({
    data: {
      calculatorType: 'OceanFreight',
      inputDataJson: JSON.stringify({ containerType: '40FT HC', quantity: 4, baseFreight: 2200, baf: 250, caf: 150, isps: 50, thc: 180, docs: 75 }),
      resultDataJson: JSON.stringify({ totalPerUnit: 2905, grandTotal: 11620, currency: 'USD' }),
      savedBy: createdUsers[0].id,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: createdUsers[0].id,
      userName: createdUsers[0].name,
      action: 'INIT_SYSTEM',
      module: 'System',
      recordId: 'SYSTEM-ROOT',
      details: 'Enterprise system initialization and realistic DEMO DATA seeded successfully.',
      ipAddress: '127.0.0.1',
    },
  });

  console.log('=== SEEDING COMPLETED SUCCESSFULLY ===');
}

// Allow direct CLI execution: node prisma/seed.js
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .catch((e) => {
      console.error('Error during seeding:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

