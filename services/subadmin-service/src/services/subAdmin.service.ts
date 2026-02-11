import jwt from 'jsonwebtoken';
import ms from 'ms';
import bcrypt from 'bcryptjs';
import { config } from '../config/config'
import crypto from 'crypto';

import { AppDataSource } from '../data-source';
import { redisClient } from '../config/redis'
import { Repository } from 'typeorm';
import { SubAdminCredential } from '../entity/credential.entity';
import {SubAdmin,UserType} from '../entity/subadmin.entity';
import { createError } from '../utils';
import { SubAdminDTO } from '../schema/subAdminSchema';



class AuthService {
 
async login(data: SubAdminDTO) {
    const DAY = 86400;
    const FAIL_TTL = 900;
    const MAX_FAILS = 5;

    const failKey = `login:fail:${data.email}`;

    /* ---------------- Brute-force protection ---------------- */
    const failCount = Number(await redisClient.get(failKey) || 0);
    if (failCount >= MAX_FAILS) {
      throw createError('Too many login attempts, try later', 429);
    }

    /* ---------------- Fetch credential + subAdmin ---------------- */
    const credential = await SubAdmin.findOne({ email: data.email })
      .populate('subAdmin'); // populate the subAdmin reference

    if (
 !credential || 
  credential.userType !== UserType.SUB_ADMIN ||
  credential.isVerified !== true ||
  credential.isDeleted === true ||
  credential.status !== 'ACTIVE'
    ) {
      // Increment fail count in Redis
      await redisClient
        .multi()
        .incr(failKey)
        .expire(failKey, FAIL_TTL)
        .exec();

      throw createError('Invalid credentials', 401);
    }

    /* ---------------- Password validation cache ---------------- */
    const pwdCacheKey = `pwd:${credential._id}:${credential.superAdminc}`;
    let passwordValid = false;

    try {
      passwordValid = (await redisClient.exists(pwdCacheKey)) === 1;
    } catch {
      // Redis down → fallback safely
    }

    if (!passwordValid) {
      const isValid = await bcrypt.compare(data.password, credential.passwordHash);

      if (!isValid) {
        await redisClient
          .multi()
          .incr(failKey)
          .expire(failKey, FAIL_TTL)
          .exec();

        throw createError('Invalid credentials', 401);
      }

      // Cache password verification
      redisClient.setex(pwdCacheKey, DAY, '1').catch(() => {});
    }

    /* ---------------- Successful login cleanup ---------------- */
    redisClient.del(failKey).catch(() => {});

    /* ---------------- JWT creation ---------------- */
    const token = jwt.sign(
      {
        sub: credential.subAdmin._id,
        role: credential.subAdmin.userType,
        email: credential.email,
      },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN as ms.StringValue }
    );

    /* ---------------- Secure session storage ---------------- */
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    redisClient.setex(`auth:${credential.subAdmin._id}:${tokenHash}`, DAY, '1').catch(() => {});

    const response = {
      id: credential._id,
      email: credential.email,
      firstName: credential.subAdmin.firstName,
      lastName: credential.subAdmin.lastName,
    };

    return {
      message: 'Login successfully completed',
      token,
      data: response,
    };
  }

  async logout(subAdminId: string, token: string) {
    await redisClient.del(`auth:${subAdminId}:${token}`);
  }
}

export default AuthService;