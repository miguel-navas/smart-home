import type { DeviceKey, HouseSnapshot, SmartHomeCommand, SmartHomeScene } from "@shared/smart-home";

/**
 * Domain boundary for the current simulated source and a future Home Assistant adapter.
 * Persistence used by the simulator is abstracted separately in SmartHomeStateStore.
 * The Home Assistant adapter is intentionally not implemented or connected in this MVP.
 */
export interface SmartHomeProvider {
  snapshot(): Promise<HouseSnapshot>;
  executeCommand(command: SmartHomeCommand): Promise<HouseSnapshot>;
  applyScene(scene: SmartHomeScene): Promise<HouseSnapshot>;
  readRevision(): Promise<number>;
}

export type DeviceReference = DeviceKey;
