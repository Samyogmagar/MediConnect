import mongoose from 'mongoose';
import User from '../models/User.model.js';
import Appointment from '../models/Appointment.model.js';
import DiagnosticTest from '../models/DiagnosticTest.model.js';
import Medication from '../models/Medication.model.js';
import Notification from '../models/Notification.model.js';
import RoleApplication from '../models/RoleApplication.model.js';
import Reminder from '../models/Reminder.model.js';
import DoctorAvailability from '../models/DoctorAvailability.model.js';

// ─── Helpers ───────────────────────────────────────────────

const startOfDay = (d = new Date()) => {
  const s = new Date(d);
  s.setHours(0, 0, 0, 0);
  return s;
};

const endOfDay = (d = new Date()) => {
  const e = new Date(d);
  e.setHours(23, 59, 59, 999);
  return e;
};

const startOfMonth = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), 1);

const startOfWeek = (d = new Date()) => {
  const s = new Date(d);
  s.setDate(s.getDate() - s.getDay());
  s.setHours(0, 0, 0, 0);
  return s;
};

// ─── Patient Dashboard ────────────────────────────────────

export const getPatientDashboard = async (userId) => {
  const id = new mongoose.Types.ObjectId(userId);
  const now = new Date();
  const todayStart = startOfDay();
  const todayEnd = endOfDay();

  const [
    appointmentStats,
    upcomingAppointments,
    diagnosticStats,
    activeMedications,
    todaysReminders,
    unreadNotifications,
  ] = await Promise.all([
    // Appointment counts by status
    Appointment.aggregate([
      { $match: { patientId: id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    // Next 5 upcoming confirmed / pending appointments
    Appointment.find({
      patientId: id,
      dateTime: { $gte: now },
      status: { $in: ['pending', 'confirmed', 'approved'] },
    })
      .sort({ dateTime: 1 })
      .limit(5)
      .populate('doctorId', 'name professionalDetails.specialization professionalDetails.hospital')
      .lean(),

    // Diagnostic test counts by status
    DiagnosticTest.aggregate([
      { $match: { patientId: id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    // Active medication count
    Medication.countDocuments({
      patientId: id,
      status: 'active',
      endDate: { $gte: now },
    }),

    // Today's pending reminders
    Reminder.countDocuments({
      patientId: id,
      reminderDate: { $gte: todayStart, $lte: todayEnd },
      status: 'pending',
    }),

    // Unread notification count
    Notification.countDocuments({ userId: id, isRead: false }),
  ]);

  // Shape appointment stats into a keyed object
  const appointments = { total: 0, pending: 0, confirmed: 0, approved: 0, completed: 0, cancelled: 0, rejected: 0 };
  appointmentStats.forEach(({ _id, count }) => {
    if (_id === 'approved') {
      appointments.confirmed += count;
    } else {
      appointments[_id] = count;
    }
    appointments.total += count;
  });

  const diagnostics = {
    total: 0,
    assigned: 0,
    sample_collected: 0,
    processing: 0,
    report_uploaded: 0,
    cancelled: 0,
  };
  diagnosticStats.forEach(({ _id, count }) => {
    diagnostics[_id] = count;
    diagnostics.total += count;
  });

  return {
    appointments,
    upcomingAppointments,
    diagnostics,
    activeMedications,
    todaysReminders,
    unreadNotifications,
  };
};

// ─── Doctor Dashboard ─────────────────────────────────────

export const getDoctorDashboard = async (userId) => {
  const id = new mongoose.Types.ObjectId(userId);
  const now = new Date();
  const todayStart = startOfDay();
  const todayEnd = endOfDay();
  const monthStart = startOfMonth();

  const [
    appointmentStats,
    todaysAppointments,
    recentPatientIds,
    diagnosticStats,
    medicationStats,
    unreadNotifications,
  ] = await Promise.all([
    // Appointment counts by status
    Appointment.aggregate([
      { $match: { doctorId: id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    // Today's appointments
    Appointment.find({
      doctorId: id,
      dateTime: { $gte: todayStart, $lte: todayEnd },
      status: { $in: ['pending', 'confirmed', 'approved'] },
    })
      .sort({ dateTime: 1 })
      .populate('patientId', 'name email phone')
      .lean(),

    // Unique patients this month
    Appointment.distinct('patientId', {
      doctorId: id,
      createdAt: { $gte: monthStart },
    }),

    // Diagnostic tests prescribed by this doctor
    DiagnosticTest.aggregate([
      { $match: { doctorId: id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    // Medications prescribed by this doctor
    Medication.aggregate([
      { $match: { doctorId: id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    Notification.countDocuments({ userId: id, isRead: false }),
  ]);

  const appointments = { total: 0, pending: 0, confirmed: 0, approved: 0, completed: 0, cancelled: 0, rejected: 0 };
  appointmentStats.forEach(({ _id, count }) => {
    if (_id === 'approved') {
      appointments.confirmed += count;
    } else {
      appointments[_id] = count;
    }
    appointments.total += count;
  });

  const diagnostics = {
    total: 0,
    assigned: 0,
    sample_collected: 0,
    processing: 0,
    report_uploaded: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0,
  };
  diagnosticStats.forEach(({ _id, count }) => {
    diagnostics[_id] = count;
    diagnostics.total += count;
  });
  diagnostics.in_progress = (diagnostics.sample_collected || 0) + (diagnostics.processing || 0);
  diagnostics.completed = diagnostics.report_uploaded || 0;

  const medications = { total: 0, active: 0, completed: 0, discontinued: 0 };
  medicationStats.forEach(({ _id, count }) => {
    medications[_id] = count;
    medications.total += count;
  });

  return {
    appointments,
    todaysAppointments,
    patientsThisMonth: recentPatientIds.length,
    diagnostics,
    medications,
    unreadNotifications,
  };
};

// ─── Lab Dashboard ────────────────────────────────────────

export const getLabDashboard = async (userId) => {
  const id = new mongoose.Types.ObjectId(userId);
  const todayStart = startOfDay();
  const todayEnd = endOfDay();
  const weekStart = startOfWeek();

  const [
    testStats,
    urgencyBreakdown,
    testsReceivedToday,
    testsCompletedThisWeek,
    unreadNotifications,
  ] = await Promise.all([
    // Test counts by status
    DiagnosticTest.aggregate([
      { $match: { labId: id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    // Tests by urgency
    DiagnosticTest.aggregate([
      { $match: { labId: id, status: { $in: ['assigned', 'sample_collected', 'processing'] } } },
      { $group: { _id: '$urgency', count: { $sum: 1 } } },
    ]),

    // Tests assigned today
    DiagnosticTest.countDocuments({
      labId: id,
      createdAt: { $gte: todayStart, $lte: todayEnd },
    }),

    // Tests completed this week
    DiagnosticTest.countDocuments({
      labId: id,
      status: 'report_uploaded',
      updatedAt: { $gte: weekStart },
    }),

    Notification.countDocuments({ userId: id, isRead: false }),
  ]);

  const tests = {
    total: 0,
    assigned: 0,
    sample_collected: 0,
    processing: 0,
    report_uploaded: 0,
    cancelled: 0,
  };
  testStats.forEach(({ _id, count }) => {
    tests[_id] = count;
    tests.total += count;
  });

  const urgency = { routine: 0, urgent: 0, emergency: 0 };
  urgencyBreakdown.forEach(({ _id, count }) => {
    urgency[_id] = count;
  });

  return {
    tests,
    urgency,
    testsReceivedToday,
    testsCompletedThisWeek,
    unreadNotifications,
  };
};

// ─── Admin Dashboard ──────────────────────────────────────

export const getAdminDashboard = async () => {
  const now = new Date();
  const monthStart = startOfMonth();
  const todayStart = startOfDay();
  const todayEnd = endOfDay();

  const [
    userCounts,
    pendingVerifications,
    appointmentStats,
    todaysAppointmentCount,
    diagnosticStats,
    roleApplicationStats,
    newUsersThisMonth,
    medicationStats,
    recentAppointments,
    recentDiagnostics,
    recentMedications,
    recentUsers,
    doctorsWithoutAvailability,
  ] = await Promise.all([
    // Users by role
    User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]),

    // Unverified doctors & labs
    User.countDocuments({ isVerified: false, role: { $in: ['doctor', 'lab'] } }),

    // System-wide appointment stats
    Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    // Today's appointments count
    Appointment.countDocuments({
      dateTime: { $gte: todayStart, $lte: todayEnd },
    }),

    // System-wide diagnostic stats
    DiagnosticTest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    // Role application stats
    RoleApplication.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    // New registrations this month
    User.countDocuments({ createdAt: { $gte: monthStart } }),

    // Medication stats
    Medication.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    // Recent appointments (latest 6)
    Appointment.find()
      .sort({ updatedAt: -1 })
      .limit(6)
      .populate('patientId', 'name')
      .populate('doctorId', 'name professionalDetails.specialization')
      .lean(),

    // Recent diagnostics (latest 6)
    DiagnosticTest.find()
      .sort({ updatedAt: -1 })
      .limit(6)
      .populate('patientId', 'name')
      .populate('doctorId', 'name')
      .populate('labId', 'name')
      .lean(),

    // Recent medications (latest 6)
    Medication.find()
      .sort({ prescribedAt: -1 })
      .limit(6)
      .populate('patientId', 'name')
      .populate('doctorId', 'name')
      .lean(),

    // Recent registrations (latest 6)
    User.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .select('name role createdAt')
      .lean(),

    // Doctors missing availability setup
    DoctorAvailability.distinct('doctorId'),
  ]);

  const users = { total: 0, patient: 0, doctor: 0, lab: 0, admin: 0 };
  userCounts.forEach(({ _id, count }) => {
    users[_id] = count;
    users.total += count;
  });

  const appointments = { total: 0, pending: 0, confirmed: 0, approved: 0, completed: 0, cancelled: 0, rejected: 0 };
  appointmentStats.forEach(({ _id, count }) => {
    if (_id === 'approved') {
      appointments.confirmed += count;
    } else {
      appointments[_id] = count;
    }
    appointments.total += count;
  });

  const diagnostics = { total: 0, assigned: 0, sample_collected: 0, processing: 0, report_uploaded: 0, cancelled: 0 };
  diagnosticStats.forEach(({ _id, count }) => {
    diagnostics[_id] = count;
    diagnostics.total += count;
  });

  const medications = { total: 0, active: 0, completed: 0, discontinued: 0 };
  medicationStats.forEach(({ _id, count }) => {
    medications[_id] = count;
    medications.total += count;
  });

  const availabilityIds = new Set(doctorsWithoutAvailability.map((id) => id.toString()));
  const doctorsNeedingAvailability = await User.countDocuments({
    role: 'doctor',
    isVerified: true,
    _id: { $nin: Array.from(availabilityIds) },
  });

  const roleApplications = { total: 0, pending: 0, approved: 0, rejected: 0 };
  roleApplicationStats.forEach(({ _id, count }) => {
    roleApplications[_id] = count;
    roleApplications.total += count;
  });

  return {
    users,
    pendingVerifications,
    appointments,
    todaysAppointments: todaysAppointmentCount,
    diagnostics,
    medications,
    roleApplications,
    newUsersThisMonth,
    recentActivity: {
      appointments: recentAppointments,
      diagnostics: recentDiagnostics,
      prescriptions: recentMedications,
      registrations: recentUsers,
    },
    pendingActions: {
      pendingVerifications,
      pendingRoleApplications: roleApplications.pending || 0,
      testsAwaitingReports: diagnostics.processing || 0,
      appointmentsPending: (appointments.pending || 0) + (appointments.confirmed || 0),
      doctorsNeedingAvailability,
    },
  };
};

// ─── Super Admin Dashboard ────────────────────────────────
// Extends admin dashboard with system-health / growth metrics

export const getSuperAdminDashboard = async () => {
  const now = new Date();
  const monthStart = startOfMonth();
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    adminData,
    monthlyGrowth,
    appointmentTrend,
    topDoctors,
    systemNotifications,
  ] = await Promise.all([
    // Reuse the admin aggregation
    getAdminDashboard(),

    // User registrations: current month vs previous month
    User.aggregate([
      {
        $match: { createdAt: { $gte: prevMonthStart } },
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),

    // Appointment volume last 6 months
    Appointment.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1),
          },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),

    // Top 5 doctors by completed appointments
    Appointment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$doctorId', completedCount: { $sum: 1 } } },
      { $sort: { completedCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'doctor',
        },
      },
      { $unwind: '$doctor' },
      {
        $project: {
          _id: 1,
          completedCount: 1,
          'doctor.name': 1,
          'doctor.professionalDetails.specialization': 1,
        },
      },
    ]),

    // Unread system-wide notification count (urgent/high priority)
    Notification.countDocuments({
      isRead: false,
      priority: { $in: ['high', 'urgent'] },
    }),
  ]);

  return {
    ...adminData,
    monthlyGrowth,
    appointmentTrend,
    topDoctors,
    highPriorityNotifications: systemNotifications,
  };
};

export default {
  getPatientDashboard,
  getDoctorDashboard,
  getLabDashboard,
  getAdminDashboard,
  getSuperAdminDashboard,
};
