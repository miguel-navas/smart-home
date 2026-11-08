import { useEffect, useId, useState } from "react";
import SimulatorHealth, { type HealthPoint, type ReserveType, type Telemetry } from "./SimulatorHealth";

const deviceTypes = {
  door: "Porta",
  window: "Janela",
  gate: "Portão",
  blackout: "Persiana blackout",
  curtain: "Cortina",
  climate: "Ar-condicionado",
  light: "Iluminação",
  exhaust: "Exaustão",
  camera: "Câmera",
  ups: "Nobreak",
  solar: "Solar com bateria",
} as const;

type DeviceType = keyof typeof deviceTypes;
type Device = { id: string; type: DeviceType; name: string; state: string; temperature: number; telemetry?: Telemetry };
type Room = { id: string; name: string; floor: string; devices: Device[] };
type RoomSeed = [name: string, devices: DeviceType[]];

const deviceOptions = Object.keys(deviceTypes) as DeviceType[];
const storageKey = "casa-plus-simulator-v1";

const prototypeFloors: [string, RoomSeed[]][] = [
  ["Térreo", [
    ["Sala de estar", ["door", "blackout", "curtain", "climate", "light"]],
    ["Sala de jantar", ["door", "blackout", "climate", "light"]],
    ["Escritório", ["door", "blackout", "climate", "light"]],
    ["Cozinha", ["door", "window", "light", "exhaust"]],
    ["Lavanderia", ["door", "window", "light"]],
    ["Garagem", ["gate", "light"]],
    ["Área gourmet", ["light", "exhaust"]],
    ["Jardim de inverno", ["light"]],
    ["Hall de entrada", ["light"]],
    ["Lavabo", ["light"]],
    ["Depósito", ["light"]],
  ]],
  ["Superior", [
    ["Suíte", ["door", "blackout", "climate", "light"]],
    ["Quarto 2", ["door", "blackout", "climate", "light"]],
    ["Quarto 3", ["door", "blackout", "climate", "light"]],
    ["Corredor e hall da escada", ["light"]],
    ["Closet", ["light"]],
    ["Banho da suíte", ["light"]],
    ["Banheiro social", ["light"]],
    ["Rouparia", ["light"]],
  ]],
];

const openingStates = [["closed", "Fechada · destrancada"], ["open", "Aberta"], ["locked", "Fechada · trancada"]];
const gateStates = [["locked", "Trancado"], ["open", "Aberto"]];
const coverStates = [["closed", "Fechada"], ["open", "Aberta"]];
const powerStates = [["off", "Desligado"], ["on", "Ligado"]];

function statesFor(type: DeviceType) {
  switch (type) {
    case "door":
    case "window": return openingStates;
    case "gate": return gateStates;
    case "blackout":
    case "curtain": return coverStates;
    default: return powerStates;
  }
}

function newDevice(type: DeviceType, id: string, name: string = deviceTypes[type]): Device {
  const [[state]] = statesFor(type);
  return { id, type, name, state, temperature: 23 };
}

function prototypeRooms(): Room[] {
  return prototypeFloors.flatMap(([floor, seeds], floorIndex) =>
    seeds.map(([name, devices], roomIndex) => {
      const id = `prototype-${floorIndex}-${roomIndex}`;
      return { id, name, floor, devices: devices.map((type, index) => newDevice(type, `${id}-${index}`)) };
    })
  );
}

function loadRooms(): Room[] {
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const rooms = JSON.parse(saved);
      if (Array.isArray(rooms)) return rooms;
    }
  } catch {
    // A storage failure still allows a simulation for the current session.
  }
  return prototypeRooms();
}

function DeviceRow({ device, onChange, onRemove }: {
  device: Device;
  onChange: (patch: Partial<Pick<Device, "name" | "state" | "temperature">>) => void;
  onRemove: () => void;
}) {
  return <div className="sim-device">
    <label>Nome <input value={device.name} onChange={event => onChange({ name: event.target.value })} /></label>
    {device.type !== "camera" && device.type !== "ups" && device.type !== "solar" && <label>{deviceTypes[device.type]}
      <select value={device.state} onChange={event => onChange({ state: event.target.value })}>
        {statesFor(device.type).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
    </label>}
    {device.type === "climate" && <label>Ajuste · °C
      <select value={device.temperature} onChange={event => onChange({ temperature: Number(event.target.value) })}>
        {Array.from({ length: 15 }, (_, index) => index + 16).map(value => <option key={value}>{value}</option>)}
      </select>
    </label>}
    <button type="button" className="sim-remove" onClick={onRemove} aria-label={`Remover ${device.name || deviceTypes[device.type]}`}>Remover</button>
  </div>;
}

function RoomEditor({ room, floorsId, onChange, onRemove }: {
  room: Room;
  floorsId: string;
  onChange: (update: (current: Room) => Room) => void;
  onRemove: () => void;
}) {
  const [type, setType] = useState<DeviceType>("door");
  return <article className="room-card sim-room">
    <h2>{room.name.trim() || "Cômodo sem nome"}</h2>
    <div className="sim-fields">
      <label>Cômodo <input value={room.name} onChange={event => {
        const name = event.target.value;
        onChange(current => ({ ...current, name }));
      }} /></label>
      <label>Pavimento <input list={floorsId} value={room.floor} onChange={event => {
        const floor = event.target.value;
        onChange(current => ({ ...current, floor }));
      }} /></label>
      <button type="button" className="sim-remove" onClick={onRemove}>Remover cômodo</button>
    </div>
    <div className="sim-devices">
      {room.devices.map(device => <DeviceRow key={device.id} device={device}
        onChange={patch => onChange(current => ({
          ...current,
          devices: current.devices.map(item => item.id === device.id ? { ...item, ...patch } : item),
        }))}
        onRemove={() => onChange(current => ({ ...current, devices: current.devices.filter(item => item.id !== device.id) }))}
      />)}
      {room.devices.length === 0 && <p>Nenhum equipamento neste cômodo.</p>}
    </div>
    <form className="sim-fields" onSubmit={event => {
      event.preventDefault();
      const id = crypto.randomUUID();
      onChange(current => {
        const name = `${deviceTypes[type]} ${current.devices.filter(device => device.type === type).length + 1}`;
        return { ...current, devices: [...current.devices, newDevice(type, id, name)] };
      });
    }}>
      <label>Tipo de equipamento <select value={type} onChange={event => setType(event.target.value as DeviceType)}>
        {deviceOptions.map(option => <option key={option} value={option}>{deviceTypes[option]}</option>)}
      </select></label>
      <button>Adicionar equipamento</button>
    </form>
  </article>;
}

export default function Simulator() {
  const [rooms, setRooms] = useState(loadRooms);
  const [name, setName] = useState("");
  const [floor, setFloor] = useState("Térreo");
  const [filter, setFilter] = useState("");
  const [storageError, setStorageError] = useState(false);
  const [resetCount, setResetCount] = useState(0);
  const healthPoints: HealthPoint[] = rooms.flatMap(room => room.devices.flatMap(device => {
    const { type } = device;
    if (type !== "door" && type !== "window" && type !== "gate" && type !== "camera" && type !== "ups" && type !== "solar") return [];
    return [{
      id: device.id,
      name: device.name || deviceTypes[type],
      room: room.name || "Cômodo sem nome",
      type,
      telemetry: device.telemetry,
      record: (telemetry: Telemetry | undefined) => setRooms(current => current.map(item => item.id === room.id
        ? { ...item, devices: item.devices.map(entry => entry.id === device.id ? { ...entry, telemetry } : entry) }
        : item)),
    }];
  }));
  function addReserve(type: ReserveType) {
    const roomId = "sim-power-infrastructure";
    const device = newDevice(type, crypto.randomUUID());
    setRooms(current => {
      if (current.some(room => room.devices.some(item => item.type === type))) return current;
      if (current.some(room => room.id === roomId)) {
        return current.map(room => room.id === roomId ? { ...room, devices: [...room.devices, device] } : room);
      }
      return [...current, { id: roomId, name: "Infraestrutura", floor: "Térreo", devices: [device] }];
    });
  }
  const floorsId = useId();
  const floors = Array.from(new Set(rooms.map(room => room.floor.trim()).filter(Boolean)));
  const devices = rooms.flatMap(room => room.devices);
  const visibleRooms = rooms.filter(room => !filter || room.floor.trim() === filter);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(rooms));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [rooms]);

  return <section className="simulator">
    <div className="page-title"><div><div className="eyebrow">CASA CONFIGURÁVEL</div><h1>Simulador residencial</h1>
      <p>Use as plantas do protótipo como ponto de partida e adapte os cômodos, pavimentos e equipamentos à casa que vai receber o sistema.</p></div>
      <span className="demo-pill"><span /> Modo demonstração</span>
    </div>
    <p className="sim-note" role={storageError ? "status" : undefined}>{storageError
      ? "O navegador não conseguiu salvar a configuração. As alterações valem para esta sessão."
      : "A configuração e os estados simulados ficam salvos neste navegador."}</p>
    <datalist id={floorsId}>{floors.map(value => <option key={value} value={value} />)}</datalist>
    <section className="room-card sim-setup">
      <h2>Inventário da casa</h2>
      <p>{rooms.length} cômodos · {floors.length} pavimentos · {devices.length} equipamentos</p>
      <ul className="sim-counts">{deviceOptions.map(type =>
        <li key={type}>{deviceTypes[type]} <strong>{devices.filter(device => device.type === type).length}</strong></li>
      )}</ul>
      <form className="sim-fields" onSubmit={event => {
        event.preventDefault();
        if (!name.trim() || !floor.trim()) return;
        const room = { id: crypto.randomUUID(), name: name.trim(), floor: floor.trim(), devices: [] };
        setRooms(current => [...current, room]);
        setName("");
        setFilter(room.floor);
      }}>
        <label>Novo cômodo <input value={name} onChange={event => setName(event.target.value)} placeholder="Ex.: Quarto de hóspedes" required /></label>
        <label>Pavimento <input list={floorsId} value={floor} onChange={event => setFloor(event.target.value)} required /></label>
        <button disabled={!name.trim() || !floor.trim()}>Adicionar cômodo</button>
      </form>
      <div className="sim-fields sim-toolbar">
        <label>Mostrar pavimento <select value={floors.includes(filter) ? filter : ""} onChange={event => setFilter(event.target.value)}>
          <option value="">Todos os pavimentos</option>
          {floors.map(value => <option key={value}>{value}</option>)}
        </select></label>
        <button type="button" className="sim-remove" onClick={() => {
          if (window.confirm("Restaurar os cômodos e equipamentos do protótipo? A configuração atual será substituída.")) {
            setRooms(prototypeRooms());
            setResetCount(current => current + 1);
            setFilter("");
          }
        }}>Restaurar protótipo</button>
      </div>
    </section>
    <SimulatorHealth key={resetCount} resetCount={resetCount} points={healthPoints} onAddReserve={addReserve} />
    <div className="sim-room-grid">
      {(floors.includes(filter) ? visibleRooms : rooms).map(room => <RoomEditor key={room.id} room={room} floorsId={floorsId}
        onChange={update => setRooms(current => current.map(item => item.id === room.id ? update(item) : item))}
        onRemove={() => {
          if (window.confirm(`Remover o cômodo ${room.name || "sem nome"} e seus equipamentos?`)) {
            setRooms(current => current.filter(item => item.id !== room.id));
          }
        }}
      />)}
    </div>
  </section>;
}
