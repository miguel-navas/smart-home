import type { ReactNode } from "react";
import { AirVent, ChevronRight, CloudSun, House, LockKeyhole } from "lucide-react";
import { Link } from "wouter";
import type { SmartHomeScene } from "@shared/smart-home";

type PanelProfile = "escritorio" | "suite";

type FixedPanelHomeProps = {
  profile: PanelProfile;
  controlsEnabled: boolean;
  activeClimateCount: number;
  climateZoneCount: number;
  favoriteCards: ReactNode;
  onScene: (scene: SmartHomeScene) => void;
};

const scenes: {
  id: SmartHomeScene;
  title: string;
  detail: string;
  icon: typeof House;
  tone: string;
}[] = [
  { id: "cheguei", title: "Cheguei", detail: "Acender sala e escritório", icon: House, tone: "green" },
  { id: "noite", title: "Boa noite", detail: "Apagar luzes e clima", icon: CloudSun, tone: "violet" },
  { id: "sair", title: "Estou saindo", detail: "Desligar as luzes", icon: LockKeyhole, tone: "amber" },
];

const panels: { id: PanelProfile; href: string; label: string }[] = [
  { id: "escritorio", href: "/painel/escritorio", label: "Escritório" },
  { id: "suite", href: "/painel/suite", label: "Suíte" },
];

export default function FixedPanelHome({
  profile,
  controlsEnabled,
  activeClimateCount,
  climateZoneCount,
  favoriteCards,
  onScene,
}: FixedPanelHomeProps) {
  const profileName = profile === "escritorio" ? "Escritório" : "Suíte";

  return (
    <div className="fixed-panel-home">
      <header className="panel-home-heading">
        <div>
          <div className="eyebrow">LAYOUT PROVISÓRIO · 10″ EM PAISAGEM</div>
          <h1>Central {profile === "suite" ? "da" : "do"} {profileName}</h1>
          <p>Favoritos deste local, com controles para toda a casa.</p>
        </div>
        <nav className="panel-profile-switcher" aria-label="Alternar perfil da central">
          {panels.map(panel => (
            <Link
              key={panel.id}
              href={panel.href}
              className={panel.id === profile ? "selected" : ""}
              aria-current={panel.id === profile ? "page" : undefined}
            >
              {panel.label}
            </Link>
          ))}
        </nav>
      </header>

      <div className={`panel-demo-strip ${controlsEnabled ? "is-connected" : "is-unavailable"}`} role={controlsEnabled ? "status" : "alert"} aria-live="polite">
        <span className="panel-demo-state"><i />{controlsEnabled ? "Backend conectado" : "Backend indisponível"}</span>
        <span className="panel-demo-label">MODO DEMONSTRAÇÃO · SEM HARDWARE CONECTADO</span>
      </div>

      <section className="panel-home-section panel-scenes-section" aria-labelledby="panel-scenes-title">
        <div className="panel-home-section-heading">
          <div><div className="eyebrow">UM TOQUE</div><h2 id="panel-scenes-title">Cenas rápidas</h2></div>
          <span className="panel-section-note">Simuladas e sincronizadas</span>
        </div>
        <div className="panel-scene-grid">
          {scenes.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className="panel-scene-button"
                type="button"
                disabled={!controlsEnabled}
                onClick={() => onScene(item.id)}
              >
                <span className={`panel-scene-icon tone-${item.tone}`}><Icon size={20} /></span>
                <span className="panel-scene-copy"><strong>{item.title}</strong><small>{item.detail}</small></span>
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </section>

      <section className="panel-home-section panel-favorites-section" aria-labelledby="panel-favorites-title">
        <div className="panel-home-section-heading">
          <div><div className="eyebrow">ATALHOS DO LOCAL</div><h2 id="panel-favorites-title">Favoritos do {profileName}</h2></div>
          <span className="panel-section-note">Toque para controlar · estado compartilhado</span>
        </div>
        <div className="panel-favorite-grid">{favoriteCards}</div>
      </section>

      <div className="panel-home-bottom">
        <section className="panel-info-card panel-climate-card" aria-labelledby="panel-climate-title">
          <span className="panel-info-icon"><AirVent size={20} /></span>
          <div className="panel-info-copy">
            <div className="eyebrow">AR-CONDICIONADO CENTRAL</div>
            <h2 id="panel-climate-title">{activeClimateCount} de {climateZoneCount} zonas ligadas</h2>
            <p>Somente ambientes previstos no projeto · valores simulados</p>
          </div>
          <Link className="panel-info-link" href="/climatizacao">Ver zonas <ChevronRight size={17} /></Link>
        </section>
        <section className="panel-info-card panel-rooms-card" aria-labelledby="panel-rooms-title">
          <span className="panel-info-icon"><House size={20} /></span>
          <div className="panel-info-copy">
            <div className="eyebrow">ACESSO À CASA TODA</div>
            <h2 id="panel-rooms-title">Todos os ambientes</h2>
            <p>Escolha Térreo, Superior ou Todos na lista.</p>
          </div>
          <Link className="panel-info-link" href="/ambientes">Abrir lista <ChevronRight size={17} /></Link>
        </section>
      </div>
    </div>
  );
}
