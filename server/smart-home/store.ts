import type { HouseSnapshot, SmartHomeCommand, SmartHomeScene } from "@shared/smart-home";

/**
 * Persistence boundary for the simulated house state.
 * The development store is SQLite; a product deployment must provide a shared
 * SQL Server implementation before running multiple server instances.
 */
export interface SmartHomeStateStore {
  snapshot(): Promise<HouseSnapshot>;
  readRevision(): Promise<number>;
  executeCommand(command: SmartHomeCommand): Promise<HouseSnapshot>;
  applyScene(scene: SmartHomeScene): Promise<HouseSnapshot>;
}
