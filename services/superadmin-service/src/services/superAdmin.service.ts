import jwt from 'jsonwebtoken';
import ms from 'ms';
import bcrypt from 'bcryptjs';
import { config } from '../config/config'
import crypto from 'crypto';

import { AppDataSource } from '../data-source';
import { redisClient } from '../config/redis'
import { Repository } from 'typeorm';
import { SuperAdminCredential } from '../entity/credential.entity';
import { SuperAdmin, UserType } from '../entity/superadmin.entity';
import { createError } from '../utils';
import { SuperAdminDTO } from '../schema/superAdminSchema';



class AuthService {
    credentialRepository: Repository<SuperAdminCredential>;
    userRepository: Repository<SuperAdmin>;

    constructor() {
        this.credentialRepository = AppDataSource.getRepository(SuperAdminCredential);
        this.userRepository = AppDataSource.getRepository(SuperAdmin);
    }



async login(data: SuperAdminDTO) {
  const DAY = 86400;
  const FAIL_TTL = 900;
  const MAX_FAILS = 5;

  const failKey = `login:fail:${data.email}`;

  /* ---------------- Brute-force protection ---------------- */
  const failCount = Number(await redisClient.get(failKey) || 0);
  if (failCount >= MAX_FAILS) {
    throw createError('too many login attempts, try later', 429);
  }

  /* ---------------- Fetch credential + user ---------------- */
  const credential = await this.credentialRepository.findOne({
    where: { email: data.email },
    relations: ['user'],
  });

  /* ---------------- Authorization gate (NO bcrypt yet) ---------------- */
  if (
    !credential ||
    credential.user.userType !== UserType.SUPER_ADMIN ||
    credential.user.isVerified !== true ||
    credential.user.isDeleted === true ||
    credential.user.status !== 'ACTIVE'
  ) {
    await redisClient
      .multi()
      .incr(failKey)
      .expire(failKey, FAIL_TTL)
      .exec();

    throw createError('invalid credentials', 401);
  }

  /* ---------------- Password validation cache ---------------- */
  const pwdCacheKey = `pwd:${credential.id}:${credential.passwordHash}`;
  let passwordValid = false;

  try {
    passwordValid = await redisClient.exists(pwdCacheKey) === 1;
  } catch {
    // Redis down → fallback safely
  }

  if (!passwordValid) {
    const isValid = await bcrypt.compare(
      data.password,
      credential.passwordHash,
    );

    if (!isValid) {
      await redisClient
        .multi()
        .incr(failKey)
        .expire(failKey, FAIL_TTL)
        .exec();

      throw createError('invalid credentials', 401);
    }

    // Fire-and-forget cache write
    redisClient.setex(pwdCacheKey, DAY, '1').catch(() => {});
  }

  /* ---------------- Successful login cleanup ---------------- */
  redisClient.del(failKey).catch(() => {});

  /* ---------------- JWT creation ---------------- */
  const token = jwt.sign(
    {
      sub: credential.user.id,
      role: credential.user.userType,
      email: credential.email,
    },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN as ms.StringValue },
  );

  /* ---------------- Secure session storage ---------------- */
  const tokenHash = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  redisClient
    .setex(`auth:${credential.user.id}:${tokenHash}`, DAY, '1')
    .catch(() => {});

  return {
    token,
    email: credential.email,
    firstName: credential.user.firstName,
    lastName: credential.user.lastName,
  };
}



    async logout(userId: number, token: string) {
        await redisClient.del(`auth:${userId}:${token}`);
    }
}

export default AuthService;