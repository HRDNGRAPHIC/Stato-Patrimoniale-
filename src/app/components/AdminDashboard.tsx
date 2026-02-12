import { useState, useEffect } from "react";
import { Download, Trash2, User, Calendar, Clock, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

export interface SavedSession {
  id: string;
  userName: { nome: string; cognome: string };
  savedAt: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

interface AdminDashboardProps {
  darkMode: boolean;
  onLoadSession?: (data: any, user?: { nome: string; cognome: string }) => void;
}

export default function AdminDashboard({ darkMode, onLoadSession }: AdminDashboardProps) {
  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Load sessions from localStorage (poll every 2s for real-time updates)
  const loadSessions = () => {
    try {
      const raw = localStorage.getItem("hrdn_sessions");
      if (raw) {
        const parsed: SavedSession[] = JSON.parse(raw);
        // Sort newest first
        parsed.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
        setSessions(parsed);
      } else {
        setSessions([]);
      }
    } catch {
      setSessions([]);
    }
  };

  useEffect(() => {
    loadSessions();
    const interval = setInterval(loadSessions, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleDownload = (session: SavedSession) => {
    const blob = new Blob([JSON.stringify(session, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sessione_${session.userName.nome}_${session.userName.cognome}_${new Date(session.savedAt).toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDelete = (id: string) => {
    const updated = sessions.filter((s) => s.id !== id);
    localStorage.setItem("hrdn_sessions", JSON.stringify(updated));
    setSessions(updated);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 max-[617px]:p-3">
      {/* Header */}
      <div className="mb-8 max-[617px]:mb-5">
        <h1 className={`text-2xl max-[617px]:text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
          Sessioni Salvate
        </h1>
        <p className={`text-sm mt-1 ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
          {sessions.length === 0
            ? "Nessuna sessione salvata al momento"
            : `${sessions.length} session${sessions.length === 1 ? "e" : "i"} salvat${sessions.length === 1 ? "a" : "e"}`}
        </p>
      </div>

      {/* Sessions List */}
      <div className="flex flex-col gap-4 max-[617px]:gap-3">
        {sessions.map((session) => {
          const isExpanded = expandedId === session.id;
          return (
            <div
              key={session.id}
              className={`rounded-xl border shadow-sm transition-all duration-200 overflow-hidden ${
                darkMode
                  ? "bg-[#1e293b] border-slate-700 hover:border-slate-500"
                  : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-md"
              }`}
            >
              {/* Card Header */}
              <div className="p-5 max-[617px]:p-3.5">
                <div className="flex items-start justify-between gap-4">
                  {/* User info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 max-[617px]:w-8 max-[617px]:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        darkMode ? "bg-violet-500/20" : "bg-violet-100"
                      }`}
                    >
                      <User className={`w-5 h-5 max-[617px]:w-4 max-[617px]:h-4 ${darkMode ? "text-violet-400" : "text-violet-600"}`} />
                    </div>
                    <div className="min-w-0">
                      <h3 className={`font-semibold text-base max-[617px]:text-sm truncate ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {session.userName.nome} {session.userName.cognome}
                      </h3>
                      <div className={`flex items-center gap-3 max-[617px]:gap-2 text-xs mt-0.5 ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(session.savedAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(session.savedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => onLoadSession?.(session.data, session.userName)}
                      className={`p-2 rounded-lg transition-colors ${
                        darkMode
                          ? "hover:bg-violet-900/30 text-slate-400 hover:text-violet-400"
                          : "hover:bg-violet-50 text-gray-500 hover:text-violet-600"
                      }`}
                      title="Carica sessione"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownload(session)}
                      className={`p-2 rounded-lg transition-colors ${
                        darkMode
                          ? "hover:bg-slate-700 text-slate-400 hover:text-blue-400"
                          : "hover:bg-gray-100 text-gray-500 hover:text-blue-600"
                      }`}
                      title="Scarica JSON"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(session.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        darkMode
                          ? "hover:bg-red-900/30 text-slate-400 hover:text-red-400"
                          : "hover:bg-red-50 text-gray-500 hover:text-red-600"
                      }`}
                      title="Elimina sessione"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : session.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        darkMode
                          ? "hover:bg-slate-700 text-slate-400"
                          : "hover:bg-gray-100 text-gray-500"
                      }`}
                      title={isExpanded ? "Comprimi" : "Espandi dettagli"}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Quick summary badges */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {session.data.exerciseText && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? "bg-amber-500/15 text-amber-400" : "bg-amber-100 text-amber-700"}`}>
                      Testo esercizio
                    </span>
                  )}
                  {session.data.companyType && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? "bg-blue-500/15 text-blue-400" : "bg-blue-100 text-blue-700"}`}>
                      {session.data.companyType === "industrial" ? "Industriale" : "Mercantile"}
                    </span>
                  )}
                  {Object.keys(session.data.attivoValuesN as Record<string, number> ?? {}).length > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? "bg-emerald-500/15 text-emerald-400" : "bg-emerald-100 text-emerald-700"}`}>
                      Attivo compilato
                    </span>
                  )}
                  {Object.keys(session.data.passivoValuesN as Record<string, number> ?? {}).length > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? "bg-purple-500/15 text-purple-400" : "bg-purple-100 text-purple-700"}`}>
                      Passivo compilato
                    </span>
                  )}
                  {Object.keys(session.data.ceValuesN as Record<string, number> ?? {}).length > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? "bg-orange-500/15 text-orange-400" : "bg-orange-100 text-orange-700"}`}>
                      Conto Economico
                    </span>
                  )}
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className={`border-t px-5 py-4 max-[617px]:px-3.5 max-[617px]:py-3 ${darkMode ? "border-slate-700 bg-[#0f172a]/50" : "border-gray-100 bg-gray-50/50"}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Colonna 1: Dati generali e testo */}
                    <div>
                      <div className="mb-2">
                        <div className={`text-xs font-semibold mb-1 ${darkMode ? "text-slate-400" : "text-gray-500"}`}>Utente</div>
                        <div className={`text-base font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{session.userName.nome} {session.userName.cognome}</div>
                        <div className={`text-xs ${darkMode ? "text-slate-400" : "text-gray-500"}`}>{formatDate(session.savedAt)} {formatTime(session.savedAt)}</div>
                      </div>
                      <div className="mb-2">
                        <div className={`text-xs font-semibold mb-1 ${darkMode ? "text-slate-400" : "text-gray-500"}`}>Tipo azienda</div>
                        <div className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${darkMode ? (session.data.companyType === "industrial" ? "bg-blue-500/15 text-blue-400" : "bg-green-500/15 text-green-400") : (session.data.companyType === "industrial" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700")}`}>{session.data.companyType === "industrial" ? "Industriale" : "Mercantile"}</div>
                      </div>
                      {session.data.exerciseText && (
                        <div className="mb-2">
                          <div className={`text-xs font-semibold mb-1 ${darkMode ? "text-slate-400" : "text-gray-500"}`}>Testo esercizio</div>
                          <div className={`text-sm whitespace-pre-line ${darkMode ? "text-slate-300" : "text-gray-700"}`}>{session.data.exerciseText}</div>
                        </div>
                      )}
                    </div>
                    {/* Colonna 2: Struttura e riepilogo valori */}
                    <div>
                      <div className="mb-2">
                        <div className={`text-xs font-semibold mb-1 ${darkMode ? "text-slate-400" : "text-gray-500"}`}>Struttura finanziaria (%)</div>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-block text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">Immobilizzazioni: <b>{session.data.customStructure?.immobilizzazioni ?? 0}%</b></span>
                          <span className="inline-block text-xs px-2 py-0.5 rounded bg-sky-100 text-sky-700 dark:bg-green-500/15 dark:text-green-400">Attivo Circolante: <b>{session.data.customStructure?.attivoCircolante ?? 0}%</b></span>
                          <span className="inline-block text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400">Patrimonio Netto: <b>{session.data.customStructure?.patrimonioNetto ?? 0}%</b></span>
                          <span className="inline-block text-xs px-2 py-0.5 rounded bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/15 dark:text-fuchsia-400">Debiti M/L Termine: <b>{session.data.customStructure?.debitiMLT ?? 0}%</b></span>
                          <span className="inline-block text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">Debiti Breve: <b>{session.data.customStructure?.debitiBreve ?? 0}%</b></span>
                        </div>
                      </div>
                      <div className="mb-2">
                        <div className={`text-xs font-semibold mb-1 ${darkMode ? "text-slate-400" : "text-gray-500"}`}>Totali inseriti</div>
                        <div className="flex flex-col gap-1 text-xs">
                          <span className="inline-block">Totale Attivo: <b>{Object.values(session.data.attivoValuesN ?? {}).reduce((a: number, b: number) => a + b, 0).toLocaleString("it-IT")}</b></span>
                          <span className="inline-block">Totale Passivo: <b>{Object.values(session.data.passivoValuesN ?? {}).reduce((a: number, b: number) => a + b, 0).toLocaleString("it-IT")}</b></span>
                          <span className="inline-block">Totale Conto Economico: <b>{Object.values(session.data.ceValuesN ?? {}).reduce((a: number, b: number) => a + b, 0).toLocaleString("it-IT")}</b></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Empty state */}
        {sessions.length === 0 && (
          <div className={`text-center py-16 rounded-xl border-2 border-dashed ${darkMode ? "border-slate-700 text-slate-500" : "border-gray-300 text-gray-400"}`}>
            <User className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-lg font-medium mb-1">Nessuna sessione</p>
            <p className="text-sm">Le sessioni salvate dagli utenti appariranno qui</p>
          </div>
        )}
      </div>
    </div>
  );
}
