import { Request, Response } from 'express';
import { z } from 'zod';
import AuthService from '../services/superAdmin.service';
import { superAdminSchema } from '../schema/superAdminSchema';

 

export class AuthController {
   private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }
 
  async login(req: Request, res: Response): Promise<any> {
    const data = superAdminSchema.parse(req.body);
    const { token } = await this.authService.login(data);

    return res.status(200).json({ token });
  }

  async logout(req: Request, res: Response): Promise<any> {
    await this.authService.logout(req.userId!, req.token);

    return res.status(200).json({ message: 'logged out successfully' });
  }
}