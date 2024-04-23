import * as z from 'zod';

export const UserValidation = z.object({
    profile_photo: z.string().url().nonempty(),
    username: z.string().min(3).max(30),
    bio: z.string().min(5).max(2000),
})