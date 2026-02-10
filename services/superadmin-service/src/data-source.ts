import { DataSource } from 'typeorm';
import { SuperAdmin } from './entity/superadmin.entity';
import { SuperAdminCredential } from './entity/credential.entity';

export const AppDataSource = new DataSource({
   type: "mysql",
   host: process.env.DB_HOST,
   port: Number(process.env.DB_PORT),
   username: process.env.DB_USER,
   password: process.env.DB_PASSWORD,
   database: process.env.DB_NAME,
   synchronize: true, // optional: only for dev
   logging: true,
   entities: [SuperAdmin, SuperAdminCredential],
});