import { useEffect, useState } from "react";
import { Bot, MicOff, Volume2, VolumeX } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { AIChatBox, type Message } from "./AIChatBox";

const prompts = [
  "Quais ambientes têm persianas ou cortinas?",
  "Feche a cortina da sala",
  "Deixe a persiana do escritório em 40%",
];

export default function VoiceAssistant({ backendAvailable }: { backendAvailable: boolean }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [readAloud, setReadAloud] = useState(false);
  const [error, setError] = useState("");
  const utils = trpc.useUtils();
  const assistantMutation = trpc.smartHome.assistantMessage.useMutation();

  useEffect(() => () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  const sendMessage = (content: string) => {
    const message = content.trim();
    if (!message) return;
    if (!backendAvailable) {
      setError("O backend está indisponível; nenhuma pergunta ou comando foi enviado.");
      return;
    }

    const history = messages
      .filter(item => item.role === "user" || item.role === "assistant")
      .slice(-8)
      .map(item => ({ role: item.role as "user" | "assistant", content: item.content }));
    setError("");
    setMessages(previous => [...previous, { role: "user", content: message }]);
    assistantMutation.mutate({ message, history }, {
      onSuccess: result => {
        setMessages(previous => [...previous, { role: "assistant", content: result.reply }]);
        if (result.actionApplied) void utils.smartHome.snapshot.invalidate();
        if (readAloud && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(result.reply);
          utterance.lang = "pt-BR";
          window.speechSynthesis.speak(utterance);
        }
      },
      onError: () => setError("Não consegui obter uma resposta agora. Tente novamente; o comando não foi confirmado."),
    });
  };

  const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;

  return (
    <div className="assistant-page">
      <header className="assistant-heading">
        <div className="assistant-avatar"><Bot size={24} /></div>
        <div>
          <div className="eyebrow">CASA+ · ASSISTENTE RESIDENCIAL</div>
          <h1>Converse com a casa</h1>
          <p>Faça perguntas ou peça um ajuste de persiana/cortina no simulador.</p>
        </div>
      </header>

      <section className="assistant-wake-status" role="status" aria-live="polite">
        <span className="assistant-mic-icon"><MicOff size={20} /></span>
        <div><strong>Palavra de ativação local ainda não conectada</strong><span>Esta página não está usando o microfone. Escuta local contínua requer satélite/microfone dedicado e pipeline Home Assistant configurado.</span></div>
        <span className="assistant-state-tag">AGUARDANDO CONFIGURAÇÃO</span>
      </section>

      <section className="assistant-disclosure">
        <strong>Privacidade e demonstração</strong>
        <span>O texto enviado e o snapshot simulado são processados pelo serviço de IA do projeto e podem consumir créditos. As mensagens ficam apenas nesta tela durante a sessão. Este protótipo não captura, grava nem envia áudio do microfone; se a leitura em voz alta estiver ativa, a resposta pode ser sintetizada localmente pelo navegador/dispositivo. Comandos alteram somente estados simulados, não motores físicos.</span>
      </section>

      <div className="assistant-toolbar">
        <span className="assistant-chat-label">Conversa em português</span>
        <button className="assistant-speech-toggle" type="button" aria-pressed={readAloud} disabled={!canSpeak} onClick={() => setReadAloud(value => !value)}>
          {readAloud ? <Volume2 size={17} /> : <VolumeX size={17} />}
          {canSpeak ? (readAloud ? "Leitura de respostas ativada" : "Ler respostas em voz alta") : "Voz de saída indisponível"}
        </button>
      </div>

      {error && <div className="assistant-error" role="alert">{error}</div>}
      <AIChatBox
        className="assistant-chat"
        height="min(58vh, 520px)"
        messages={messages}
        onSendMessage={sendMessage}
        isLoading={assistantMutation.isPending}
        disabled={!backendAvailable}
        placeholder="Ex.: feche a cortina da sala"
        emptyStateMessage="Sou o CASA+. Posso conversar sobre a casa e ajustar as coberturas simuladas."
        suggestedPrompts={prompts}
      />
    </div>
  );
}
