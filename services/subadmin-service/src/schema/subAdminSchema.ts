import z from 'zod'

export const registerSchema=z.object({
firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phoneNumber: z.string().optional(),
  countryCode: z.string().optional(),

})

export const subAdminSchema = z.object({
    email: z.string().email(),
    password: z.string(),

})
export type SubAdminDTO = z.infer<typeof subAdminSchema>;
export type RegisterDTO = z.infer<typeof registerSchema>;