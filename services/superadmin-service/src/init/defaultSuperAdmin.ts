import { AppDataSource } from '../data-source';
import { SuperAdmin, UserType, SuperAdminStatus } from '../entity/superadmin.entity';
import { Credential } from '../entity/credential.entity';
import bcrypt from 'bcryptjs';
import logger from '../config/logger';

export const createDefaultSuperAdmin = async () => {
    const repo = AppDataSource.getRepository(SuperAdmin);

    // Check if already exists
    const count = await repo.count();
    if (count > 0) {
        logger.info('SuperAdmin already exists, skipping default creation.');
        return;
    }

    // Hash default password
    const defaultPassword = 'Agicent@1';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    // Create Credential entity
    const credential = new Credential();
    credential.email = 'superadmin@mailinator.com';
    credential.passwordHash = passwordHash;

    const superAdmin = new SuperAdmin();
    superAdmin.firstName = 'Super';
    superAdmin.lastName = 'Admin'; 
    superAdmin.phoneNumber = '9999999999';
    superAdmin.countryCode = '+91';
    superAdmin.userType = UserType.SUPER_ADMIN;
    superAdmin.status = SuperAdminStatus.ACTIVE;
    superAdmin.isVerified = true;
    superAdmin.address = { line1: 'Company HQ' };
    superAdmin.coordinates = { lat: 0, lng: 0 };
    superAdmin.credential = credential; // attach credential

    // Save to DB
    await repo.save(superAdmin);

    logger.info('Default SuperAdmin created with email: superadmin@mailinator.com');
};
