const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding VendorBridge database...');

  // Clean existing data in reverse dependency order
  await prisma.activityLog.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.quotationLineItem.deleteMany();
  await prisma.quotation.deleteMany();
  await prisma.rfqLineItem.deleteMany();
  await prisma.rFQ.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);

  // ── 1. Create Users ──────────────────────────────────────────────────
  const admin = await prisma.user.create({
    data: { name: 'Admin User', email: 'admin@vendorbridge.com', password: hashedPassword, role: 'ADMIN' },
  });

  const manager = await prisma.user.create({
    data: { name: 'Priya Sharma', email: 'manager@vendorbridge.com', password: hashedPassword, role: 'MANAGER' },
  });

  const procurementOfficer = await prisma.user.create({
    data: { name: 'Rahul Verma', email: 'procurement@vendorbridge.com', password: hashedPassword, role: 'PROCUREMENT_OFFICER' },
  });

  // ── 2. Create Vendors ────────────────────────────────────────────────
  const vendorData = [
    { companyName: 'TechCore Solutions Pvt Ltd', category: 'IT Hardware', gstNumber: '27AABCU1234D1Z1', contactEmail: 'info@techcore.in', contactPhone: '9876543210', address: 'B-201, Tech Park, Bangalore', status: 'ACTIVE', rating: 4.5 },
    { companyName: 'Infra Supplies Pvt Ltd', category: 'Furniture', gstNumber: '27AABCI5678E1Z2', contactEmail: 'sales@infrasupplies.in', contactPhone: '9876543211', address: 'C-45, Industrial Area, Mumbai', status: 'ACTIVE', rating: 4.2 },
    { companyName: 'FastLog Transport Co.', category: 'Logistics', gstNumber: '27AABCF9012F1Z3', contactEmail: 'ops@fastlog.in', contactPhone: '9876543212', address: 'Warehouse 12, Transport Nagar, Delhi', status: 'ACTIVE', rating: 3.8 },
    { companyName: 'OfficeNeeds Ltd', category: 'Stationery', gstNumber: '27AABCO3456G1Z4', contactEmail: 'orders@officeneeds.in', contactPhone: '9876543213', address: 'Shop 7, Mall Road, Kolkata', status: 'ACTIVE', rating: 4.0 },
    { companyName: 'GreenEnergy Systems', category: 'Renewable Energy', gstNumber: '27AABCG7890H1Z5', contactEmail: 'hello@greenenergy.in', contactPhone: '9876543214', address: 'Plot 88, Solar Park, Pune', status: 'PENDING', rating: 0.0 },
  ];

  const vendors = [];
  for (const v of vendorData) {
    const vendor = await prisma.vendor.create({ data: v });
    vendors.push(vendor);
  }
  console.log(`  ✅ Created ${vendors.length} vendors`);

  // ── Link vendor users ────────────────────────────────────────────────
  const vendorUsers = [];
  for (let i = 0; i < vendors.length; i++) {
    const vu = await prisma.user.create({
      data: {
        name: `${vendors[i].companyName} Rep`,
        email: `vendor${i + 1}@vendorbridge.com`,
        password: hashedPassword,
        role: 'VENDOR',
        vendorId: vendors[i].id,
      },
    });
    vendorUsers.push(vu);
  }
  console.log(`  ✅ Created ${vendorUsers.length} vendor users`);

  // ── 3. Create RFQs with time-distributed data ────────────────────────
  const rfqTemplates = [
    { title: 'Laptop Procurement Q2 2025', description: 'High-performance laptops for engineering team', category: 'IT Hardware', daysOffset: -60, deadlineOffset: -30, status: 'CLOSED', lineItems: [{ item: 'Dell Latitude 5440', quantity: 50, unit: 'NOS' }, { item: 'Lenovo ThinkPad X1', quantity: 30, unit: 'NOS' }] },
    { title: 'Office Furniture Renovation', description: 'Ergonomic furniture for new office floor', category: 'Furniture', daysOffset: -55, deadlineOffset: -25, status: 'CLOSED', lineItems: [{ item: 'Standing Desks', quantity: 40, unit: 'NOS' }, { item: 'Ergonomic Chairs', quantity: 80, unit: 'NOS' }, { item: 'Conference Table', quantity: 5, unit: 'NOS' }] },
    { title: 'Annual Stationery Supply', description: 'Yearly stationery bulk order', category: 'Stationery', daysOffset: -50, deadlineOffset: -20, status: 'PUBLISHED', lineItems: [{ item: 'A4 Paper Reams', quantity: 500, unit: 'BOX' }, { item: 'Printer Cartridges', quantity: 100, unit: 'NOS' }, { item: 'Notebooks', quantity: 300, unit: 'NOS' }] },
    { title: 'Data Center Cooling Systems', description: 'Cooling infrastructure for new data center', category: 'IT Hardware', daysOffset: -45, deadlineOffset: -15, status: 'CLOSED', lineItems: [{ item: 'AC Units 5 Ton', quantity: 10, unit: 'NOS' }, { item: 'Coolant Pipes', quantity: 200, unit: 'MTR' }] },
    { title: 'Logistics Partner Q3 2025', description: 'Pan-India logistics service provider', category: 'Logistics', daysOffset: -40, deadlineOffset: -10, status: 'PUBLISHED', lineItems: [{ item: 'Full Truckload Service', quantity: 12, unit: 'MONTH' }, { item: 'Warehousing Service', quantity: 10000, unit: 'SQFT' }] },
    { title: 'Solar Panel Installation', description: 'Solar power setup for corporate office', category: 'Renewable Energy', daysOffset: -35, deadlineOffset: -5, status: 'DRAFT', lineItems: [{ item: 'Solar Panels 500W', quantity: 200, unit: 'NOS' }, { item: 'Inverters', quantity: 10, unit: 'NOS' }, { item: 'Battery Bank', quantity: 20, unit: 'NOS' }] },
    { title: 'Network Equipment Upgrade', description: 'Switches, routers & firewalls', category: 'IT Hardware', daysOffset: -30, deadlineOffset: 10, status: 'PUBLISHED', lineItems: [{ item: 'Cisco Switches', quantity: 15, unit: 'NOS' }, { item: 'Firewall Appliances', quantity: 3, unit: 'NOS' }] },
    { title: 'Office Expansion Furniture', description: 'Additional furniture for new wing', category: 'Furniture', daysOffset: -20, deadlineOffset: 20, status: 'PUBLISHED', lineItems: [{ item: 'Workstations', quantity: 25, unit: 'NOS' }, { item: 'Office Chairs', quantity: 50, unit: 'NOS' }] },
    { title: 'Q3 Stationery Requirement', description: 'Quarterly stationery restock', category: 'Stationery', daysOffset: -10, deadlineOffset: 30, status: 'PUBLISHED', lineItems: [{ item: 'Stapler Machines', quantity: 50, unit: 'NOS' }, { item: 'Whiteboard Markers', quantity: 100, unit: 'NOS' }] },
    { title: 'Transport Service Contract', description: 'Employee transport service for new shift', category: 'Logistics', daysOffset: -5, deadlineOffset: 35, status: 'PUBLISHED', lineItems: [{ item: 'AC Bus Service', quantity: 5, unit: 'NOS' }, { item: 'Shuttle Service', quantity: 8, unit: 'NOS' }] },
  ];

  const rfqs = [];
  for (const tpl of rfqTemplates) {
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() + tpl.daysOffset);
    const deadlineDate = new Date();
    deadlineDate.setDate(deadlineDate.getDate() + tpl.deadlineOffset);

    // Assign 2-3 random vendors
    const shuffled = [...vendors].sort(() => Math.random() - 0.5);
    const assignedVendorIds = shuffled.slice(0, 2 + Math.floor(Math.random() * 2)).map(v => v.id);

    const rfq = await prisma.rFQ.create({
      data: {
        title: tpl.title,
        description: tpl.description,
        category: tpl.category,
        deadline: deadlineDate,
        status: tpl.status,
        createdById: procurementOfficer.id,
        lineItems: { create: tpl.lineItems },
        assignedVendors: { connect: assignedVendorIds.map(id => ({ id })) },
      },
      include: { lineItems: true, assignedVendors: true },
    });
    rfqs.push(rfq);

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'CREATED_RFQ',
        performedById: procurementOfficer.id,
        entityType: 'RFQ',
        entityId: rfq.id,
        createdAt: createdDate,
      },
    });
  }
  console.log(`  ✅ Created ${rfqs.length} RFQs with line items`);

  // ── 4. Create Quotations for PUBLISHED/CLOSED RFQs ──────────────────
  const quotationItems = [
    [{ item: 'Dell Latitude 5440', unitPrice: 65000, total: 3250000 }, { item: 'Lenovo ThinkPad X1', unitPrice: 85000, total: 2550000 }],
    [{ item: 'Standing Desks', unitPrice: 35000, total: 1400000 }, { item: 'Ergonomic Chairs', unitPrice: 15000, total: 1200000 }, { item: 'Conference Table', unitPrice: 80000, total: 400000 }],
    [{ item: 'A4 Paper Reams', unitPrice: 2500, total: 1250000 }, { item: 'Printer Cartridges', unitPrice: 3500, total: 350000 }, { item: 'Notebooks', unitPrice: 200, total: 60000 }],
    [{ item: 'AC Units 5 Ton', unitPrice: 120000, total: 1200000 }, { item: 'Coolant Pipes', unitPrice: 500, total: 100000 }],
    [{ item: 'Full Truckload Service', unitPrice: 80000, total: 960000 }, { item: 'Warehousing Service', unitPrice: 50, total: 500000 }],
    [{ item: 'Cisco Switches', unitPrice: 45000, total: 675000 }, { item: 'Firewall Appliances', unitPrice: 120000, total: 360000 }],
    [{ item: 'Workstations', unitPrice: 28000, total: 700000 }, { item: 'Office Chairs', unitPrice: 12000, total: 600000 }],
    [{ item: 'Stapler Machines', unitPrice: 800, total: 40000 }, { item: 'Whiteboard Markers', unitPrice: 150, total: 15000 }],
    [{ item: 'AC Bus Service', unitPrice: 2500000, total: 12500000 }, { item: 'Shuttle Service', unitPrice: 1800000, total: 14400000 }],
  ];

  const gstOptions = [12, 18, 28];
  const deliveryOptions = [15, 21, 30, 45];
  const paymentTermsOptions = ['Net 30', 'Net 45', 'Net 60', 'Advance 50%'];

  let quotationCount = 0;

  for (let i = 0; i < rfqs.length; i++) {
    const rfq = rfqs[i];
    if (rfq.status === 'DRAFT') continue; // No quotes for drafts

    const assignedVendorIds = rfq.assignedVendors.map(v => v.id);
    const itemsTemplate = quotationItems[i] || quotationItems[0];

    // Each assigned vendor submits a quote (minus one for realism)
    const submittingVendors = assignedVendorIds.slice(0, Math.min(assignedVendorIds.length, 3));

    for (let j = 0; j < submittingVendors.length; j++) {
      const vendorId = submittingVendors[j];
      const gstPct = gstOptions[j % gstOptions.length];
      // Vary pricing
      const multiplier = 0.85 + (j * 0.1) + (Math.random() * 0.1);
      const lineItems = itemsTemplate.map(li => ({
        item: li.item,
        unitPrice: Math.round(li.unitPrice * multiplier),
        total: Math.round(li.total * multiplier),
      }));
      const subtotal = lineItems.reduce((sum, li) => sum + li.total, 0);
      const grandTotal = Math.round(subtotal + (subtotal * gstPct / 100));
      const deliveryDays = deliveryOptions[j % deliveryOptions.length];
      const paymentTerms = paymentTermsOptions[j % paymentTermsOptions.length];

      const status = (rfq.status === 'CLOSED' && j === 0) ? 'SELECTED' : (rfq.status === 'CLOSED' ? 'REJECTED' : 'SUBMITTED');

      const quotation = await prisma.quotation.create({
        data: {
          rfqId: rfq.id,
          vendorId,
          subtotal,
          gstPercentage: gstPct,
          grandTotal,
          deliveryDays,
          paymentTerms,
          status,
          quotationLineItems: { create: lineItems },
        },
      });
      quotationCount++;

      const logAction = status === 'SELECTED' ? 'APPROVED_QUOTATION' : 'SUBMITTED_QUOTATION';
      const logDate = new Date();
      logDate.setDate(logDate.getDate() - 30 + i);
      await prisma.activityLog.create({
        data: {
          action: logAction,
          performedById: vendorUsers.find(u => u.vendorId === vendorId)?.id || vendorUsers[0].id,
          entityType: 'Quotation',
          entityId: quotation.id,
          createdAt: logDate,
        },
      });

      // If this RFQ is CLOSED, the selected quote generates a PO
      if (status === 'SELECTED') {
        const poNumber = `PO-${String(100000 + i).slice(-6)}-${j}`;
        const poDate = new Date();
        poDate.setDate(poDate.getDate() - 25 + i);

        const po = await prisma.purchaseOrder.create({
          data: {
            poNumber,
            rfqId: rfq.id,
            vendorId,
            quotationId: quotation.id,
            poDate,
            totalAmount: grandTotal,
            status: j === 0 ? 'SENT' : 'FULFILLED',
          },
        });

        // Generate invoice for POs
        if (j === 0) {
          const cgst = Math.round(subtotal * (gstPct / 2 / 100));
          const sgst = Math.round(subtotal * (gstPct / 2 / 100));
          const issueDate = new Date(poDate);
          issueDate.setDate(issueDate.getDate() + 2);
          const dueDate = new Date(issueDate);
          dueDate.setDate(dueDate.getDate() + 30);

          await prisma.invoice.create({
            data: {
              invoiceNumber: `INV-2025-${String(1000 + i).slice(-4)}`,
              poId: po.id,
              vendorId,
              issueDate,
              dueDate,
              cgst,
              sgst,
              grandTotal,
              status: i % 3 === 0 ? 'PAID' : 'PENDING_PAYMENT',
            },
          });
        }

        // Close the RFQ
        await prisma.rFQ.update({
          where: { id: rfq.id },
          data: { status: 'CLOSED' },
        });

        await prisma.activityLog.create({
          data: {
            action: 'GENERATED_PO',
            performedById: procurementOfficer.id,
            entityType: 'PurchaseOrder',
            entityId: po.id,
            createdAt: poDate,
          },
        });
      }
    }
  }
  console.log(`  ✅ Created ${quotationCount} quotations`);

  // ── 5. Log some generic activities ──────────────────────────────────
  await prisma.activityLog.create({
    data: { action: 'REGISTERED_VENDOR', performedById: admin.id, entityType: 'Vendor', entityId: vendors[0].id },
  });
  await prisma.activityLog.create({
    data: { action: 'REGISTERED_VENDOR', performedById: admin.id, entityType: 'Vendor', entityId: vendors[1].id },
  });

  console.log('  ✅ Created activity logs');
  console.log('');
  console.log('🎉 Seeding complete!');
  console.log('');
  console.log('📋 Login Credentials:');
  console.log('   Admin:               admin@vendorbridge.com / password123');
  console.log('   Manager:             manager@vendorbridge.com / password123');
  console.log('   Procurement Officer: procurement@vendorbridge.com / password123');
  console.log('   Vendor Reps:         vendor1@vendorbridge.com ... vendor5@vendorbridge.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });