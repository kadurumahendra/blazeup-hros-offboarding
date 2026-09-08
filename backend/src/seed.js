import mongoose from 'mongoose';
import { connectDB, disconnectDB } from './config/db.js';
import { User, ROLES } from './models/User.js';
import { Employee, EMPLOYEE_STATUS } from './models/Employee.js';
import { WorkflowTemplate, EXECUTION_TYPES, PROCESS_TYPES } from './models/WorkflowTemplate.js';
import { Offboarding, OFFBOARDING_STATUS } from './models/Offboarding.js';
import { WorkflowInstance, STAGE_STATUS, WORKFLOW_STATUS } from './models/WorkflowInstance.js';
import { AccessRevocation, ACCESS_STATUS } from './models/AccessRevocation.js';
import { DocumentClause } from './models/DocumentClause.js';
import { Notification } from './models/Notification.js';
import { AuditLog, AUDIT_ACTIONS } from './models/AuditLog.js';
import { Document, DOCUMENT_TYPES } from './models/Document.js';

export const runSeed = async () => {
  console.log('🌱 [Seeder] Starting database population for BlazeUp HROS...');
  await connectDB();

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Employee.deleteMany({}),
    WorkflowTemplate.deleteMany({}),
    WorkflowInstance.deleteMany({}),
    Offboarding.deleteMany({}),
    AccessRevocation.deleteMany({}),
    DocumentClause.deleteMany({}),
    Notification.deleteMany({}),
    AuditLog.deleteMany({}),
    Document.deleteMany({})
  ]);

  console.log('🧹 [Seeder] Cleared previous database collections.');

  const defaultPassword = 'Password123!';

  // 1. Create Multiple System Users across all 8 Roles
  const seedUsers = [
    // SUPER_ADMIN
    {
      name: 'Alexander Pierce',
      email: 'superadmin@blazeup.com',
      password: defaultPassword,
      role: ROLES.SUPER_ADMIN,
      department: 'Executive Leadership',
      designation: 'Chief Technology Officer'
    },
    {
      name: 'Victoria Vance',
      email: 'victoria.admin@blazeup.com',
      password: defaultPassword,
      role: ROLES.SUPER_ADMIN,
      department: 'Executive Leadership',
      designation: 'Head of Enterprise Systems'
    },

    // HR_ADMIN
    {
      name: 'Sarah Jenkins',
      email: 'hradmin@blazeup.com',
      password: defaultPassword,
      role: ROLES.HR_ADMIN,
      department: 'Human Resources',
      designation: 'Director of People Operations'
    },
    {
      name: 'Robert Sterling',
      email: 'robert.hr@blazeup.com',
      password: defaultPassword,
      role: ROLES.HR_ADMIN,
      department: 'Human Resources',
      designation: 'VP of Human Resources'
    },

    // HR
    {
      name: 'Priya Sharma',
      email: 'hr@blazeup.com',
      password: defaultPassword,
      role: ROLES.HR,
      department: 'Human Resources',
      designation: 'Senior HR Business Partner'
    },
    {
      name: 'Ananya Roy',
      email: 'ananya.roy@blazeup.com',
      password: defaultPassword,
      role: ROLES.HR,
      department: 'Human Resources',
      designation: 'HR Operations Lead'
    },

    // MANAGER
    {
      name: 'Marcus Vance',
      email: 'manager@blazeup.com',
      password: defaultPassword,
      role: ROLES.MANAGER,
      department: 'Engineering',
      designation: 'Engineering Manager'
    },
    {
      name: 'Rajesh Menon',
      email: 'rajesh.menon@blazeup.com',
      password: defaultPassword,
      role: ROLES.MANAGER,
      department: 'Product & Design',
      designation: 'Director of Product Engineering'
    },

    // ADMIN_SYSTEMS (IT)
    {
      name: 'David Chen',
      email: 'itadmin@blazeup.com',
      password: defaultPassword,
      role: ROLES.ADMIN_SYSTEMS,
      department: 'Admin & IT Systems',
      designation: 'Lead Infrastructure Engineer'
    },
    {
      name: 'Karan Verma',
      email: 'karan.verma@blazeup.com',
      password: defaultPassword,
      role: ROLES.ADMIN_SYSTEMS,
      department: 'Admin & IT Systems',
      designation: 'Senior IT Security Administrator'
    },

    // ACCOUNTS
    {
      name: 'Elena Rostova',
      email: 'accounts@blazeup.com',
      password: defaultPassword,
      role: ROLES.ACCOUNTS,
      department: 'Finance & Accounts',
      designation: 'Head of Financial Compliance'
    },
    {
      name: 'Suresh Patel',
      email: 'suresh.patel@blazeup.com',
      password: defaultPassword,
      role: ROLES.ACCOUNTS,
      department: 'Finance & Accounts',
      designation: 'Senior Treasury & Payroll Manager'
    },

    // PERSONNEL
    {
      name: 'Vikram Mehta',
      email: 'personnel@blazeup.com',
      password: defaultPassword,
      role: ROLES.PERSONNEL,
      department: 'Personnel & Facilities',
      designation: 'Facilities & Asset Coordinator'
    },
    {
      name: 'Sunita Rao',
      email: 'sunita.rao@blazeup.com',
      password: defaultPassword,
      role: ROLES.PERSONNEL,
      department: 'Personnel & Facilities',
      designation: 'Workplace Operations Lead'
    },

    // EMPLOYEE Accounts
    {
      name: 'Rahul Kumar',
      email: 'rahul.kumar@blazeup.com',
      password: defaultPassword,
      role: ROLES.EMPLOYEE,
      department: 'Engineering',
      designation: 'Senior Full Stack Developer'
    },
    {
      name: 'Arun Kumar',
      email: 'arun.kumar@blazeup.com',
      password: defaultPassword,
      role: ROLES.EMPLOYEE,
      department: 'Engineering',
      designation: 'Frontend Software Engineer'
    },
    {
      name: 'Neha Verma',
      email: 'neha.verma@blazeup.com',
      password: defaultPassword,
      role: ROLES.EMPLOYEE,
      department: 'Sales & Partnerships',
      designation: 'Enterprise Account Executive'
    },
    {
      name: 'Sneha Patel',
      email: 'sneha.patel@blazeup.com',
      password: defaultPassword,
      role: ROLES.EMPLOYEE,
      department: 'Product Design',
      designation: 'Lead UI/UX Designer'
    },
    {
      name: 'Amit Sharma',
      email: 'amit.sharma@blazeup.com',
      password: defaultPassword,
      role: ROLES.EMPLOYEE,
      department: 'Marketing',
      designation: 'Growth Marketing Manager'
    }
  ];

  const createdUsers = await User.create(seedUsers);
  const userMap = {};
  createdUsers.forEach(u => {
    userMap[u.email] = u;
  });

  const primaryRoleMap = {
    [ROLES.SUPER_ADMIN]: userMap['superadmin@blazeup.com'],
    [ROLES.HR_ADMIN]: userMap['hradmin@blazeup.com'],
    [ROLES.HR]: userMap['hr@blazeup.com'],
    [ROLES.MANAGER]: userMap['manager@blazeup.com'],
    [ROLES.ADMIN_SYSTEMS]: userMap['itadmin@blazeup.com'],
    [ROLES.ACCOUNTS]: userMap['accounts@blazeup.com'],
    [ROLES.PERSONNEL]: userMap['personnel@blazeup.com'],
    [ROLES.EMPLOYEE]: userMap['rahul.kumar@blazeup.com']
  };

  console.log(`✅ [Seeder] Created ${createdUsers.length} system users across all 8 roles.`);

  // 2. Create Sample Employees
  const employeeData = [
    {
      employeeCode: 'BLZ-101',
      firstName: 'Rahul',
      lastName: 'Kumar',
      email: 'rahul.kumar@blazeup.com',
      phone: '+91 98765 43210',
      department: 'Engineering',
      designation: 'Senior Full Stack Developer',
      managerId: primaryRoleMap[ROLES.MANAGER]._id,
      managerName: primaryRoleMap[ROLES.MANAGER].name,
      joiningDate: new Date('2023-03-15'),
      location: 'Bangalore HQ',
      employmentType: 'FULL_TIME',
      status: EMPLOYEE_STATUS.NOTICE_PERIOD
    },
    {
      employeeCode: 'BLZ-102',
      firstName: 'Arun',
      lastName: 'Kumar',
      email: 'arun.kumar@blazeup.com',
      phone: '+91 98765 43220',
      department: 'Engineering',
      designation: 'Frontend Software Engineer',
      managerId: primaryRoleMap[ROLES.MANAGER]._id,
      managerName: primaryRoleMap[ROLES.MANAGER].name,
      joiningDate: new Date('2023-07-01'),
      location: 'Bangalore HQ',
      employmentType: 'FULL_TIME',
      status: EMPLOYEE_STATUS.ACTIVE
    },
    {
      employeeCode: 'BLZ-103',
      firstName: 'Neha',
      lastName: 'Verma',
      email: 'neha.verma@blazeup.com',
      phone: '+91 98765 43215',
      department: 'Sales & Partnerships',
      designation: 'Enterprise Account Executive',
      managerId: userMap['rajesh.menon@blazeup.com']._id,
      managerName: userMap['rajesh.menon@blazeup.com'].name,
      joiningDate: new Date('2023-09-01'),
      location: 'Bangalore HQ',
      employmentType: 'FULL_TIME',
      status: EMPLOYEE_STATUS.NOTICE_PERIOD
    },
    {
      employeeCode: 'BLZ-104',
      firstName: 'Sneha',
      lastName: 'Patel',
      email: 'sneha.patel@blazeup.com',
      phone: '+91 98765 43211',
      department: 'Product Design',
      designation: 'Lead UI/UX Designer',
      managerId: primaryRoleMap[ROLES.MANAGER]._id,
      managerName: primaryRoleMap[ROLES.MANAGER].name,
      joiningDate: new Date('2022-08-01'),
      location: 'Mumbai Tech Hub',
      employmentType: 'FULL_TIME',
      status: EMPLOYEE_STATUS.RELIEVED
    },
    {
      employeeCode: 'BLZ-105',
      firstName: 'Amit',
      lastName: 'Sharma',
      email: 'amit.sharma@blazeup.com',
      phone: '+91 98765 43212',
      department: 'Marketing',
      designation: 'Growth Marketing Manager',
      managerId: primaryRoleMap[ROLES.MANAGER]._id,
      managerName: primaryRoleMap[ROLES.MANAGER].name,
      joiningDate: new Date('2021-11-10'),
      location: 'Delhi Regional Office',
      employmentType: 'FULL_TIME',
      status: EMPLOYEE_STATUS.ACTIVE
    }
  ];

  const createdEmployees = await Employee.create(employeeData);
  const empMap = {};
  createdEmployees.forEach(e => (empMap[e.email] = e));

  // Link user accounts to their respective employee records
  for (const emp of createdEmployees) {
    if (userMap[emp.email]) {
      await User.findByIdAndUpdate(userMap[emp.email]._id, { employeeId: emp._id });
    }
  }

  console.log(`✅ [Seeder] Created and linked ${createdEmployees.length} employee records.`);

  // 3. Create Default Workflow Template: "Employee Offboarding Pipeline"
  const defaultWorkflow = await WorkflowTemplate.create({
    name: 'Standard Employee Offboarding Pipeline',
    processType: PROCESS_TYPES.OFFBOARDING,
    description: 'Enterprise clearance protocol supporting parallel manager/IT/finance reviews followed by personnel and final HR authorization.',
    isActive: true,
    createdBy: primaryRoleMap[ROLES.HR_ADMIN]._id,
    stages: [
      {
        stageId: 'stage_manager',
        name: 'Project & Reporting Manager Clearance',
        role: ROLES.MANAGER,
        order: 1,
        executionType: EXECUTION_TYPES.PARALLEL,
        dependsOn: [],
        reminderAfterHours: 24,
        deadlineHours: 48,
        isRequired: true,
        checklist: [
          { itemId: 'mgr_chk_1', label: 'Project completion & code review verified', isRequired: true, category: 'Technical' },
          { itemId: 'mgr_chk_2', label: 'Knowledge transfer session completed with team', isRequired: true, category: 'Handover' },
          { itemId: 'mgr_chk_3', label: 'Client documentation & handover signed off', isRequired: true, category: 'Handover' },
          { itemId: 'mgr_chk_4', label: 'Project repository permissions reviewed', isRequired: true, category: 'Security' }
        ]
      },
      {
        stageId: 'stage_admin_systems',
        name: 'Admin & Systems Clearance',
        role: ROLES.ADMIN_SYSTEMS,
        order: 2,
        executionType: EXECUTION_TYPES.PARALLEL,
        dependsOn: [],
        reminderAfterHours: 24,
        deadlineHours: 48,
        isRequired: true,
        checklist: [
          { itemId: 'it_chk_1', label: 'Company laptop returned & hardware verified', isRequired: true, category: 'Hardware' },
          { itemId: 'it_chk_2', label: 'Charger, adapters & peripherals returned', isRequired: true, category: 'Hardware' },
          { itemId: 'it_chk_3', label: 'Google Workspace / M365 Email access revoked', isRequired: true, category: 'Access' },
          { itemId: 'it_chk_4', label: 'VPN, Cloud (AWS/GCP), Git & Slack access revoked', isRequired: true, category: 'Access' }
        ]
      },
      {
        stageId: 'stage_accounts',
        name: 'Finance & Accounts Clearance',
        role: ROLES.ACCOUNTS,
        order: 3,
        executionType: EXECUTION_TYPES.PARALLEL,
        dependsOn: [],
        reminderAfterHours: 24,
        deadlineHours: 48,
        isRequired: true,
        checklist: [
          { itemId: 'acc_chk_1', label: 'Corporate credit card surrendered & settled', isRequired: true, category: 'Financial' },
          { itemId: 'acc_chk_2', label: 'Pending travel advances & expense claims verified', isRequired: true, category: 'Financial' },
          { itemId: 'acc_chk_3', label: 'Staff loans / Salary advances reconciled', isRequired: true, category: 'Financial' },
          { itemId: 'acc_chk_4', label: 'No financial liability clearance certificate issued', isRequired: true, category: 'Financial' }
        ]
      },
      {
        stageId: 'stage_personnel',
        name: 'Personnel & Facilities Clearance',
        role: ROLES.PERSONNEL,
        order: 4,
        executionType: EXECUTION_TYPES.SEQUENTIAL,
        dependsOn: ['stage_manager', 'stage_admin_systems', 'stage_accounts'],
        reminderAfterHours: 24,
        deadlineHours: 48,
        isRequired: true,
        checklist: [
          { itemId: 'fac_chk_1', label: 'Physical Employee ID card surrendered', isRequired: true, category: 'Facilities' },
          { itemId: 'fac_chk_2', label: 'RFID building & parking access pass revoked', isRequired: true, category: 'Facilities' },
          { itemId: 'fac_chk_3', label: 'Drawer/Pedestal locker keys returned', isRequired: true, category: 'Facilities' },
          { itemId: 'fac_chk_4', label: 'Remaining physical company assets recovered', isRequired: true, category: 'Facilities' }
        ]
      },
      {
        stageId: 'stage_hr',
        name: 'HR Final Clearance & Document Approval',
        role: ROLES.HR,
        order: 5,
        executionType: EXECUTION_TYPES.SEQUENTIAL,
        dependsOn: ['stage_personnel'],
        reminderAfterHours: 24,
        deadlineHours: 48,
        isRequired: true,
        checklist: [
          { itemId: 'hr_chk_1', label: 'Comprehensive exit interview completed & documented', isRequired: true, category: 'Exit Formalities' },
          { itemId: 'hr_chk_2', label: 'All prior departmental clearances audited and verified', isRequired: true, category: 'Audit' },
          { itemId: 'hr_chk_3', label: 'Full & Final (F&F) settlement approved for dispatch', isRequired: true, category: 'Settlement' },
          { itemId: 'hr_chk_4', label: 'Statutory release letters (NOC, Relieving, Experience) approved', isRequired: true, category: 'Documentation' }
        ]
      }
    ]
  });

  console.log(`✅ [Seeder] Created default workflow template: ${defaultWorkflow.name}`);

  // 4. Create Document Clauses
  await DocumentClause.create({
    companyName: 'BlazeUp Technologies Pvt. Ltd.',
    companyAddress: 'Level 8, Tech Park Nexus, Outer Ring Road, Bangalore - 560103, Karnataka, India',
    signatoryName: 'Priya Sharma',
    signatoryTitle: 'Senior HR Business Partner & People Operations',
    nonCompeteClause: 'The employee covenants not to directly engage with direct competitors in a competing software capability for a duration of six (6) months from separation.',
    nonSolicitationClause: 'The employee undertakes not to solicit or recruit current employees, contractors, or clients of BlazeUp Technologies for twelve (12) months following separation.',
    confidentialityClause: 'All source code, trade secrets, architecture diagrams, and client confidentiality obligations survive termination indefinitely.'
  });

  // 5. Create Active In-Progress Offboarding Case for Rahul Kumar
  const rahulEmp = empMap['rahul.kumar@blazeup.com'];
  const rahulOffboarding = await Offboarding.create({
    employeeId: rahulEmp._id,
    resignationDate: new Date('2026-09-01'),
    lastWorkingDay: new Date('2026-10-01'),
    reason: 'Better Career Opportunity',
    details: 'Pursuing senior engineering role with focus on distributed cloud systems. Knowledge transfer in progress with team.',
    status: OFFBOARDING_STATUS.IN_PROGRESS,
    initiatedBy: primaryRoleMap[ROLES.HR_ADMIN]._id
  });

  const rahulInstance = await WorkflowInstance.create({
    templateId: defaultWorkflow._id,
    processType: PROCESS_TYPES.OFFBOARDING,
    offboardingId: rahulOffboarding._id,
    employeeId: rahulEmp._id,
    status: WORKFLOW_STATUS.IN_PROGRESS,
    startedAt: new Date('2026-09-01'),
    stages: defaultWorkflow.stages.map(s => ({
      stageId: s.stageId,
      stageName: s.name,
      role: s.role,
      order: s.order,
      executionType: s.executionType,
      dependsOn: s.dependsOn,
      status: s.order <= 3 ? STAGE_STATUS.ACTIVE : STAGE_STATUS.WAITING,
      checklist: s.checklist.map(c => ({
        ...c.toObject(),
        isCompleted: false,
        completedAt: null,
        completedBy: null
      })),
      remarks: '',
      startedAt: s.order <= 3 ? new Date() : null,
      dueDate: new Date(Date.now() + 48 * 3600 * 1000)
    }))
  });

  rahulOffboarding.workflowInstanceId = rahulInstance._id;
  await rahulOffboarding.save();

  // Create Access Revocation record for Rahul
  await AccessRevocation.create({
    offboardingId: rahulOffboarding._id,
    employeeId: rahulEmp._id,
    allRevoked: false,
    lastUpdatedBy: primaryRoleMap[ROLES.ADMIN_SYSTEMS]._id,
    items: [
      { accessKey: 'EMAIL', systemName: 'Google Workspace / M365 Email', status: ACCESS_STATUS.ACTIVE, isSimulated: true },
      { accessKey: 'SYSTEM_AD', systemName: 'Active Directory / Okta SSO', status: ACCESS_STATUS.ACTIVE, isSimulated: true },
      { accessKey: 'VPN', systemName: 'Corporate OpenVPN Gateways', status: ACCESS_STATUS.ACTIVE, isSimulated: true },
      { accessKey: 'AWS_PROD', systemName: 'AWS Production Infrastructure', status: ACCESS_STATUS.ACTIVE, isSimulated: true },
      { accessKey: 'GITHUB', systemName: 'GitHub Enterprise Repositories', status: ACCESS_STATUS.ACTIVE, isSimulated: true },
      { accessKey: 'SLACK', systemName: 'Enterprise Slack Workspaces', status: ACCESS_STATUS.ACTIVE, isSimulated: true }
    ]
  });

  // Seed Resignation Acceptance Letter for Rahul
  await Document.create({
    offboardingId: rahulOffboarding._id,
    employeeId: rahulEmp._id,
    type: DOCUMENT_TYPES.RESIGNATION_ACCEPTANCE,
    title: 'Resignation Acceptance Letter',
    fileName: `RESIGNATION_ACCEPTANCE_${rahulEmp.employeeCode}.pdf`,
    generatedBy: primaryRoleMap[ROLES.HR]._id,
    generatedByName: primaryRoleMap[ROLES.HR].name,
    generatedAt: new Date('2026-09-02')
  });

  // 6. Create Active Offboarding Case for Neha Verma
  const nehaEmp = empMap['neha.verma@blazeup.com'];
  const nehaOffboarding = await Offboarding.create({
    employeeId: nehaEmp._id,
    resignationDate: new Date('2026-09-05'),
    lastWorkingDay: new Date('2026-10-05'),
    reason: 'Relocation / Family Reasons',
    details: 'Relocating to another city for family commitments. Handover of enterprise accounts to client lead.',
    status: OFFBOARDING_STATUS.IN_PROGRESS,
    initiatedBy: primaryRoleMap[ROLES.HR_ADMIN]._id
  });

  const nehaInstance = await WorkflowInstance.create({
    templateId: defaultWorkflow._id,
    processType: PROCESS_TYPES.OFFBOARDING,
    offboardingId: nehaOffboarding._id,
    employeeId: nehaEmp._id,
    status: WORKFLOW_STATUS.IN_PROGRESS,
    startedAt: new Date('2026-09-05'),
    stages: defaultWorkflow.stages.map((s, idx) => ({
      stageId: s.stageId,
      stageName: s.name,
      role: s.role,
      order: s.order,
      executionType: s.executionType,
      dependsOn: s.dependsOn,
      status: idx === 4 ? STAGE_STATUS.ACTIVE : STAGE_STATUS.APPROVED,
      checklist: s.checklist.map(c => ({
        ...c.toObject(),
        isCompleted: idx < 4,
        completedAt: idx < 4 ? new Date() : null,
        completedBy: idx < 4 ? primaryRoleMap[s.role]?._id : null
      })),
      remarks: idx < 4 ? 'Approved by department lead.' : '',
      startedAt: new Date(),
      completedAt: idx < 4 ? new Date() : null,
      dueDate: new Date(Date.now() + 48 * 3600 * 1000),
      approvedBy: idx < 4 ? primaryRoleMap[s.role]?._id : null,
      approvedByName: idx < 4 ? primaryRoleMap[s.role]?.name : null,
      approvedAt: idx < 4 ? new Date() : null
    }))
  });

  nehaOffboarding.workflowInstanceId = nehaInstance._id;
  await nehaOffboarding.save();

  await AccessRevocation.create({
    offboardingId: nehaOffboarding._id,
    employeeId: nehaEmp._id,
    allRevoked: true,
    lastUpdatedBy: primaryRoleMap[ROLES.ADMIN_SYSTEMS]._id,
    items: [
      { accessKey: 'EMAIL', systemName: 'Google Workspace / M365 Email', status: ACCESS_STATUS.REVOKED, revokedBy: primaryRoleMap[ROLES.ADMIN_SYSTEMS]._id, revokedByName: primaryRoleMap[ROLES.ADMIN_SYSTEMS].name, revokedAt: new Date(), isSimulated: true },
      { accessKey: 'SYSTEM_AD', systemName: 'Active Directory / Okta SSO', status: ACCESS_STATUS.REVOKED, revokedBy: primaryRoleMap[ROLES.ADMIN_SYSTEMS]._id, revokedByName: primaryRoleMap[ROLES.ADMIN_SYSTEMS].name, revokedAt: new Date(), isSimulated: true },
      { accessKey: 'CRM', systemName: 'Salesforce CRM Access', status: ACCESS_STATUS.REVOKED, revokedBy: primaryRoleMap[ROLES.ADMIN_SYSTEMS]._id, revokedByName: primaryRoleMap[ROLES.ADMIN_SYSTEMS].name, revokedAt: new Date(), isSimulated: true },
      { accessKey: 'SLACK', systemName: 'Enterprise Slack Workspaces', status: ACCESS_STATUS.REVOKED, revokedBy: primaryRoleMap[ROLES.ADMIN_SYSTEMS]._id, revokedByName: primaryRoleMap[ROLES.ADMIN_SYSTEMS].name, revokedAt: new Date(), isSimulated: true }
    ]
  });

  await Document.create([
    {
      offboardingId: nehaOffboarding._id,
      employeeId: nehaEmp._id,
      type: DOCUMENT_TYPES.RESIGNATION_ACCEPTANCE,
      title: 'Resignation Acceptance Letter',
      fileName: `RESIGNATION_ACCEPTANCE_${nehaEmp.employeeCode}.pdf`,
      generatedBy: primaryRoleMap[ROLES.HR]._id,
      generatedByName: primaryRoleMap[ROLES.HR].name,
      generatedAt: new Date('2026-09-05')
    },
    {
      offboardingId: nehaOffboarding._id,
      employeeId: nehaEmp._id,
      type: DOCUMENT_TYPES.NOC,
      title: 'Clearance Certificate (NOC)',
      fileName: `NOC_${nehaEmp.employeeCode}.pdf`,
      generatedBy: primaryRoleMap[ROLES.HR]._id,
      generatedByName: primaryRoleMap[ROLES.HR].name,
      generatedAt: new Date('2026-09-07')
    }
  ]);

  // 7. Seed Completed Offboarding Case for Sneha Patel
  const snehaEmp = empMap['sneha.patel@blazeup.com'];
  const snehaOffboarding = await Offboarding.create({
    employeeId: snehaEmp._id,
    resignationDate: new Date('2026-08-01'),
    lastWorkingDay: new Date('2026-08-31'),
    reason: 'Higher Education / Studies',
    details: 'Pursuing Master in Interaction Design abroad.',
    status: OFFBOARDING_STATUS.COMPLETED,
    initiatedBy: primaryRoleMap[ROLES.HR_ADMIN]._id,
    completedAt: new Date('2026-08-31')
  });

  const snehaInstance = await WorkflowInstance.create({
    templateId: defaultWorkflow._id,
    processType: PROCESS_TYPES.OFFBOARDING,
    offboardingId: snehaOffboarding._id,
    employeeId: snehaEmp._id,
    status: WORKFLOW_STATUS.COMPLETED,
    startedAt: new Date('2026-08-01'),
    completedAt: new Date('2026-08-31'),
    stages: defaultWorkflow.stages.map(s => ({
      stageId: s.stageId,
      stageName: s.name,
      role: s.role,
      order: s.order,
      executionType: s.executionType,
      dependsOn: s.dependsOn,
      status: STAGE_STATUS.APPROVED,
      checklist: s.checklist.map(c => ({
        ...c.toObject(),
        isCompleted: true,
        completedAt: new Date('2026-08-25'),
        completedBy: primaryRoleMap[s.role]?._id
      })),
      remarks: 'Clearance signed off satisfactorily.',
      startedAt: new Date('2026-08-01'),
      completedAt: new Date('2026-08-25'),
      dueDate: new Date('2026-08-15'),
      approvedBy: primaryRoleMap[s.role]?._id,
      approvedByName: primaryRoleMap[s.role]?.name,
      approvedAt: new Date('2026-08-25')
    }))
  });

  snehaOffboarding.workflowInstanceId = snehaInstance._id;
  await snehaOffboarding.save();

  await Document.create([
    {
      offboardingId: snehaOffboarding._id,
      employeeId: snehaEmp._id,
      type: DOCUMENT_TYPES.RESIGNATION_ACCEPTANCE,
      title: 'Resignation Acceptance Letter',
      fileName: `RESIGNATION_ACCEPTANCE_${snehaEmp.employeeCode}.pdf`,
      generatedBy: primaryRoleMap[ROLES.HR]._id,
      generatedByName: primaryRoleMap[ROLES.HR].name,
      generatedAt: new Date('2026-08-02')
    },
    {
      offboardingId: snehaOffboarding._id,
      employeeId: snehaEmp._id,
      type: DOCUMENT_TYPES.NOC,
      title: 'Clearance Certificate (NOC)',
      fileName: `NOC_${snehaEmp.employeeCode}.pdf`,
      generatedBy: primaryRoleMap[ROLES.HR]._id,
      generatedByName: primaryRoleMap[ROLES.HR].name,
      generatedAt: new Date('2026-08-31')
    },
    {
      offboardingId: snehaOffboarding._id,
      employeeId: snehaEmp._id,
      type: DOCUMENT_TYPES.RELIEVING_LETTER,
      title: 'Relieving Letter',
      fileName: `RELIEVING_LETTER_${snehaEmp.employeeCode}.pdf`,
      generatedBy: primaryRoleMap[ROLES.HR]._id,
      generatedByName: primaryRoleMap[ROLES.HR].name,
      generatedAt: new Date('2026-08-31')
    },
    {
      offboardingId: snehaOffboarding._id,
      employeeId: snehaEmp._id,
      type: DOCUMENT_TYPES.EXPERIENCE_LETTER,
      title: 'Experience Certificate',
      fileName: `EXPERIENCE_LETTER_${snehaEmp.employeeCode}.pdf`,
      generatedBy: primaryRoleMap[ROLES.HR]._id,
      generatedByName: primaryRoleMap[ROLES.HR].name,
      generatedAt: new Date('2026-08-31')
    }
  ]);

  // 8. Seed Audit Logs
  await AuditLog.create([
    {
      userId: primaryRoleMap[ROLES.HR_ADMIN]._id,
      userName: primaryRoleMap[ROLES.HR_ADMIN].name,
      role: ROLES.HR_ADMIN,
      action: AUDIT_ACTIONS.OFFBOARDING_CREATED,
      offboardingId: rahulOffboarding._id,
      employeeId: rahulEmp._id,
      employeeName: `${rahulEmp.firstName} ${rahulEmp.lastName}`,
      remarks: 'Offboarding case initiated for Rahul Kumar',
      timestamp: new Date('2026-09-01')
    },
    {
      userId: primaryRoleMap[ROLES.HR_ADMIN]._id,
      userName: primaryRoleMap[ROLES.HR_ADMIN].name,
      role: ROLES.HR_ADMIN,
      action: AUDIT_ACTIONS.OFFBOARDING_CREATED,
      offboardingId: nehaOffboarding._id,
      employeeId: nehaEmp._id,
      employeeName: `${nehaEmp.firstName} ${nehaEmp.lastName}`,
      remarks: 'Offboarding case initiated for Neha Verma',
      timestamp: new Date('2026-09-05')
    }
  ]);

  console.log('=====================================================');
  console.log('🎉 [Seeder] Database population completed successfully!');
  console.log('=====================================================');

  await disconnectDB();
};

// If run directly via node src/seed.js
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  runSeed()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('[Seeder Error]', err);
      process.exit(1);
    });
}
