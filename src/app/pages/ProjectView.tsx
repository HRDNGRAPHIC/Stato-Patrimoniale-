import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { ArrowLeft, Plus, FileText, Calendar, Edit, Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

interface Project {
  id: string;
  name: string;
  createdAt: string;
  sessionCount: number;
}

interface Session {
  id: number;
  session_name: string;
  created_at: string;
  data: any;
}

export default function ProjectView() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const userDataStr = localStorage.getItem("userData") || sessionStorage.getItem("userData");
    if (!userDataStr) {
      navigate("/login");
      return;
    }

    // Load project
    loadProject();
    loadSessions();
  }, [projectId, navigate]);

  const loadProject = () => {
    const projectsStr = localStorage.getItem("projects");
    if (projectsStr) {
      const projects: Project[] = JSON.parse(projectsStr);
      const found = projects.find((p) => p.id === projectId);
      if (found) {
        setProject(found);
      } else {
        navigate("/dashboard");
      }
    } else {
      navigate("/dashboard");
    }
  };

  const loadSessions = async () => {
    setLoading(true);
    try {
      // Load sessions for this project
      const projectSessionsStr = localStorage.getItem(`project_${projectId}_sessions`);
      const sessionIds: number[] = projectSessionsStr ? JSON.parse(projectSessionsStr) : [];

      if (sessionIds.length === 0) {
        setSessions([]);
        setLoading(false);
        return;
      }

      // Fetch sessions from Supabase
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .in("id", sessionIds)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading sessions:", error);
        setSessions([]);
      } else {
        setSessions(data || []);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewSession = () => {
    // Navigate to exercise app with project context
    navigate(`/exercise?projectId=${projectId}&new=true`);
  };

  const handleOpenSession = (sessionId: number) => {
    navigate(`/exercise?projectId=${projectId}&sessionId=${sessionId}`);
  };

  const handleDeleteSession = async (sessionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Sei sicuro di voler eliminare questa sessione?")) return;

    try {
      // Delete from Supabase
      const { error } = await supabase.from("sessions").delete().eq("id", sessionId);

      if (error) {
        console.error("Error deleting session:", error);
        alert("Errore durante l'eliminazione della sessione");
        return;
      }

      // Remove from project sessions list
      const projectSessionsStr = localStorage.getItem(`project_${projectId}_sessions`);
      if (projectSessionsStr) {
        const sessionIds: number[] = JSON.parse(projectSessionsStr);
        const updatedIds = sessionIds.filter((id) => id !== sessionId);
        localStorage.setItem(`project_${projectId}_sessions`, JSON.stringify(updatedIds));

        // Update project session count
        const projectsStr = localStorage.getItem("projects");
        if (projectsStr) {
          const projects: Project[] = JSON.parse(projectsStr);
          const updatedProjects = projects.map((p) =>
            p.id === projectId ? { ...p, sessionCount: updatedIds.length } : p
          );
          localStorage.setItem("projects", JSON.stringify(updatedProjects));
        }
      }

      // Reload sessions
      loadSessions();
      loadProject();
    } catch (err) {
      console.error("Error:", err);
      alert("Errore durante l'eliminazione");
    }
  };

  if (!project) return null;

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b bg-[#1e293b]/90 border-slate-700 backdrop-blur-md">
        <div className="max-w-[2560px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/dashboard")}
              className="text-slate-400 hover:text-white hover:bg-slate-700"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <div className="h-6 w-px bg-slate-700"></div>
            <div>
              <h1 className="text-lg font-semibold text-white">{project.name}</h1>
            </div>
          </div>
          <div className="text-slate-400 text-sm">
            {sessions.length} {sessions.length === 1 ? "sessione" : "sessioni"}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Actions Bar */}
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-3xl font-bold text-white">Sessioni</h2>
          <Button onClick={handleNewSession} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Nuova Sessione
          </Button>
        </div>

        {/* Sessions List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Caricamento...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-[#1e293b] rounded-lg border border-slate-700 p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <p className="text-slate-400 mb-4">
              Non ci sono ancora sessioni in questo progetto
            </p>
            <Button onClick={handleNewSession} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Crea la prima sessione
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-[#1e293b] rounded-lg border border-slate-700 hover:border-slate-600 cursor-pointer transition-all p-6"
                onClick={() => handleOpenSession(session.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-blue-400" />
                      <h3 className="text-lg font-semibold text-white">
                        {session.session_name || `Sessione ${session.id}`}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Calendar className="h-4 w-4" />
                      {new Date(session.created_at).toLocaleString("it-IT")}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenSession(session.id);
                      }}
                      className="border-slate-600 hover:bg-slate-700"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Apri
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      className="text-slate-400 hover:text-red-400 hover:bg-slate-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
