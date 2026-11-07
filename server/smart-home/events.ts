import type { Express } from "express";
import { simulationProvider } from "./simulation-provider";

/** SSE is a notification channel only; the database snapshot remains authoritative. */
export function registerSmartHomeEventsRoute(app: Express) {
  app.get("/api/smart-home/events", async (_req, res) => {
    let revision: number;
    try {
      revision = await simulationProvider.readRevision();
    } catch {
      res.status(503).json({ error: "O stream de sincronização está indisponível." });
      return;
    }

    res.status(200).set({
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });
    res.flushHeaders();

    let lastRevision = revision;
    let lastHeartbeat = Date.now();
    let polling = false;
    let closed = false;
    let databaseAvailable = true;

    const sendBackendStatus = (available: boolean) => {
      if (closed) return;
      res.write(`event: backend-status\ndata: ${JSON.stringify({ available })}\n\n`);
      lastHeartbeat = Date.now();
    };

    const sendRevision = (nextRevision: number) => {
      if (closed) return;
      res.write(`id: ${nextRevision}\ndata: ${JSON.stringify({ revision: nextRevision })}\n\n`);
      lastRevision = nextRevision;
      lastHeartbeat = Date.now();
    };

    // Send the current revision on every connection, including EventSource reconnects.
    sendRevision(revision);

    const poll = async () => {
      if (closed || polling) return;
      polling = true;
      try {
        const nextRevision = await simulationProvider.readRevision();
        if (closed) return;
        if (!databaseAvailable) {
          databaseAvailable = true;
          sendBackendStatus(true);
        }
        if (nextRevision !== lastRevision) sendRevision(nextRevision);
        else if (Date.now() - lastHeartbeat >= 15_000) {
          res.write(": keep-alive\n\n");
          lastHeartbeat = Date.now();
        }
      } catch {
        if (closed) return;
        if (databaseAvailable) {
          databaseAvailable = false;
          sendBackendStatus(false);
        }
      } finally {
        polling = false;
      }
    };

    const timer = setInterval(() => { void poll(); }, 1_000);
    res.on("close", () => {
      closed = true;
      clearInterval(timer);
    });
  });
}
