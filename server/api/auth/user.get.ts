import { createError } from "h3";
import authGuard from "../_authGard";

export default defineEventHandler(async (event) => {
  const user = await authGuard(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      message: "Utilisateur non connecté",
    });
  }

  return {
    data: {
      message: "ok",
      user: {
        id: user.id,
        email: user.email,
        display_name: user.user_metadata?.display_name || null,
      },
    },
  };
});
