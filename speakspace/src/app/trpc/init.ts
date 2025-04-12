import { prisma } from "@/lib/db"; // Your Prisma client
import { auth } from "@clerk/nextjs/server";
import { initTRPC, TRPCError } from "@trpc/server";
import EventEmitter from "events";
import { cache } from "react";
import superjson from "superjson";

export const createTRPCContext = cache(async () => {
  const { userId } = await auth();
  return { clerkUserId: userId };
});

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});

// Base router and procedure helpers
export const sessionEventEmitter = new EventEmitter();
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async function isAuthed(opts) {
  const { ctx } = opts;

  if (!ctx.clerkUserId) {
    
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: ctx.clerkUserId ?? "" }
  });

  if (!user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "User Auth Context"
    });
  }

  // TODO: ratelimit later


  return opts.next({
    ctx: { ...ctx, user },
  });
});