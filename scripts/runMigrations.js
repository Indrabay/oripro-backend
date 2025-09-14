const sequelize = require('../src/models/sequelize');

async function run(sequelize) {
  try {
    // Sync all models (creates tables if not exist)
    await sequelize.sync({ alter: true });

    console.log('Migrations applied using Sequelize');
    await sequelize.close();
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

module.exports = run;

run(sequelize);


