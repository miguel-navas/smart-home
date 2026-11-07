import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Activity, AirVent, ArrowDownRight, ArrowUpRight, Bell, BookOpen, Check,
  ChevronDown, ChevronRight, CircuitBoard, CloudSun, DoorOpen, Fan, Flame,
  House, Layers3, Lightbulb, LockKeyhole, Menu, MoreHorizontal, PanelTop,
  Plug, Power, ShieldCheck, Sofa, Sparkles, Thermometer, WashingMachine,
  Wifi, Wind, X, MessagesSquare,
} from "lucide-react";
import { type CoverDeviceKey, type DeviceKey, type DeviceState, type SmartHomeScene, type ToggleCapability } from "@shared/smart-home";
import { useSmartHomeSync } from "../hooks/useSmartHomeSync";
import FixedPanelHome from "../components/FixedPanelHome";
import VoiceAssistant from "../components/VoiceAssistant";
import CoveringsPanel from "../components/CoveringsPanel";

type PanelProfile = "escritorio" | "suite";

const nav = [
  { href: "/", label: "Visão geral", icon: House },
  { href: "/ambientes", label: "Ambientes", icon: Layers3 },
  { href: "/coberturas", label: "Coberturas", icon: PanelTop },
  { href: "/climatizacao", label: "Climatização", icon: AirVent },
  { href: "/plantas", label: "Plantas", icon: PanelTop },
  { href: "/materiais", label: "Materiais", icon: BookOpen },
  { href: "/circuitos", label: "Circuitos", icon: CircuitBoard },
  { href: "/assistente", label: "Assistente CASA+", icon: MessagesSquare },
];
const panelRoutes = [
  { href: "/painel/escritorio", label: "Escritório", icon: PanelTop },
  { href: "/painel/suite", label: "Suíte", icon: PanelTop },
];
const rooms: { key: DeviceKey; name: string; floor: string; detail: string; icon: typeof House; climate: boolean }[] = [
  { key: "sala", name: "Sala de estar", floor: "Térreo", detail: "Conforto e iluminação", icon: Sofa , climate: true },
  { key: "jantar", name: "Sala de jantar", floor: "Térreo", detail: "Iluminação", icon: Sparkles , climate: true },
  { key: "cozinha", name: "Cozinha", floor: "Térreo", detail: "Iluminação e coifa", icon: Flame , climate: true },
  { key: "escritorio", name: "Escritório", floor: "Térreo", detail: "Conforto e iluminação", icon: PanelTop , climate: true },
  { key: "lavanderia", name: "Lavanderia", floor: "Térreo", detail: "Iluminação", icon: WashingMachine , climate: true },
  { key: "garagem", name: "Garagem", floor: "Térreo", detail: "Iluminação e acesso", icon: DoorOpen , climate: true },
  { key: "churrasqueira", name: "Churrasqueira", floor: "Térreo", detail: "Iluminação e exaustão", icon: Fan , climate: false },
  { key: "suite", name: "Suíte + closet", floor: "Superior", detail: "Conforto e iluminação", icon: House , climate: true },
  { key: "quarto2", name: "Quarto 02", floor: "Superior", detail: "Conforto e iluminação", icon: House , climate: true },
  { key: "quarto3", name: "Quarto 03", floor: "Superior", detail: "Conforto e iluminação", icon: House , climate: true },
  { key: "lavabo", name: "Lavabo", floor: "Térreo", detail: "Iluminação", icon: DoorOpen , climate: false },
  { key: "banheiro", name: "Banheiro compartilhado", floor: "Superior", detail: "Iluminação", icon: DoorOpen , climate: false },
  { key: "banhoSuite", name: "Banho da suíte", floor: "Superior", detail: "Iluminação", icon: DoorOpen , climate: false },
  { key: "jardim", name: "Jardim de inverno", floor: "Térreo", detail: "Iluminação e ventilação natural", icon: CloudSun , climate: false },
];

function PageTitle({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return <div className="page-title"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{subtitle}</p></div><span className="demo-pill"><span /> Modo demonstração</span></div>;
}

function Toggle({ checked, onClick, label, disabled = false }: { checked: boolean; onClick: () => void; label: string; disabled?: boolean }) {
  return <button className={`toggle ${checked ? "is-on" : ""}`} type="button" role="switch" aria-checked={checked} aria-label={label} onClick={onClick} disabled={disabled}><span /></button>;
}

type CoverCommit = (position: number) => void | Promise<unknown>;
type CoverSetter = (key: CoverDeviceKey, position: number) => void | Promise<unknown>;

function CoverControl({ position, roomName, kind, controlsEnabled, onCommit }: { position: number; roomName: string; kind: "persiana blackout" | "cortina"; controlsEnabled: boolean; onCommit: CoverCommit }) {
  const [draft, setDraft] = useState(position);
  const lastSubmitted = useRef(position);
  useEffect(() => { setDraft(position); lastSubmitted.current = position; }, [position]);
  const commit = () => {
    if (!controlsEnabled || draft === position || draft === lastSubmitted.current) return;
    const requestedPosition = draft;
    lastSubmitted.current = requestedPosition;
    void Promise.resolve(onCommit(requestedPosition)).catch(() => {
      setDraft(position);
      lastSubmitted.current = position;
    });
  };
  return <div className="room-cover-control">
    <div className="room-cover-heading"><span><PanelTop size={15} /> {kind}</span><strong>{position}%</strong></div>
    <input type="range" min="0" max="100" step="10" value={draft} disabled={!controlsEnabled} aria-label={`${kind} ${roomName}`} aria-valuetext={draft === 0 ? "Fechada" : draft === 100 ? "Aberta" : `${draft}% aberta`} onChange={event => setDraft(Number(event.currentTarget.value))} onPointerUp={commit} onKeyUp={commit} onBlur={commit} />
    <div className="room-cover-scale"><span>Fechada</span><span>Aberta</span></div>
  </div>;
}

function RoomCard({ room, state, onLight, onClimate, onHood, onCover, controlsEnabled }: { room: typeof rooms[number]; state: DeviceState[DeviceKey]; onLight: () => void; onClimate: () => void; onHood: () => void; onCover: CoverCommit; controlsEnabled: boolean }) {
  const Icon = room.icon;
  const coverPosition = state.coverPosition;
  return <article className="room-card">
    <div className="room-card-top"><span className="room-icon"><Icon size={18} /></span><span className="room-floor">{room.floor}</span></div>
    <div className="room-name">{room.name}</div><div className="room-detail">{room.detail}</div>
    <div className="room-telemetry"><span><Thermometer size={14} /> {controlsEnabled ? `${state.temp}° · sim.` : "— · sem snapshot"}</span>{room.climate ? <span className={state.climate ? "live" : "muted-dot"}><span className="tiny-dot" />{state.climate ? "Clima ligado" : "Clima desligado"}</span> : <span className="muted-dot">Sem climatização</span>}</div>
    <div className="room-controls"><label><Lightbulb size={15} /> Luz<Toggle checked={state.light} onClick={onLight} label={`Luz ${room.name}`} disabled={!controlsEnabled} /></label>{room.climate && <label><AirVent size={15} /> Ar<Toggle checked={state.climate} onClick={onClimate} label={`Ar-condicionado ${room.name}`} disabled={!controlsEnabled} /></label>}{(room.key === "cozinha" || room.key === "churrasqueira") && <label><Fan size={15} /> {room.key === "cozinha" ? "Coifa" : "Exaustão"}<Toggle checked={state.hood} onClick={onHood} label={`${room.key === "cozinha" ? "Coifa" : "Exaustão"} ${room.name}`} disabled={!controlsEnabled} /></label>}</div>
    {coverPosition !== null && <CoverControl position={coverPosition} roomName={room.name} kind={room.key === "sala" ? "cortina" : "persiana blackout"} controlsEnabled={controlsEnabled} onCommit={onCover} />}
  </article>;
}

function Overview({ state, toggle, scene, setCover, profile = null, controlsEnabled }: { state: DeviceState; toggle: (key: DeviceKey, item: ToggleCapability) => void; scene: (kind: SmartHomeScene) => void; setCover: CoverSetter; profile?: PanelProfile | null; controlsEnabled: boolean }) {
  const onCount = useMemo(() => Object.values(state).reduce((total, s) => total + Number(s.light), 0), [state]);
  const profileName = profile === "escritorio" ? "Escritório" : "Suíte";
  const favoriteKeys: DeviceKey[] = profile === "suite" ? ["suite", "quarto2", "quarto3", "sala"] : ["escritorio", "sala", "jantar", "cozinha"];
  const quickRooms = profile ? rooms.filter(room => favoriteKeys.includes(room.key)) : rooms.slice(0, 4);
  const climateRooms = rooms.filter(room => room.climate);
  const activeClimateCount = climateRooms.filter(room => state[room.key].climate).length;
  const averageClimateTemperature = climateRooms.reduce((sum, room) => sum + state[room.key].temp, 0) / climateRooms.length;
  const averageClimateTemperatureLabel = averageClimateTemperature.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  if (profile) return <FixedPanelHome profile={profile} controlsEnabled={controlsEnabled} activeClimateCount={activeClimateCount} climateZoneCount={climateRooms.length} onScene={scene} favoriteCards={quickRooms.map(room => <RoomCard key={room.key} room={room} state={state[room.key]} onLight={() => toggle(room.key, "light")} onClimate={() => toggle(room.key, "climate")} onHood={() => toggle(room.key, "hood")} onCover={position => setCover(room.key as CoverDeviceKey, position)} controlsEnabled={controlsEnabled} />)} />;
  return <>
    <PageTitle eyebrow={profile ? `CENTRAL FIXA · ${profileName.toUpperCase()}` : "CASA · RESUMO"} title={profile ? (profile === "escritorio" ? "Painel do Escritório" : "Painel da Suíte") : "Sua casa, em equilíbrio."} subtitle={profile ? "Atalhos personalizados deste local; os controles dão acesso à casa toda." : "Status geral e comandos rápidos para os ambientes."} />
    {profile && <section className="station-profile-banner"><span className="station-profile-icon"><PanelTop size={20} /></span><div><strong>Central fixa · {profileName}</strong><span>Perfil de tela deste local. Ambas as centrais têm acesso a todos os ambientes.</span></div><div className="station-switcher" aria-label="Alternar entre centrais">{panelRoutes.map(panel => <Link key={panel.href} href={panel.href} className={panel.href.endsWith(profile) ? "selected" : ""}>{panel.label}</Link>)}</div></section>}
    {!profile && <section className="section-block station-launch-section"><div className="section-heading"><div><div className="eyebrow">CENTRAIS FIXAS · TOUCHSCREEN</div><h2>Abrir um dos painéis da casa</h2></div><span className="section-note">Um no escritório · outro na suíte</span></div><div className="station-launch-grid">{panelRoutes.map(panel => <Link key={panel.href} href={panel.href} className="station-launch-card"><span className="station-launch-icon"><PanelTop size={21} /></span><span><strong>{panel.href.endsWith("suite") ? "Central da Suíte" : "Central do Escritório"}</strong><small>Atalhos próprios · controlar toda a casa</small></span><ChevronRight size={19} /></Link>)}</div></section>}
    <div className="demo-banner"><span className="demo-banner-icon"><Activity size={17} /></span><div><strong>{controlsEnabled ? "Estado simulado compartilhado" : "Backend indisponível"}</strong><span>{controlsEnabled ? "Os estados persistem no backend e são sincronizados entre as duas centrais e o celular. Nenhum equipamento físico está conectado." : "O backend não confirmou o snapshot; comandos estão desativados para evitar mostrar sucesso sem persistência."}</span></div><span className="demo-banner-tag">SIMULAÇÃO</span></div>
    <section className="metrics-row" aria-label="Resumo da casa">
      <article className="metric-card metric-highlight"><span className="metric-label">Temperatura média simulada</span><div className="metric-value">{controlsEnabled ? averageClimateTemperatureLabel : "—"}{controlsEnabled && <span>°C</span>}</div><div className="metric-foot"><CloudSun size={15} />{controlsEnabled ? "dados de demonstração · não são telemetria" : "aguardando snapshot confirmado"}</div><span className="metric-icon"><Thermometer size={18} /></span></article>
      <article className="metric-card"><span className="metric-label">Iluminação simulada</span><div className="metric-value">{controlsEnabled ? onCount : "—"}{controlsEnabled && <span> / 14</span>}</div><div className="metric-foot">{controlsEnabled ? "estados do backend · demonstração" : "aguardando snapshot confirmado"}</div><span className="metric-icon"><Lightbulb size={18} /></span></article>
      <article className="metric-card"><span className="metric-label">Climatização simulada</span><div className="metric-value">{controlsEnabled ? rooms.filter(room => room.climate && state[room.key].climate).length : "—"}{controlsEnabled && <span> zonas</span>}</div><div className="metric-foot">{controlsEnabled ? "por ambiente · demonstração" : "aguardando snapshot confirmado"}</div><span className="metric-icon"><AirVent size={18} /></span></article>
      <article className="metric-card"><span className="metric-label">Sistema</span><div className={`metric-value ${controlsEnabled ? "metric-online" : ""}`}>{controlsEnabled ? "Simulação ativa" : "Indisponível"}</div><div className="metric-foot"><span className="tiny-dot amber" /> {controlsEnabled ? "Home Assistant não conectado" : "backend sem confirmação"}</div><span className="metric-icon"><Wifi size={18} /></span></article>
    </section>
    <section className="section-block"><div className="section-heading"><div><div className="eyebrow">UM TOQUE</div><h2>Cenas da casa</h2></div><span className="section-note">Persistidas e sincronizadas · demonstração</span></div><div className="scene-row">
      <button className="scene-card" disabled={!controlsEnabled} onClick={() => scene("cheguei")}><span className="scene-icon scene-green"><House size={19} /></span><span><strong>Cheguei</strong><small>Acender sala e escritório</small></span><ChevronRight size={17} /></button>
      <button className="scene-card" disabled={!controlsEnabled} onClick={() => scene("noite")}><span className="scene-icon scene-violet"><CloudSun size={19} /></span><span><strong>Boa noite</strong><small>Apagar luzes e clima</small></span><ChevronRight size={17} /></button>
      <button className="scene-card" disabled={!controlsEnabled} onClick={() => scene("sair")}><span className="scene-icon scene-amber"><LockKeyhole size={19} /></span><span><strong>Estou saindo</strong><small>Desligar luzes da casa</small></span><ChevronRight size={17} /></button>
    </div></section>
    <section className="section-block"><div className="section-heading"><div><div className="eyebrow">{profile ? `ATALHOS · ${profileName.toUpperCase()}` : "ACESSO RÁPIDO"}</div><h2>{profile ? "Ambientes favoritos deste painel" : "Ambientes em destaque"}</h2></div><Link className="text-link" href="/ambientes">Controlar todos os ambientes <ChevronRight size={15} /></Link></div><div className={`room-grid ${profile ? "panel-favorites" : ""}`}>{quickRooms.map(r => <RoomCard key={r.key} room={r} state={state[r.key]} onLight={() => toggle(r.key, "light")} onClimate={() => toggle(r.key, "climate")} onHood={() => toggle(r.key, "hood")} onCover={position => setCover(r.key as CoverDeviceKey, position)} controlsEnabled={controlsEnabled} />)}</div></section>
    <div className="safety-note"><ShieldCheck size={18} /><span><strong>Projeto em fase conceitual.</strong> Equipamentos, circuitos e dimensionamentos precisam de validação por profissionais habilitados.</span><Link href="/circuitos">Ver limites do desenho <ChevronRight size={15} /></Link></div>
  </>;
}
function RoomsPage({ state, toggle, setCover, floor, setFloor, controlsEnabled }: { state: DeviceState; toggle: (key: DeviceKey, item: ToggleCapability) => void; setCover: CoverSetter; floor: string; setFloor: (floor: string) => void; controlsEnabled: boolean }) {
  const filtered = rooms.filter(r => floor === "Todos" || r.floor === floor);
  return <><PageTitle eyebrow="CONTROLE POR ESPAÇO" title="Ambientes" subtitle="Iluminação, coberturas motorizadas e conforto por cômodo, com estados compartilhados de demonstração." /><div className="filter-row"><div className="segmented">{["Todos", "Térreo", "Superior"].map(f => <button key={f} className={floor === f ? "selected" : ""} onClick={() => setFloor(f)}>{f}</button>)}</div><span className="section-note"><span className="tiny-dot amber" /> 14 ambientes · simulados</span></div><div className="room-grid room-grid-large">{filtered.map(r => <RoomCard key={r.key} room={r} state={state[r.key]} onLight={() => toggle(r.key, "light")} onClimate={() => toggle(r.key, "climate")} onHood={() => toggle(r.key, "hood")} onCover={position => setCover(r.key as CoverDeviceKey, position)} controlsEnabled={controlsEnabled} />)}</div><div className="inline-note"><Lightbulb size={16} /> Os estados são persistidos pelo backend e sincronizados entre as duas centrais e o celular; não acionam equipamentos reais.</div></>;
}

function ClimatePage({ state, toggle, controlsEnabled }: { state: DeviceState; toggle: (key: DeviceKey, item: ToggleCapability) => void; controlsEnabled: boolean }) {
  const climateRooms = rooms.filter(room => room.climate);
  return <><PageTitle eyebrow="CONFORTO TÉRMICO" title="Climatização" subtitle="Zonas de ar-condicionado por cômodo — configuração ilustrativa." /><div className="climate-summary"><div className="climate-big"><span className="climate-glyph"><AirVent size={27} /></span><div><span className="eyebrow">REFERÊNCIA DEMONSTRATIVA</span><strong>22,4°</strong><small>temperatura média fictícia</small></div></div><div className="climate-hint"><Wind size={17} /><span>O conceito prevê um sistema central por zonas. A solução e a capacidade devem ser definidas após cálculo de carga térmica e projeto de climatização.</span></div></div><div className="climate-list">{climateRooms.map(r => <div className="climate-row" key={r.key}><span className="climate-room-icon"><AirVent size={17} /></span><div className="climate-room-name"><strong>{r.name}</strong><span>{r.floor} · leitura simulada</span></div><span className="climate-temp"><Thermometer size={15} />{state[r.key].temp}°</span><div className="temp-adjust"><button disabled={!controlsEnabled} onClick={() => { const e = new CustomEvent("temp-adjust", { detail: { key: r.key, delta: -1 } }); window.dispatchEvent(e); }} aria-label={`Diminuir temperatura ${r.name}`}>−</button><span>{state[r.key].temp}°</span><button disabled={!controlsEnabled} onClick={() => { const e = new CustomEvent("temp-adjust", { detail: { key: r.key, delta: 1 } }); window.dispatchEvent(e); }} aria-label={`Aumentar temperatura ${r.name}`}>+</button></div><Toggle checked={state[r.key].climate} onClick={() => toggle(r.key, "climate")} label={`Climatização ${r.name}`} disabled={!controlsEnabled} /></div>)}</div><div className="inline-note"><Fan size={16} /> As temperaturas são fictícias; os comandos são persistidos e sincronizados, mas ainda não controlam equipamentos físicos. Ambientes excluídos do projeto não aparecem nesta lista.</div></>;
}

function PlantsPage() {
  return <>
    <PageTitle eyebrow="PLANTA CONCEITUAL" title="Plantas da casa" subtitle="Distribuição baseada na referência compartilhada do Planner 5D e nas confirmações do layout." />
    <div className="plant-reference-banner">
      <span className="plant-reference-icon"><PanelTop size={19} /></span>
      <div><strong>Terreno plano · 10 m × 25 m</strong><span>Rua na face de 10 m · corredor lateral externo de 2 m à direita · cotas internas ainda não fornecidas.</span></div>
      <span className="demo-banner-tag">SEM ESCALA INTERNA</span>
    </div>
    <div className="concept-plans-grid">
      <article className="concept-plan-card">
        <div className="concept-plan-head"><div><div className="eyebrow">PAVIMENTO TÉRREO</div><h2>Fundos → frente / rua</h2></div><a className="download-link" href="/terreo.svg" download>Baixar SVG</a></div>
        <figure className="concept-plan-figure"><img className="concept-plan-image" src="/terreo.svg" alt="Planta conceitual do térreo com jardim externo nos fundos, churrasqueira e lavanderia, jantar e cozinha, escada e jardim de inverno, sala, escritório com lavabo próximo e garagem frontal para dois carros." loading="lazy" /><figcaption>Lavabo junto ao escritório, conforme confirmado. A frente está na parte inferior do desenho.</figcaption></figure>
      </article>
      <article className="concept-plan-card">
        <div className="concept-plan-head"><div><div className="eyebrow">PAVIMENTO SUPERIOR</div><h2>Sacadas nos quartos</h2></div><a className="download-link" href="/superior.svg" download>Baixar SVG</a></div>
        <figure className="concept-plan-figure"><img className="concept-plan-image" src="/superior.svg" alt="Planta conceitual do superior com quartos 2 e 3 e sacadas voltadas aos fundos; hall, banheiro social, escada, vazio sobre jardim de inverno e suíte com closet, banheiro e sacada para a frente." loading="lazy" /><figcaption>Quartos 2 e 3 com sacadas para os fundos; sacada da suíte voltada à frente, conforme confirmado.</figcaption></figure>
      </article>
    </div>
    <div className="plan-disclaimer"><span className="plan-ruler">10 × 25</span><div><strong>Estudo conceitual baseado no desenho compartilhado.</strong><span>Somente lote e corredor lateral têm medidas confirmadas; dimensões internas, portas/janelas e recuos precisam de levantamento. Não usar para obra.</span></div><span className="demo-banner-tag">NÃO EXECUTIVO</span></div>
    <div className="inline-note"><ShieldCheck size={16} /> A nova distribuição preserva os ambientes da referência e as decisões confirmadas; a planta executiva deve ser validada por profissional local.</div>
  </>;
}

const materialGroups = [
  { name: "Centrais fixas touchscreen", icon: PanelTop, items: [["Painel touch/tablet fixo do escritório", "1 un. · tamanho/modelo a escolher"], ["Painel touch/tablet fixo da suíte", "1 un. · tamanho/modelo a escolher"], ["Suportes, alimentação e acesso à rede", "2 locais · definir após seleção dos painéis"]] },
  { name: "Controle e automação", icon: CircuitBoard, items: [["Controlador / gateway único", "1 un. para as duas telas · Home Assistant proposto"], ["Módulos de acionamento de iluminação", "qtd. por circuito · a definir"], ["Interfaces para zonas de climatização", "qtd. por zona · compatibilidade a validar"], ["Fontes e caixas para módulos", "conforme projeto"]] },
  { name: "Persianas e cortinas", icon: PanelTop, items: [["Persianas blackout motorizadas — suíte, quartos 2/3 e escritório", "4 ambientes · motores conforme vãos a confirmar"], ["Cortina motorizada — sala de estar", "1 ambiente · motor(es) conforme vãos a confirmar"], ["Módulos/atuadores e comandos manuais compatíveis", "seleção por tipo de motor e protocolo; a validar"]] },
  { name: "Assistente por voz local", icon: MessagesSquare, items: [["Microfone/satélite dedicado com wake word local", "quantidade e posicionamento após teste de cobertura acústica"], ["Hardware e pipeline Home Assistant para voz local", "dimensionar após escolher wake word, STT/TTS e validar pt-BR"]] },
  { name: "Sensores e comandos", icon: Activity, items: [["Sensores de temperatura e umidade", "1 por zona · estimativa"], ["Sensores de presença", "a definir por ambiente"], ["Sensores de abertura", "portas/janelas selecionadas"], ["Interruptores e comandos locais", "qtd. conforme pontos"]] },
  { name: "Rede e infraestrutura", icon: Wifi, items: [["Ponto de acesso Wi-Fi", "cobertura a validar"], ["Cabeamento estruturado", "metragem após levantamento"], ["Quadro/caixas e identificação", "dimensionamento profissional"], ["Dutos, eletrocalhas e caixas", "conforme planta executiva"]] },
  { name: "Conforto e exaustão", icon: Wind, items: [["Sistema central por zonas (exceto lavabo, jardim de inverno, churrasqueira e banheiros)", "capacidade após cálculo térmico"], ["Coifa da cozinha", "vazão e duto a dimensionar"], ["Coifa/exaustão da churrasqueira", "solução específica a dimensionar"], ["Atuadores/contatores compatíveis", "por carga · seleção técnica"]] },
];
function MaterialsPage() {
  return <><PageTitle eyebrow="PRÉ-LISTA DE REFERÊNCIA" title="Materiais" subtitle="Duas centrais fixas, coberturas motorizadas e voz local proposta; hardware e quantidades dependem de seleção e projeto executivo." /><div className="materials-export"><a className="download-link" href="/lista-materiais.md" download>Baixar lista de materiais (.md)</a></div><div className="materials-warning"><span><BookOpen size={18} /></span><div><strong>Lista preliminar — não é orçamento de compra</strong><p>Quantidades, especificações e compatibilidade dependem da planta final, protocolo escolhido, cargas e normas locais.</p></div></div><div className="material-grid">{materialGroups.map(group => { const Icon = group.icon; return <article className="material-card" key={group.name}><div className="material-heading"><span className="room-icon"><Icon size={18} /></span><h2>{group.name}</h2><MoreHorizontal size={18} /></div>{group.items.map(([name, quantity]) => <div className="material-item" key={name}><span><Check size={14} />{name}</span><small>{quantity}</small></div>)}</article>; })}</div><div className="material-bottom"><Plug size={17} /><span>As duas telas são clientes do mesmo hub, não controladores separados. Definir rede, alimentação, tamanho e montagem dos painéis; validar gateway, protocolo e dispositivos antes da compra.</span></div></>;
}

function CircuitsPage() {
  const nodes = [
    { num: "01", title: "Entrada e quadros", text: "Alimentação, medição e distribuição — sem especificar proteção ou dimensionamento." },
    { num: "02", title: "Controlador / gateway", text: "Home Assistant único proposto; coordena rede, sensores e interfaces compatíveis." },
    { num: "03", title: "Sensores e voz local", text: "Sensores ambientais e um satélite/microfone dedicado; wake word e cobertura acústica a definir." },
    { num: "04", title: "Interfaces e atuadores", text: "Módulos isolados e dimensionados para iluminação, exaustão, HVAC e motores de cortina/persiana." },
    { num: "05", title: "Cargas e coberturas", text: "Luzes, ar, coifas e coberturas: quatro ambientes com blackout e sala com cortina; motores por vão a confirmar." },
    { num: "06", title: "Centrais touchscreen", text: "Uma no escritório e outra na suíte; clientes do mesmo hub, com favoritos locais." },
  ];
  return <><PageTitle eyebrow="TOPOLOGIA FUNCIONAL" title="Circuitos e integração" subtitle="Diagrama conceitual: um hub compartilhado e dois pontos fixos de controle." /><div className="circuit-alert"><span className="alert-icon"><ShieldCheck size={19} /></span><div><strong>Não é esquema de ligação para instalação</strong><p>O desenho não indica tensão, corrente, disjuntores, bitolas, aterramento nem bornes. O projeto elétrico e a instalação devem ser definidos e revisados por profissional habilitado.</p></div></div><div className="circuit-card"><div className="circuit-head"><div><div className="eyebrow">DIAGRAMA FUNCIONAL</div><h2>Automação residencial por zonas</h2></div><div className="circuit-head-actions"><a className="download-link" href="/diagrama-automacao.png" download>Baixar PNG</a><a className="download-link" href="/diagrama-automacao.mmd" download>Fonte Mermaid</a><span className="demo-banner-tag">SEM ESCALA</span></div></div><svg className="circuit-svg" viewBox="0 0 1000 620" role="img" aria-label="Diagrama conceitual com Home Assistant, duas centrais, microfone local e atuadores de persianas e cortinas">
    <defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#8e9b90" /></marker></defs>
    <g className="circuit-lines"><path d="M190 100H250V190H310"/><path d="M190 260H310"/><path d="M480 210L580 122"/><path d="M480 260H580"/><path d="M480 310L580 398"/><path d="M730 122H820"/><path d="M730 260H820"/><path d="M730 398H820"/><path d="M730 260H785V512H820"/><path d="M395 330V405"/><path d="M480 445H540"/></g>
    <g className="circuit-node node-control"><rect x="30" y="50" width="160" height="100" rx="14"/><text x="110" y="89">SATÉLITE DE VOZ</text><text x="110" y="117" className="circuit-sub">wake word local · a definir</text></g><g className="circuit-node node-main"><rect x="30" y="210" width="160" height="100" rx="15"/><text x="110" y="250">QUADRO</text><text x="110" y="275" className="circuit-sub">elétrico residencial</text></g>
    <g className="circuit-node node-control"><rect x="310" y="190" width="170" height="140" rx="16"/><text x="395" y="238">HOME ASSISTANT</text><text x="395" y="266" className="circuit-sub">hub único · proposto</text><text x="395" y="290" className="circuit-sub">ainda não conectado</text></g>
    <g className="circuit-node node-sensor"><rect x="580" y="72" width="150" height="100" rx="14"/><text x="655" y="113">SENSORES</text><text x="655" y="139" className="circuit-sub">clima · presença</text></g>
    <g className="circuit-node node-actuator"><rect x="580" y="210" width="150" height="100" rx="14"/><text x="655" y="250">ATUADORES</text><text x="655" y="276" className="circuit-sub">módulos compatíveis</text></g>
    <g className="circuit-node node-network"><rect x="310" y="405" width="170" height="80" rx="14"/><text x="395" y="440">REDE LOCAL</text><text x="395" y="464" className="circuit-sub">Wi-Fi / Ethernet*</text></g><g className="circuit-node node-control"><rect x="540" y="405" width="200" height="80" rx="14"/><text x="640" y="434">2 PAINÉIS TOUCH</text><text x="640" y="460" className="circuit-sub">Escritório + suíte</text></g>
    <g className="circuit-node node-load"><rect x="820" y="72" width="150" height="100" rx="14"/><text x="895" y="113">CLIMA</text><text x="895" y="139" className="circuit-sub">zonas independentes</text></g>
    <g className="circuit-node node-load"><rect x="820" y="210" width="150" height="100" rx="14"/><text x="895" y="250">ILUMINAÇÃO</text><text x="895" y="276" className="circuit-sub">comandos por ambiente</text></g>
    <g className="circuit-node node-load"><rect x="820" y="348" width="150" height="100" rx="14"/><text x="895" y="388">EXAUSTÃO</text><text x="895" y="414" className="circuit-sub">coifas · interfaces</text></g><g className="circuit-node node-load"><rect x="820" y="470" width="150" height="85" rx="14"/><text x="895" y="502">COBERTURAS</text><text x="895" y="528" className="circuit-sub">blackout · cortina</text></g>
    <text x="35" y="600" className="circuit-foot">Wake word e áudio ficam na casa; somente a transcrição pós-ativação pode seguir ao LLM. Hardware e circuitos requerem projeto profissional.</text>
  </svg><div className="circuit-legend"><span><i className="legend-control"/> Controle e comunicação</span><span><i className="legend-power"/> Instalação/cargas (definição profissional)</span></div></div><div className="circuit-steps">{nodes.map(n => <div className="circuit-step" key={n.num}><span>{n.num}</span><div><strong>{n.title}</strong><p>{n.text}</p></div></div>)}</div><div className="inline-note"><Wifi size={16} /> O controlador não substitui os circuitos elétricos convencionais nem as proteções definidas no projeto.</div></>;
}

export default function Home() {
  const [path] = useLocation();
  const panelProfile: PanelProfile | null = path.startsWith("/painel/escritorio") ? "escritorio" : path.startsWith("/painel/suite") ? "suite" : null;
  const assistantRoute = path === "/assistente" || path.endsWith("/assistente");
  const coveringsRoute = path === "/coberturas" || path.endsWith("/coberturas");
  const coveringsHref = panelProfile ? `/painel/${panelProfile}/coberturas` : "/coberturas";
  const { state, isReady: controlsEnabled, status: syncStatus, toggle: sendToggle, adjustTemperature, setCoverPosition, applyScene } = useSmartHomeSync();
  const [floor, setFloor] = useState("Todos");
  const [toast, setToast] = useState("");
  const [toastKind, setToastKind] = useState<"success" | "error">("success");
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const handler = (event: Event) => {
      const { key, delta } = (event as CustomEvent<{ key: DeviceKey; delta: -1 | 1 }>).detail;
      if (!controlsEnabled) return;
      void adjustTemperature(key, delta).catch(() => {
        setToastKind("error");
        setToast("A temperatura não foi confirmada pelo backend; o estado não foi atualizado.");
      });
    };
    window.addEventListener("temp-adjust", handler);
    return () => window.removeEventListener("temp-adjust", handler);
  }, [adjustTemperature, controlsEnabled]);
  useEffect(() => { if (!toast) return; const t = window.setTimeout(() => setToast(""), 2600); return () => window.clearTimeout(t); }, [toast]);
  const toggle = (key: DeviceKey, capability: ToggleCapability) => {
    void sendToggle(key, capability).catch(() => {
      setToastKind("error");
      setToast("O comando não foi confirmado; nenhuma alteração foi aplicada na interface.");
    });
  };
  const setCover = (key: CoverDeviceKey, position: number) => setCoverPosition(key, position).catch(error => {
      setToastKind("error");
      setToast("A posição não foi confirmada pelo backend; o estado exibido não foi alterado.");
      throw error;
    });
  const scene = (kind: SmartHomeScene) => {
    void applyScene(kind).then(() => {
      setToastKind("success");
      setToast(kind === "cheguei" ? "Cena ‘Cheguei’ salva e sincronizada" : kind === "noite" ? "Cena ‘Boa noite’ salva e sincronizada" : "Cena ‘Estou saindo’ salva e sincronizada");
    }).catch(() => {
      setToastKind("error");
      setToast("A cena não foi confirmada pelo backend; nenhuma alteração foi aplicada.");
    });
  };
  const activeLabel = assistantRoute ? "Assistente CASA+" : coveringsRoute ? "Cortinas e persianas" : panelProfile ? `Central · ${panelProfile === "escritorio" ? "Escritório" : "Suíte"}` : nav.find(n => n.href === path)?.label ?? "Visão geral";
  const syncLabel = syncStatus === "connected" ? "Simulação sincronizada" : syncStatus === "reconnecting" ? "Reconectando atualizações" : syncStatus === "offline" ? "Backend indisponível" : "Carregando estado";
  return <div className={`app-shell ${panelProfile ? "panel-profile" : ""}`}>
    <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}><div className="brand"><span className="brand-mark"><House size={20} /><span /></span><span className="brand-copy"><strong>CASA<span>+</span></strong><small>INTELIGÊNCIA RESIDENCIAL</small></span><button className="mobile-close" onClick={() => setMobileOpen(false)} aria-label="Fechar menu"><X size={18}/></button></div><div className="side-label">CENTRAIS FIXAS</div><nav className="side-nav">{panelRoutes.map(item => { const Icon = item.icon; const selected = path === item.href || path.startsWith(`${item.href}/`); return <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={`nav-link ${selected ? "nav-active" : ""}`}><Icon size={18} /><span>{item.label}</span>{selected && <span className="nav-indicator"/>}</Link>; })}</nav><div className="side-label house-nav-label">PAINEL DA CASA</div><nav className="side-nav">{nav.map(item => { const Icon = item.icon; const target = item.href === "/coberturas" ? coveringsHref : item.href; const selected = path === target || (item.href === "/assistente" && assistantRoute); return <Link key={item.href} href={target} onClick={() => setMobileOpen(false)} className={`nav-link ${selected ? "nav-active" : ""}`}><Icon size={18} /><span>{item.label}</span>{selected && <span className="nav-indicator"/>}</Link>; })}</nav><div className="sidebar-bottom"><div className="connection-card"><span className="connection-icon"><Wifi size={16}/></span><div><strong>Home Assistant</strong><small><i/> Não conectado</small></div><MoreHorizontal size={16}/></div><div className="profile-row"><span className="profile-avatar">C</span><span><strong>Casa de referência</strong><small>Projeto residencial</small></span><ChevronDown size={15}/></div></div></aside>
    <div className="main-shell"><header className="topbar"><button className="mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Abrir menu"><Menu size={20}/></button><div className="breadcrumb"><span>Casa Inteligente</span><ChevronRight size={14}/><strong>{activeLabel}</strong></div><div className="topbar-right"><span className={`topbar-status sync-status-${syncStatus}`} aria-live="polite"><span className={`tiny-dot ${syncStatus === "connected" ? "" : "amber"}`}/> {syncLabel}</span><button className="icon-button" aria-label="Notificações"><Bell size={18}/><i/></button><span className="top-avatar">C</span></div></header><main className="page-content">
      {syncStatus !== "connected" && <div className={`sync-notice sync-notice-${syncStatus}`} role={syncStatus === "offline" ? "alert" : "status"}><span className="sync-notice-icon"><Activity size={17} /></span><div><strong>{syncStatus === "loading" ? "Carregando o estado compartilhado" : syncStatus === "offline" ? "Estado do backend indisponível" : "Atualização em tempo real reconectando"}</strong><span>{syncStatus === "loading" ? "Os valores exibidos são ilustrativos até o servidor confirmar o snapshot." : syncStatus === "offline" ? "Valores exibidos são apenas fallback; comandos estão desativados e nenhum estado é confirmado." : "O último snapshot confirmado continua disponível; novos eventos serão retomados automaticamente."}</span></div></div>}
      {(path === "/" || path === "/painel/escritorio" || path === "/painel/suite") && <Overview state={state} toggle={toggle} scene={scene} setCover={setCover} profile={panelProfile} controlsEnabled={controlsEnabled}/>}
      {path === "/ambientes" && <RoomsPage state={state} toggle={toggle} setCover={setCover} floor={floor} setFloor={setFloor} controlsEnabled={controlsEnabled}/>}
      {path === "/climatizacao" && <ClimatePage state={state} toggle={toggle} controlsEnabled={controlsEnabled}/>}
      {path === "/plantas" && <PlantsPage/>}
      {path === "/materiais" && <MaterialsPage/>}
      {path === "/circuitos" && <CircuitsPage/>}
      {coveringsRoute && <CoveringsPanel profile={panelProfile} state={state} controlsEnabled={controlsEnabled} onSetPosition={setCover}/>}
      {assistantRoute && <VoiceAssistant backendAvailable={controlsEnabled}/>}
      <footer className="page-footer"><span>CASA+ <i>•</i> Projeto conceitual de automação residencial</span><span>{controlsEnabled ? "Estado simulado compartilhado · nenhum hardware conectado" : "Aguardando estado confirmado do backend"}</span></footer>
    </main></div>
    {mobileOpen && <button className="scrim" onClick={() => setMobileOpen(false)} aria-label="Fechar navegação"/>}
    <nav className="mobile-nav">{[nav[0], nav[1], nav[2], nav[3], nav[7]].map(item => { const Icon = item.icon; const target = item.href === "/coberturas" ? coveringsHref : item.href; const selected = path === target || (item.href === "/assistente" && assistantRoute); return <Link key={item.href} href={target} className={`mobile-nav-item ${selected ? "mobile-nav-active" : ""}`}><Icon size={19}/><span>{item.label === "Visão geral" ? "Início" : item.label === "Assistente CASA+" ? "Assistente" : item.label === "Climatização" ? "Clima" : item.label}</span></Link>; })}</nav>
    {toast && <div className={`toast ${toastKind === "error" ? "toast-error" : ""}`} role={toastKind === "error" ? "alert" : "status"}>{toastKind === "error" ? <X size={17}/> : <Check size={17}/ >}{toast}</div>}
  </div>;
}
