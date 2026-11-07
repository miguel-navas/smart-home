import type { HouseSnapshot, SmartHomeCommand, SmartHomeScene } from "@shared/smart-home";
import type { SmartHomeProvider } from "./provider";
import { sqliteSmartHomeStore } from "./sqlite-store";
import type { SmartHomeStateStore } from "./store";

/** Development-only simulation. Its persistence is provided by the injected store. */
export class SimulationProvider implements SmartHomeProvider {
  constructor(private readonly store: SmartHomeStateStore) {}

  snapshot(): Promise<HouseSnapshot> {
    return this.store.snapshot();
  }

  readRevision(): Promise<number> {
    return this.store.readRevision();
  }

  executeCommand(command: SmartHomeCommand): Promise<HouseSnapshot> {
    return this.store.executeCommand(command);
  }

  applyScene(scene: SmartHomeScene): Promise<HouseSnapshot> {
    return this.store.applyScene(scene);
  }
}

export const simulationProvider = new SimulationProvider(sqliteSmartHomeStore);
