import { useEffect, useRef, useState } from "react";
import { ChevronLeft, PanelTop } from "lucide-react";
import { Link } from "wouter";
import type { CoverDeviceKey, DeviceState } from "@shared/smart-home";
import "./CoveringsPanel.css";

type PanelProfile = "escritorio" | "suite";
type Floor = "Térreo" | "Superior";
type CoveringItem = {
  key: CoverDeviceKey;
  room: string;
  floor: Floor;
  kind: "Cortina motorizada" | "Persiana blackout";
};
type PositionSetter = (key: CoverDeviceKey, position: number) => void | Promise<unknown>;

type CoveringsPanelProps = {
  profile: PanelProfile | null;
  state: DeviceState;
  controlsEnabled: boolean;
  onSetPosition: PositionSetter;
};

const coverings: CoveringItem[] = [
  { key: "sala", room: "Sala de estar", floor: "Térreo", kind: "Cortina motorizada" },
  { key: "escritorio", room: "Escritório", floor: "Térreo", kind: "Persiana blackout" },
  { key: "suite", room: "Suíte + closet", floor: "Superior", kind: "Persiana blackout" },
  { key: "quarto2", room: "Quarto 02", floor: "Superior", kind: "Persiana blackout" },
  { key: "quarto3", room: "Quarto 03", floor: "Superior", kind: "Persiana blackout" },
];

const quickPositions = [0, 25, 50, 75, 100];

function positionLabel(position: number | null) {
  if (position === null) return "Sem posição confirmada";
  if (position === 0) return "Fechada";
  if (position === 100) return "Aberta";
  return "Parcialmente aberta";
}

function CoveringCard({
  item,
  position,
  controlsEnabled,
  onSetPosition,
}: {
  item: CoveringItem;
  position: number | null;
  controlsEnabled: boolean;
  onSetPosition: PositionSetter;
}) {
  const [draft, setDraft] = useState(position ?? 0);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState("");
  const lastSubmitted = useRef<number | null>(null);
  const inFlight = useRef(false);

  useEffect(() => {
    setDraft(position ?? 0);
    lastSubmitted.current = position;
    setFeedback("");
  }, [position]);

  const submitPosition = (requestedPosition: number) => {
    if (
      !controlsEnabled ||
      position === null ||
      inFlight.current ||
      requestedPosition === position ||
      requestedPosition === lastSubmitted.current
    ) return;

    inFlight.current = true;
    lastSubmitted.current = requestedPosition;
    setDraft(requestedPosition);
    setPending(true);
    setFeedback("Enviando comando simulado…");

    void Promise.resolve(onSetPosition(item.key, requestedPosition))
      .then(() => setFeedback(`Posição de ${requestedPosition}% salva no backend simulado.`))
      .catch(() => {
        setDraft(position);
        lastSubmitted.current = position;
        setFeedback("O backend não confirmou o comando; exibindo a última posição confirmada.");
      })
      .finally(() => {
        inFlight.current = false;
        setPending(false);
      });
  };

  const commitDraft = () => submitPosition(draft);
  const disabled = !controlsEnabled || position === null || pending;

  return (
    <article className="covering-card">
      <div className="covering-card-heading">
        <span className="covering-card-icon"><PanelTop size={19} aria-hidden="true" /></span>
        <div className="covering-card-name">
          <span>{item.kind}</span>
          <h3>{item.room}</h3>
        </div>
        <div className="covering-reading" aria-label={`Posição confirmada: ${position === null ? "indisponível" : `${position}%`}`}>
          <strong>{position === null ? "—" : `${position}%`}</strong>
          <span>{positionLabel(position)}</span>
        </div>
      </div>

      <label className="covering-slider-label" htmlFor={`cover-${item.key}`}>
        <span>Ajustar abertura</span>
        <span>{draft}%</span>
      </label>
      <input
        id={`cover-${item.key}`}
        className="covering-slider"
        type="range"
        min="0"
        max="100"
        step="5"
        value={draft}
        disabled={disabled}
        aria-label={`Posição da ${item.kind.toLowerCase()} — ${item.room}`}
        aria-valuetext={positionLabel(draft)}
        onChange={event => setDraft(Number(event.currentTarget.value))}
        onPointerUp={commitDraft}
        onKeyUp={commitDraft}
        onBlur={commitDraft}
      />
      <div className="covering-slider-scale"><span>Fechada · 0%</span><span>100% · Aberta</span></div>

      <div className="covering-quick-actions" aria-label={`Ações rápidas para ${item.room}`}>
        <button type="button" disabled={disabled || position === 0} onClick={() => submitPosition(0)}>Fechar</button>
        <button type="button" disabled={disabled || position === 100} onClick={() => submitPosition(100)}>Abrir</button>
      </div>

      <div className="covering-presets" aria-label={`Posições rápidas para ${item.room}`}>
        {quickPositions.map(value => (
          <button
            key={value}
            type="button"
            disabled={disabled || position === value}
            aria-label={`Definir ${item.room} em ${value}%`}
            aria-pressed={position === value}
            onClick={() => submitPosition(value)}
          >
            {value}%
          </button>
        ))}
      </div>

      <p className={`covering-feedback ${feedback.includes("não confirmou") ? "is-error" : ""}`} role="status" aria-live="polite">
        {pending ? "Salvando no estado simulado…" : feedback || "Toque em um valor ou arraste para ajustar."}
      </p>
    </article>
  );
}

export default function CoveringsPanel({ profile, state, controlsEnabled, onSetPosition }: CoveringsPanelProps) {
  const profileName = profile === "escritorio" ? "Escritório" : profile === "suite" ? "Suíte" : null;
  const backHref = profile ? `/painel/${profile}` : "/ambientes";
  const backLabel = profile ? "Voltar à central" : "Voltar aos ambientes";

  return (
    <section className="coverings-page" aria-labelledby="coverings-title">
      <header className="coverings-heading">
        <div className="coverings-heading-main">
          <span className="coverings-heading-icon"><PanelTop size={22} aria-hidden="true" /></span>
          <div>
            <div className="eyebrow">CONTROLE DE COBERTURAS{profileName ? ` · CENTRAL ${profileName.toUpperCase()}` : " · CASA TODA"}</div>
            <h1 id="coverings-title">Cortinas e persianas</h1>
            <p>Abra, feche ou escolha a posição de cada cobertura motorizada.</p>
          </div>
        </div>
        <Link className="coverings-back-link" href={backHref}><ChevronLeft size={17} />{backLabel}</Link>
      </header>

      <div className={`coverings-demo-status ${controlsEnabled ? "is-ready" : "is-offline"}`} role={controlsEnabled ? "status" : "alert"} aria-live="polite">
        <span className="coverings-status-dot" />
        <div>
          <strong>{controlsEnabled ? "Estado simulado sincronizado" : "Backend indisponível"}</strong>
          <span>{controlsEnabled ? "Os comandos são salvos pelo backend e sincronizados com as duas centrais e o celular." : "Aguardando snapshot confirmado. Os controles estão desativados; nenhuma posição foi alterada."}</span>
        </div>
        <span className="coverings-demo-tag">SEM HARDWARE CONECTADO</span>
      </div>

      <div className="coverings-floor-grid">
        {(["Térreo", "Superior"] as const).map(floor => {
          const floorItems = coverings.filter(item => item.floor === floor);
          return (
            <section className="coverings-floor" key={floor} aria-labelledby={`coverings-floor-${floor === "Térreo" ? "terreo" : "superior"}`}>
              <div className="coverings-floor-heading">
                <div><span className="eyebrow">PAVIMENTO</span><h2 id={`coverings-floor-${floor === "Térreo" ? "terreo" : "superior"}`}>{floor}</h2></div>
                <span>{floorItems.length} {floorItems.length === 1 ? "dispositivo" : "dispositivos"}</span>
              </div>
              <div className="coverings-card-grid">
                {floorItems.map(item => (
                  <CoveringCard
                    key={item.key}
                    item={item}
                    position={state[item.key]?.coverPosition ?? null}
                    controlsEnabled={controlsEnabled}
                    onSetPosition={onSetPosition}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <footer className="coverings-disclaimer">
        <strong>Modo demonstração.</strong> As posições representam estado simulado no backend; nenhum motor, cortina ou persiana física está conectado.
      </footer>
    </section>
  );
}
