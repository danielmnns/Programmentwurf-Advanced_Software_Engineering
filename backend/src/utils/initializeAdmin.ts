import Role from '../models/Role';
import User from '../models/Users';
import { hashPassword } from '../utils/passwordUtils';

const initializeAdminUser = async () => {
  try {
    // Überprüfen, ob es bereits eine Rolle "Admin" gibt, und erstellen, falls nicht
    let adminRole = await Role.findOne({ name: 'Admin' });
    if (!adminRole) {
      adminRole = new Role({ name: 'Admin', permissions: [] });
      await adminRole.save();
      console.log('Admin role created successfully');
    }

    // Überprüfen, ob es bereits einen Benutzer mit der Rolle "Admin" gibt
    const adminUser = await User.findOne({ roles: adminRole._id });
    if (adminUser) {
      console.log('Admin user already exists');
      return;
    }

    // Admin-Benutzer erstellen
    const hashedPassword = await hashPassword('admin');
    const newAdminUser = new User({
      username: 'admin',
      password: hashedPassword,
      roles: [adminRole._id],
    });

    await newAdminUser.save();
    console.log('Admin user created successfully');
  } catch (err) {
    console.error('Error initializing admin user:', err);
  }
};

export default initializeAdminUser;