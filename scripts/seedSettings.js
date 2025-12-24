const sequelize = require('../src/models/sequelize');
const Settings = require('../src/models/Settings');

async function run(sequelize) {
  await sequelize.authenticate();
  await sequelize.sync();
  
  const settings = [
    {
      key: 'attendance_radius_distance',
      value: '20000',
      description: 'Radius distance untuk attendance dalam meter (default: 20000 meter)',
      created_by: null,
      updated_by: null,
    },
    {
      key: 'task_radius_distance',
      value: '20000',
      description: 'Radius distance untuk task completion dalam meter (default: 20000 meter)',
      created_by: null,
      updated_by: null,
    },
  ];

  for (const setting of settings) {
    await Settings.upsert({
      ...setting,
      created_at: new Date(),
      updated_at: new Date(),
    }, {
      conflictFields: ['key'], // Use key as unique identifier
    });
    console.log(`Setting '${setting.key}' created/updated with value: ${setting.value}`);
  }

  console.log('All settings seeded successfully');
}

run(sequelize).catch((err) => {
  console.error(err);
  process.exit(1);
});

