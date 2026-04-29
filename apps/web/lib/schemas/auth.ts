import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
})

export const registerSchema = loginSchema
  .extend({
    first_name: z.string().min(1, "Le prénom est requis"),
    last_name: z.string().min(1, "Le nom est requis"),
    esn_name: z.string().min(2, "Le nom de l'ESN doit contenir au moins 2 caractères"),
    confirmPassword: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  })

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
