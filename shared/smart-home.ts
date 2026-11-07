export const deviceKeys = [
  "sala",
  "jantar",
  "cozinha",
  "escritorio",
  "lavanderia",
  "garagem",
  "suite",
  "quarto2",
  "quarto3",
  "churrasqueira",
  "lavabo",
  "banheiro",
  "banhoSuite",
  "jardim",
] as const;

export type DeviceKey = (typeof deviceKeys)[number];
export type DeviceReading = {
  light: boolean;
  climate: boolean;
  temp: number;
  hood: boolean;
};
export type DeviceState = Record<DeviceKey, DeviceReading>;

export const climateDeviceKeys = [
  "sala",
  "jantar",
  "cozinha",
  "escritorio",
  "lavanderia",
  "garagem",
  "suite",
  "quarto2",
  "quarto3",
] as const satisfies readonly DeviceKey[];

export const hoodDeviceKeys = ["cozinha", "churrasqueira"] as const satisfies readonly DeviceKey[];
export const scenes = ["cheguei", "noite", "sair"] as const;
export type SmartHomeScene = (typeof scenes)[number];
export type ToggleCapability = "light" | "climate" | "hood";
export type SmartHomeCommand =
  | { deviceKey: DeviceKey; capability: "light" }
  | { deviceKey: DeviceKey; capability: "climate" }
  | { deviceKey: DeviceKey; capability: "hood" }
  | { deviceKey: DeviceKey; capability: "temperature"; delta: -1 | 1 };

export type HouseSnapshot = {
  source: "simulation";
  revision: number;
  updatedAt: string | null;
  state: DeviceState;
};

export const initialSimulationState: DeviceState = {
  sala: { light: true, climate: true, temp: 22, hood: false },
  jantar: { light: false, climate: false, temp: 23, hood: false },
  cozinha: { light: true, climate: false, temp: 23, hood: false },
  escritorio: { light: true, climate: true, temp: 22, hood: false },
  lavanderia: { light: false, climate: false, temp: 24, hood: false },
  garagem: { light: false, climate: false, temp: 25, hood: false },
  suite: { light: false, climate: true, temp: 21, hood: false },
  quarto2: { light: false, climate: false, temp: 22, hood: false },
  quarto3: { light: false, climate: false, temp: 22, hood: false },
  churrasqueira: { light: false, climate: false, temp: 24, hood: false },
  lavabo: { light: false, climate: false, temp: 23, hood: false },
  banheiro: { light: false, climate: false, temp: 23, hood: false },
  banhoSuite: { light: false, climate: false, temp: 22, hood: false },
  jardim: { light: false, climate: false, temp: 24, hood: false },
};
