import mongoose from 'mongoose';
import env from '../src/config/env.js';
import DiagnosticTest from '../src/models/DiagnosticTest.model.js';

const mapStatus = (status, hasReport) => {
  if (status === 'in_progress') return 'processing';
  if (status === 'completed') return hasReport ? 'report_uploaded' : 'processing';
  return status;
};

const mapHistoryStatus = (status) => {
  if (status === 'in_progress') return 'processing';
  if (status === 'completed') return 'report_uploaded';
  return status;
};

const runMigration = async () => {
  if (!env.MONGODB_URL) {
    console.error('MONGODB_URL is required to run the migration.');
    process.exit(1);
  }

  await mongoose.connect(env.MONGODB_URL);
  console.log('Connected to MongoDB.');

  const tests = await DiagnosticTest.find({ status: { $in: ['in_progress', 'completed'] } });
  console.log(`Found ${tests.length} diagnostic tests to migrate.`);

  let updated = 0;

  for (const test of tests) {
    const hasReport = Boolean(test.report?.url);
    const nextStatus = mapStatus(test.status, hasReport);

    const mappedHistory = (test.statusHistory || []).map((entry) => ({
      ...entry.toObject(),
      status: mapHistoryStatus(entry.status),
    }));

    test.status = nextStatus;
    test.statusHistory = mappedHistory;

    if (nextStatus === 'report_uploaded' && !test.actualCompletionDate) {
      test.actualCompletionDate = test.report?.uploadedAt || new Date();
    }

    await test.save();
    updated += 1;
  }

  console.log(`Migration complete. Updated ${updated} tests.`);
  await mongoose.disconnect();
};

runMigration().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
