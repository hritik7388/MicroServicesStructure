import { DataSource } from 'typeorm';
import { SuperAdmin } from './entity/superadmin.entity';
import { Credential } from './entity/credential.entity';

 export const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root123',
    database: process.env.DB_NAME || 'MICRO_SERVICES_STRUCTURE',
    synchronize: true, // optional: only for dev
    logging: true,
     entities: [SuperAdmin, Credential],
});