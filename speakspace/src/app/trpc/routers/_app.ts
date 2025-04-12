
import { authRouter } from '@/modules/auth/server/auth-router';
import { createTRPCRouter } from '../init';
import { sessionRouter } from '@/modules/sessions/server/session-router';
import { messageRouter } from '@/modules/sessions/server/message-router';
export const appRouter = createTRPCRouter({
  auth: authRouter,
  session: sessionRouter,
  message: messageRouter
});
// export type definition of API
export type AppRouter = typeof appRouter;