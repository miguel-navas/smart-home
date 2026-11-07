import { z } from "zod";
import { deviceKeys, scenes } from "@shared/smart-home";
import { publicProcedure, router } from "../_core/trpc";
import { simulationProvider } from "./simulation-provider";

const commandSchema = z.discriminatedUnion("capability", [
  z.object({ deviceKey: z.enum(deviceKeys), capability: z.literal("light") }),
  z.object({ deviceKey: z.enum(deviceKeys), capability: z.literal("climate") }),
  z.object({ deviceKey: z.enum(deviceKeys), capability: z.literal("hood") }),
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
});
