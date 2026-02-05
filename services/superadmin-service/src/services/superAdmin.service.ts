import jwt from 'jsonwebtoken';
import ms from 'ms';
import bcrypt from 'bcryptjs';
import { config } from '../config/config'
import crypto from 'crypto';

import { AppDataSource } from '../data-source';
import { redisClient } from '../config/redis'
import { Repository } from 'typeorm';
import { Credential } from '../entity/credential.entity';
import { SuperAdmin } from '../entity/superadmin.entity';
import { createError } from '../utils';
import { SuperAdminDTO } from '../schema/superAdminSchema';



class AuthService {
    credentialRepository: Repository<Credential>;
    userRepository: Repository<SuperAdmin>;

    constructor() {
        this.credentialRepository = AppDataSource.getRepository(Credential);
        this.userRepository = AppDataSource.getRepository(SuperAdmin);
    }



    async login(data: SuperAdminDTO) {
        const redisKey = `auth:${crypto
            .createHash('sha256')
            .update(data.email + data.password)
            .digest('hex')}`;
        const cached = await redisClient.get(redisKey);
        if (cached) {
            // Fetch user to generate JWT
            const credential = await this.credentialRepository.findOne({
                where: { email: data.email },
                relations: ['user'],
            });

            if (!credential) {
                throw createError('invalid credentials', 401);
            }

            const token = jwt.sign(
                {
                    id: credential.user.id,
                    email: credential.email,
                    firstName: credential.user.firstName,
                    lastName: credential.user.lastName,
                },
                config.JWT_SECRET,
                { expiresIn: config.JWT_EXPIRES_IN as ms.StringValue },
            );
            await redisClient.setex(
                `auth:${credential.user.id}:${token}`,
                24 * 60 * 60,
                'true',
            );


            return {
                token,
                firstName: credential.user.firstName,
                lastName: credential.user.lastName,
                email: credential.email,
            };
        }
        const credential = await this.credentialRepository.findOne({
            where: { email: data.email },
            relations: ['user'],
        });

        if (!credential) {
            throw createError('invalid credentials', 401);
        }

        const isValidPassword = await bcrypt.compare(
            data.password,
            credential.passwordHash,
        );

        if (!isValidPassword) {
            throw createError('invalid credentials', 401);
        }
        await redisClient.setex(redisKey, 24 * 60 * 60, 'true');
        const token = jwt.sign(
            {
                id: credential.user.id,
                email: credential.email,
                firstName: credential.user.firstName,
                lastName: credential.user.lastName,
            },
            config.JWT_SECRET,
            { expiresIn: config.JWT_EXPIRES_IN as ms.StringValue },
        );
        await redisClient.setex(
            `auth:${credential.user.id}:${token}`,
            24 * 60 * 60,
            'true',
        );
        return {
            token,
            firstName: credential.user.firstName,
            lastName: credential.user.lastName,
            email: credential.email,
        };
    }



    async logout(userId: number, token: string) {
        await redisClient.del(`auth:${userId}:${token}`);
    }
}

export default AuthService;