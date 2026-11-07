import { z } from "zod";
import { coverDeviceKeys, deviceKeys, scenes } from "@shared/smart-home";
import { publicProcedure, router } from "../_core/trpc";
import { simulationProvider } from "./simulation-provider";
import { askCasaAssistant } from "./assistant";

const commandSchema = z.discriminatedUnion("capability", [
  z.object({ deviceKey: z.enum(deviceKeys), capability: z.literal("light") }),
  z.object({ deviceKey: z.enum(deviceKeys), capability: z.literal("climate") }),
  z.object({ deviceKey: z.enum(deviceKeys), capability: z.literal("hood") }),
  z.object({ deviceKey: z.enum(coverDeviceKeys), capability: z.literal("cover"), position: z.number().int().min(0).max(100) }),
  z.object({ deviceKey: z.enum(deviceKeys), capability: z.literal("temperature"), delta: z.union([z.literal(-1), z.literal(1)]) }),
]);

export const smartHomeRouter = router({
  snapshot: publicProcedure.query(() => simulationProvider.snapshot()),
  command: publicProcedure
    .input(commandSchema)
    .mutation(({ input }) => simulationProvider.executeCommand(input)),
  scene: publicProcedure
    .input(z.object({ scene: z.enum(scenes) }))
    .mutation(({ input }) => simulationProvider.applyScene(input.scene)),
  assistantMessage: publicProcedure
    .input(z.object({
      message: z.string().trim().min(1).max(1000),
      history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(1200) })).max(8).optional(),
    }))
    .mutation(({ input, ctx }) => askCasaAssistant(
      input,
      ctx.user ? `user:${ctx.user.id}` : ctx.req.ip || ctx.req.socket.remoteAddress || "unknown",
    )),
});
