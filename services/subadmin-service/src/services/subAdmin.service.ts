import jwt from 'jsonwebtoken';
import ms from 'ms';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

import { config } from '../config/config';
import { redisClient } from '../config/redis';
import { SubAdminCredential } from '../entity/credential.entity';
import { SubAdmin, UserType, SubAdminStatus } from '../entity/subadmin.entity';
import { createError } from '../utils';
import { RegisterDTO, SubAdminDTO } from '../schema/subAdminSchema';

class AuthService { 

  async registerSubAdmin(data: RegisterDTO) {

    const REGISTER_TTL = 600; // 10 min
    const MAX_ATTEMPTS = 3;

    const registerKey = `register:attempt:${data.email}`;
    const otpKey = `register:otp:${data.email}`;

    /* ---------------- Rate limit ---------------- */

    const attemptCount = Number(await redisClient.get(registerKey) || 0);

    if (attemptCount >= MAX_ATTEMPTS) {
      throw createError("Too many registration attempts, try later", 429);
    }

    /* ---------------- Check existing user ---------------- */

    const existing = await SubAdminCredential.findOne({ email: data.email });

    if (existing) {
      await redisClient
        .multi()
        .incr(registerKey)
        .expire(registerKey, REGISTER_TTL)
        .exec();

      throw createError("Email already exists", 400);
    }

    /* ---------------- Create OTP ---------------- */

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await redisClient.setex(otpKey, REGISTER_TTL, otp);

    /* ---------------- Save temporary user (PENDING) ---------------- */

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const subAdmin = await SubAdmin.create({
      firstName: data.firstName,
      lastName: data.lastName,
      status: "PENDING",
    });

    await SubAdminCredential.create({
      email: data.email,
      passwordHash: hashedPassword,
      subAdmin: subAdmin._id,
    });

    return {
      message: "Registration successful. Verify OTP.",
    };
  }


  // --------------------- LOGIN ---------------------
  async login(data: SubAdminDTO) {
    const DAY = 86400;      // 1 day in seconds
    const FAIL_TTL = 900;   // 15 min lockout
    const MAX_FAILS = 5;

    const failKey = `login:fail:${data.email}`;

    // 1️⃣ Brute-force protection
    const failCount = Number(await redisClient.get(failKey) || 0);
    if (failCount >= MAX_FAILS) {
      throw createError('Too many login attempts, try later', 429);
    }

    // 2️⃣ Fetch credential + populate subAdmin info
    const credential = await SubAdminCredential.findOne({ email: data.email })
    console.log("credential==================>>>>", credential)
    const subAdmin = credential?.id



    return {
      message: 'Login successfully completed',

    };
  }

  // // --------------------- LOGOUT ---------------------
  // async logout(subAdminId: string, token: string) {
  //   // Delete JWT session from Redis
  //   const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  //   await redisClient.del(`auth:${subAdminId}:${tokenHash}`);
  // }
}

export default AuthService;
