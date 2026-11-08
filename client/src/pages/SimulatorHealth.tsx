import { useEffect, useState } from "react";

export type Telemetry = { lastSeen: string; battery?: number; offline?: boolean };
export type ReserveType = "ups" | "solar";
type Reserve = { available: boolean; network: boolean; modem: boolean; video: boolean };

export type HealthPoint = {
  id: string;
  room: string;
  name: string;
  type: "door" | "window" | "gate" | "camera" | ReserveType;
  telemetry?: Telemetry;
  record: (telemetry: Telemetry | undefined) => void;
};

type HealthState = {
  internet: boolean;
  network: boolean;
  mains: boolean;
  ups: Reserve;
  solar: Reserve;
  recorder: boolean;
  backup?: { outcome: "success" | "failed"; at: string; lastSuccess?: string };
};

const initialHealth: HealthState = {
  internet: true,
  network: true,
  mains: true,
  ups: { available: true, network: true, modem: false, video: false },
  solar: { available: true, network: true, modem: false, video: false },
  recorder: true,
};

const healthKey = "casa-plus-simulator-health-v1";
const dateFormat = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

function formatDate(value?: string) {
  return value ? dateFormat.format(new Date(value)) : "Nenhum registro";
}

function loadHealth(): HealthState {
  try {
    const saved = localStorage.getItem(healthKey);
    if (saved) {
      const { reserveNetwork, reserveVideo, reserveAvailable, ...state } = JSON.parse(saved);
      return {
        ...initialHealth,
        ...state,
        ups: state.ups ?? {
          ...initialHealth.ups,
          network: reserveNetwork ?? initialHealth.ups.network,
          video: reserveVideo ?? initialHealth.ups.video,
          available: reserveAvailable ?? initialHealth.ups.available,
        },
      };
    }
  } catch {
    // The simulator remains usable when browser storage is unavailable.
  }
  return initialHealth;
}

const reserveLabels: Record<ReserveType, string> = { ups: "Nobreak", solar: "Solar com bateria" };
const reserveLoads = [
  ["network", "Hub e rede local"],
  ["modem", "Modem ou ONT"],
  ["video", "Câmeras e gravador"],
] as const;

export default function SimulatorHealth({ points, resetCount, onAddReserve }: {
  points: HealthPoint[];
  resetCount: number;
  onAddReserve: (type: ReserveType) => void;
}) {
  const [health, setHealth] = useState(() => resetCount ? initialHealth : loadHealth());
  const [saveFailed, setSaveFailed] = useState(false);
  const cameras = points.filter(point => point.type === "camera");
  const reserves = (Object.keys(reserveLabels) as ReserveType[]).map(type => ({
    type,
    configured: points.some(point => point.type === type),
    ...health[type],
  }));
  const activeReserves = reserves.filter(reserve => reserve.configured && reserve.available && !health.mains);
  const powered = (load: "network" | "modem" | "video") =>
    health.mains || activeReserves.some(reserve => reserve[load]);
  const local = health.network && powered("network");
  const internet = health.internet && powered("modem");
  const camerasPowered = powered("video");
  const video = local && health.recorder && camerasPowered;
  const recordingCount = video ? cameras.filter(camera => camera.telemetry?.lastSeen && !camera.telemetry.offline).length : 0;

  useEffect(() => {
    try {
      localStorage.setItem(healthKey, JSON.stringify(health));
      setSaveFailed(false);
    } catch {
      setSaveFailed(true);
    }
  }, [health]);

  function recordBackup(outcome: "success" | "failed") {
    const at = new Date().toISOString();
    setHealth(current => ({
      ...current,
      backup: { outcome, at, lastSuccess: outcome === "success" ? at : current.backup?.lastSuccess },
    }));
  }

  return <section className="room-card sim-setup" aria-labelledby="sim-health-title">
    <h2 id="sim-health-title">Saúde do sistema · simulação</h2>
    <p>Ensaie falhas e acompanhe quais serviços da casa permanecem disponíveis.</p>
    {saveFailed && <p role="status">O navegador não conseguiu salvar este cenário.</p>}
    <ul className="sim-counts" aria-label="Estado dos serviços">
      <li>Internet <strong>{internet ? "Disponível" : "Indisponível"}</strong></li>
      <li>Rede local e hub <strong>{local ? "Disponíveis" : "Indisponíveis"}</strong></li>
      <li>Acesso externo <strong>{local && internet ? "Disponível" : "Indisponível"}</strong></li>
      <li>Energia <strong>{health.mains ? "Normal" : "Sem energia da rede"}</strong></li>
      {reserves.map(reserve => <li key={reserve.type}>{reserveLabels[reserve.type]} <strong>{
        !reserve.configured ? "Não configurado" : !reserve.available ? "Reserva esgotada" :
          health.mains ? "Em espera" : "Operando em bateria"
      }</strong></li>)}
      <li>Gravação <strong>{!cameras.length ? "Não configurada" : recordingCount ? `${recordingCount}/${cameras.length} em gravação` : video && cameras.some(camera => !camera.telemetry) ? "Sem leitura" : "Indisponível"}</strong></li>
    </ul>
    <div className="sim-fields" aria-label="Cenários de conectividade e energia">
      <button type="button" onClick={() => setHealth(current => ({ ...current, internet: !current.internet }))}>{health.internet ? "Simular queda de internet" : "Restaurar internet"}</button>
      <button type="button" onClick={() => setHealth(current => ({ ...current, network: !current.network }))}>{health.network ? "Simular falha da rede local" : "Restaurar rede local"}</button>
      <button type="button" onClick={() => setHealth(current => ({ ...current, mains: !current.mains }))}>{health.mains ? "Simular falta de energia" : "Restaurar energia"}</button>
      {cameras.length > 0 && <button type="button" onClick={() => setHealth(current => ({ ...current, recorder: !current.recorder }))}>{health.recorder ? "Simular falha do gravador" : "Restaurar gravador"}</button>}
    </div>
    <div className="sim-devices" aria-label="Reserva de energia">
      <h3>Reserva de energia</h3>
      <p>A internet depende do modem ou da ONT energizados e do link da operadora. A reserva solar simula um sistema com bateria e saída de backup.</p>
      <div className="sim-fields">
        {reserves.filter(reserve => !reserve.configured).map(({ type }) =>
          <button key={type} type="button" onClick={() => onAddReserve(type)}>Adicionar {type === "ups" ? "nobreak" : "solar com bateria"}</button>
        )}
      </div>
      {reserves.filter(reserve => reserve.configured).map(reserve =>
        <fieldset key={reserve.type} className="sim-fields">
          <legend>{reserveLabels[reserve.type]} · serviços protegidos</legend>
          {reserveLoads.map(([load, label]) => <label key={load}>
            <input type="checkbox" checked={reserve[load]} onChange={event => {
              const checked = event.target.checked;
              setHealth(current => ({ ...current, [reserve.type]: { ...current[reserve.type], [load]: checked } }));
            }} /> {label}
          </label>)}
          <button type="button" onClick={() => setHealth(current => ({
            ...current, [reserve.type]: { ...current[reserve.type], available: !current[reserve.type].available },
          }))}>{reserve.available ? "Simular reserva esgotada" : "Restaurar reserva"} · {reserveLabels[reserve.type]}</button>
        </fieldset>
      )}
    </div>
    <div className="sim-devices">
      <h3>Backup simulado</h3>
      <p role="status">Última tentativa: {health.backup ? `${health.backup.outcome === "success" ? "Sucesso" : "Falhou"} · ${formatDate(health.backup.at)}` : "Nenhum registro"}. Último sucesso: {formatDate(health.backup?.lastSuccess)}.</p>
      <div className="sim-fields">
        <button type="button" disabled={!local} onClick={() => recordBackup("success")}>Simular backup bem-sucedido</button>
        <button type="button" onClick={() => recordBackup("failed")}>Simular falha de backup</button>
      </div>
    </div>
    <details className="sim-devices">
      <summary>Diagnóstico por equipamento ({points.length})</summary>
      {points.map(point => {
        const { telemetry } = point;
        const isCamera = point.type === "camera";
        const canCommunicate = local && (!isCamera || camerasPowered);
        const available = canCommunicate && !telemetry?.offline;
        const current = available && telemetry;
        const battery = telemetry?.battery;
        const isReserve = point.type === "ups" || point.type === "solar";
        return <article className="sim-device" key={point.id} aria-label={`${point.name} · ${point.room}`}>
          <div>
            <strong>{point.name} · {point.room}</strong>
            <p>{!available ? "Indisponível" : current ? "Em comunicação" : "Sem leitura registrada"} · Última comunicação: {formatDate(telemetry?.lastSeen)}</p>
            {isCamera ? <p>{available && video ? current ? "Gravando" : "Gravação sem leitura" : "Sem gravação"}</p> : <p>
              {current ? "Bateria" : "Última bateria conhecida"}: {battery === undefined ? "Sem leitura" : `${battery}%${battery <= 20 ? " · baixa" : ""}`}
            </p>}
          </div>
          {available && <button type="button" onClick={() => point.record({
            lastSeen: new Date().toISOString(),
            battery: isCamera ? undefined : (battery ?? 100),
          })}>Registrar comunicação</button>}
          {available && !isCamera && <button type="button" onClick={() => point.record({ lastSeen: new Date().toISOString(), battery: 15 })}>Simular bateria baixa</button>}
          <button type="button" disabled={!canCommunicate} onClick={() => point.record(telemetry?.offline
            ? { ...telemetry, offline: false, lastSeen: new Date().toISOString() }
            : { ...telemetry, lastSeen: telemetry?.lastSeen ?? "", offline: true })}>
            {telemetry?.offline ? "Restaurar comunicação" : "Simular perda de comunicação"}
          </button>
          {isReserve && <span>{activeReserves.some(reserve => reserve.type === point.type) ? "Reserva em uso" : "Reserva fora de uso"}</span>}
        </article>;
      })}
      {points.length === 0 && <p>Nenhum sensor, câmera ou equipamento de reserva configurado.</p>}
    </details>
  </section>;
}
