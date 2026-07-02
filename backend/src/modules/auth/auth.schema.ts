import { z } from "zod";

export const registerUserSchema = z
  .object({
    email: z.email("Invalid Email").trim().toLowerCase(),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters long")
      .max(72, "Password cannot be more than 72 characters long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Password and confirmPassword do not match",
  });

export const loginUserSchema = z.object({
  email: z.email("Invalid Email").trim().toLowerCase(),
  password: z.string(),
});

export type registerUserDTO = z.infer<typeof registerUserSchema>;
export type LoginUserDTO = z.infer<typeof loginUserSchema>;
