import { Request, Response } from 'express';
import { email, z } from 'zod';
import AuthService from '../services/subAdmin.service';
import { registerSchema, subAdminSchema } from '../schema/subAdminSchema';
import { id } from 'zod/v4/locales';



export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async login(req: Request, res: Response): Promise<any> {
    const data = subAdminSchema.parse(req.body);
    const userdata = await this.authService.login(data);

    return res.status(200).json({
      message: userdata.message,
      token: userdata.token,
      data: userdata.data

    });
  }

  async logout(req: Request, res: Response): Promise<any> {
    await this.authService.logout(req.userId!, req.token);

    return res.status(200).json({ message: 'logged out successfully' });
  }
}