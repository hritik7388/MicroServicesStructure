import { DataSource } from 'typeorm'; 
import { SubAdmin } from './entity/subadmin.entity';
import { SubAdminCredential } from './entity/credential.entity';

export const AppDataSource = new DataSource({
   type: "mongodb",
   host: process.env.DB_HOST,
   port: Number(process.env.DB_PORT),
   username: process.env.DB_USER,
   password: process.env.DB_PASSWORD,
   database: process.env.DB_NAME,
   synchronize: true, // optional: only for dev
   logging: true,
   entities: [SubAdmin, SubAdminCredential],
});