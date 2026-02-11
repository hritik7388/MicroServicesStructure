import z from 'zod'

export const registerSchema=z.object({
    firstName:z.string(),
    lastName:z.string(),
     email: z.string().email(),
    password: z.string(),

})

export const subAdminSchema = z.object({
    email: z.string().email(),
    password: z.string(),

})
export type SubAdminDTO = z.infer<typeof subAdminSchema>;
export type RegisterDTO = z.infer<typeof registerSchema>;