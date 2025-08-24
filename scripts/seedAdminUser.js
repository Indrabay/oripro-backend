const bcrypt = require('bcryptjs');
const { getPgPool, getMysqlPool } = require('../src/config/db');

async function run() {
  const dbType = (process.env.DB_TYPE || 'postgres').toLowerCase();
  
  const users = [
    {
      email: 'admin@example.com',
      name: 'Admin User',
      password: 'admin123',
      roleName: 'admin'
    },
    {
      email: 'superadmin@example.com',
      name: 'Super Admin User',
      password: 'superadmin123',
      roleName: 'super_admin'
    }
  ];

  if (dbType === 'mysql') {
    const pool = await getMysqlPool();
    
    for (const userData of users) {
      // Get role ID
      const [roleRows] = await pool.query('SELECT id FROM roles WHERE name = ?', [userData.roleName]);
      if (!roleRows[0]) {
        console.error(`Role '${userData.roleName}' not found`);
        continue;
      }
      const roleId = roleRows[0].id;
      
      // Hash password
      const passwordHash = await bcrypt.hash(userData.password, 10);
      
      // Create user
      await pool.query(
        `INSERT INTO users (id, email, password, name, role_id, created_at, updated_at)
         VALUES (UUID(), ?, ?, ?, ?, NOW(), NOW())
         ON DUPLICATE KEY UPDATE 
           name = VALUES(name),
           role_id = VALUES(role_id),
           password = VALUES(password)`,
        [userData.email, passwordHash, userData.name, roleId]
      );
      
      console.log(`User '${userData.email}' (${userData.roleName}) created/updated`);
    }
    
    await pool.end();
  } else {
    const pool = getPgPool();
    
    for (const userData of users) {
      // Get role ID
      const { rows: roleRows } = await pool.query('SELECT id FROM roles WHERE name = $1', [userData.roleName]);
      if (!roleRows[0]) {
        console.error(`Role '${userData.roleName}' not found`);
        continue;
      }
      const roleId = roleRows[0].id;
      
      // Hash password
      const passwordHash = await bcrypt.hash(userData.password, 10);
      
      // Create user
      await pool.query(
        `INSERT INTO users (email, password, name, role_id)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO UPDATE SET 
           name = EXCLUDED.name,
           role_id = EXCLUDED.role_id,
           password = EXCLUDED.password`,
        [userData.email, passwordHash, userData.name, roleId]
      );
      
      console.log(`User '${userData.email}' (${userData.roleName}) created/updated`);
    }
    
    await pool.end();
  }

  console.log('Admin users seeded successfully');
  console.log('\nLogin credentials:');
  console.log('Admin: admin@example.com / admin123');
  console.log('Super Admin: superadmin@example.com / superadmin123');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
