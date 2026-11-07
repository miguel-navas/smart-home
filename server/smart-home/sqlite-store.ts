import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { TRPCError } from "@trpc/server";
import {
  climateDeviceKeys,
  coverDeviceKeys,
  deviceKeys,
  hoodDeviceKeys,
  initialSimulationState,
  type DeviceKey,
  type DeviceState,
  type HouseSnapshot,
  type SmartHomeCommand,
  type SmartHomeScene,
} from "@shared/smart-home";
import type { SmartHomeStateStore } from "./store";

type DeviceRow = {
  device_key: string;
  light_on: number;
  climate_on: number;
  temperature: number;
  hood_on: number;
  cover_position: number | null;
  updated_at: string;
};

type SyncRow = { id: number; revision: number; updated_at: string };

const climateKeySet = new Set<DeviceKey>(climateDeviceKeys);
const hoodKeySet = new Set<DeviceKey>(hoodDeviceKeys);
const coverKeySet = new Set<DeviceKey>(coverDeviceKeys);
let database: DatabaseSync | undefined;

function databasePath(): string {
  if (process.env.NODE_ENV === "production") {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "O armazenamento SQLite é exclusivo do desenvolvimento; configure o adaptador de produto antes de usar a API em produção.",
    });
  }
  return resolve(process.env.SMART_HOME_SQLITE_PATH ?? ".data/smart-home.sqlite");
}

function getDatabase(): DatabaseSync {
  if (database) return database;

  const path = databasePath();
  mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  try {
    db.exec("PRAGMA busy_timeout = 5000");
    db.exec("PRAGMA journal_mode = WAL");
    db.exec("PRAGMA synchronous = FULL");
    db.exec(`
      CREATE TABLE IF NOT EXISTS smart_home_devices (
        device_key TEXT PRIMARY KEY,
        light_on INTEGER NOT NULL CHECK (light_on IN (0, 1)),
        climate_on INTEGER NOT NULL CHECK (climate_on IN (0, 1)),
        temperature INTEGER NOT NULL CHECK (temperature BETWEEN 16 AND 30),
        hood_on INTEGER NOT NULL CHECK (hood_on IN (0, 1)),
        cover_position INTEGER CHECK (cover_position BETWEEN 0 AND 100),
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS smart_home_sync (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        revision INTEGER NOT NULL DEFAULT 0 CHECK (revision >= 0),
        updated_at TEXT NOT NULL
      );
    `);

    const columns = db.prepare("PRAGMA table_info(smart_home_devices)").all() as unknown as Array<{ name: string }>;
    if (!columns.some(column => column.name === "cover_position")) {
      db.exec("ALTER TABLE smart_home_devices ADD COLUMN cover_position INTEGER CHECK (cover_position BETWEEN 0 AND 100)");
    }

    const seedDevice = db.prepare(`
      INSERT OR IGNORE INTO smart_home_devices
        (device_key, light_on, climate_on, temperature, hood_on, cover_position, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const seedTimestamp = new Date().toISOString();
    for (const deviceKey of deviceKeys) {
      const initial = initialSimulationState[deviceKey];
      seedDevice.run(
        deviceKey,
        Number(initial.light),
        Number(initial.climate),
        initial.temp,
        Number(initial.hood),
        initial.coverPosition,
        seedTimestamp,
      );
    }
    const seedCover = db.prepare("UPDATE smart_home_devices SET cover_position = ? WHERE device_key = ? AND cover_position IS NULL");
    for (const deviceKey of coverDeviceKeys) seedCover.run(initialSimulationState[deviceKey].coverPosition, deviceKey);
    db.prepare(`
      INSERT OR IGNORE INTO smart_home_sync (id, revision, updated_at)
      VALUES (1, 0, ?)
    `).run(seedTimestamp);
  } catch (error) {
    db.close();
    throw error;
  }

  database = db;
  return db;
}

function inTransaction<T>(db: DatabaseSync, mode: "DEFERRED" | "IMMEDIATE", action: () => T): T {
  db.exec(`BEGIN ${mode}`);
  try {
    const result = action();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    try {
      db.exec("ROLLBACK");
    } catch {
      // Preserve the original error if SQLite has already aborted the transaction.
    }
    throw error;
  }
}

function toIsoTimestamp(value: string | undefined): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function readSnapshot(db: DatabaseSync): HouseSnapshot {
  const rows = db.prepare("SELECT device_key, light_on, climate_on, temperature, hood_on, cover_position, updated_at FROM smart_home_devices")
    .all() as unknown as DeviceRow[];
  const syncRow = db.prepare("SELECT id, revision, updated_at FROM smart_home_sync WHERE id = 1")
    .get() as unknown as SyncRow | undefined;

  if (rows.length !== deviceKeys.length || !syncRow) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "O armazenamento SQLite da simulação está incompleto.",
    });
  }

  const byKey = new Map(rows.map(row => [row.device_key as DeviceKey, row]));
  const state = Object.fromEntries(deviceKeys.map(deviceKey => {
    const row = byKey.get(deviceKey);
    if (!row) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Falta o estado simulado de ${deviceKey}.` });
    }
    return [deviceKey, {
      light: Boolean(row.light_on),
      climate: Boolean(row.climate_on),
      temp: row.temperature,
      hood: Boolean(row.hood_on),
      coverPosition: row.cover_position,
    }];
  })) as DeviceState;

  return {
    source: "simulation",
    revision: syncRow.revision,
    updatedAt: toIsoTimestamp(syncRow.updated_at),
    state,
  };
}

function incrementRevision(db: DatabaseSync, timestamp: string): void {
  const result = db.prepare(`
    UPDATE smart_home_sync
    SET revision = revision + 1, updated_at = ?
    WHERE id = 1
  `).run(timestamp);
  if (result.changes !== 1) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Não foi possível atualizar a revisão da simulação." });
  }
}

class SqliteSmartHomeStore implements SmartHomeStateStore {
  async snapshot(): Promise<HouseSnapshot> {
    const db = getDatabase();
    return inTransaction(db, "DEFERRED", () => readSnapshot(db));
  }

  async readRevision(): Promise<number> {
    const row = getDatabase().prepare("SELECT revision FROM smart_home_sync WHERE id = 1")
      .get() as unknown as { revision: number } | undefined;
    if (!row) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "A revisão do simulador não foi inicializada." });
    }
    return row.revision;
  }

  async executeCommand(command: SmartHomeCommand): Promise<HouseSnapshot> {
    const db = getDatabase();
    inTransaction(db, "IMMEDIATE", () => {
      const current = db.prepare(`
        SELECT device_key, light_on, climate_on, temperature, hood_on, cover_position, updated_at
        FROM smart_home_devices WHERE device_key = ?
      `).get(command.deviceKey) as unknown as DeviceRow | undefined;
      if (!current) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Ambiente não encontrado no simulador." });
      }

      const now = new Date().toISOString();
      if (command.capability === "light") {
        db.prepare("UPDATE smart_home_devices SET light_on = ?, updated_at = ? WHERE device_key = ?")
          .run(Number(!current.light_on), now, command.deviceKey);
      } else if (command.capability === "climate") {
        if (!climateKeySet.has(command.deviceKey)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Este ambiente não possui zona de climatização." });
        }
        db.prepare("UPDATE smart_home_devices SET climate_on = ?, updated_at = ? WHERE device_key = ?")
          .run(Number(!current.climate_on), now, command.deviceKey);
      } else if (command.capability === "hood") {
        if (!hoodKeySet.has(command.deviceKey)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Exaustão está disponível somente na cozinha e churrasqueira." });
        }
        db.prepare("UPDATE smart_home_devices SET hood_on = ?, updated_at = ? WHERE device_key = ?")
          .run(Number(!current.hood_on), now, command.deviceKey);
      } else if (command.capability === "cover") {
        if (!coverKeySet.has(command.deviceKey)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Este ambiente não possui persiana ou cortina no simulador." });
        }
        if (!Number.isInteger(command.position) || command.position < 0 || command.position > 100) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "A posição deve ser um número inteiro entre 0 e 100." });
        }
        db.prepare("UPDATE smart_home_devices SET cover_position = ?, updated_at = ? WHERE device_key = ?")
          .run(command.position, now, command.deviceKey);
      } else {
        if (!climateKeySet.has(command.deviceKey)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Este ambiente não possui uma zona de climatização." });
        }
        db.prepare(`
          UPDATE smart_home_devices
          SET temperature = MAX(16, MIN(30, temperature + ?)), updated_at = ?
          WHERE device_key = ?
        `).run(command.delta, now, command.deviceKey);
      }
      incrementRevision(db, now);
    });
    return this.snapshot();
  }

  async applyScene(scene: SmartHomeScene): Promise<HouseSnapshot> {
    const db = getDatabase();
    inTransaction(db, "IMMEDIATE", () => {
      const now = new Date().toISOString();
      if (scene === "cheguei") {
        const updateLight = db.prepare("UPDATE smart_home_devices SET light_on = 1, updated_at = ? WHERE device_key = ?");
        for (const deviceKey of ["sala", "escritorio"] as const) updateLight.run(now, deviceKey);
      } else {
        const turnOffLights = db.prepare("UPDATE smart_home_devices SET light_on = 0, updated_at = ? WHERE device_key = ?");
        const turnOffClimate = db.prepare("UPDATE smart_home_devices SET light_on = 0, climate_on = 0, updated_at = ? WHERE device_key = ?");
        for (const deviceKey of deviceKeys) {
          if (scene === "noite" && climateKeySet.has(deviceKey)) turnOffClimate.run(now, deviceKey);
          else turnOffLights.run(now, deviceKey);
        }
      }
      incrementRevision(db, now);
    });
    return this.snapshot();
  }
}

export const sqliteSmartHomeStore: SmartHomeStateStore = new SqliteSmartHomeStore();
