import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { LogOut, Plus, FolderOpen, Edit, Trash2, Upload, Clock, FileText } from "lucide-react";
import { saveSession, countUserSessions } from "../../lib/supabaseClient";

interface UserData {
  nome: string;
  cognome: string;
  genere: "M" | "F";
  stayLoggedIn: boolean;
}

interface Project {
  id: string;
  name: string;
  createdAt: string;
  sessionCount: number;
  sessionId?: number;
  lastAccessed?: string;
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showLoadMenu, setShowLoadMenu] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [renameProjectId, setRenameProjectId] = useState<string | null>(null);
  const [renameProjectName, setRenameProjectName] = useState("");
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);

  useEffect(() => {
    // Check if user is logged in
    const userDataStr = localStorage.getItem("userData") || sessionStorage.getItem("userData");
    if (!userDataStr) {
      navigate("/");
      return;
    }

    const parsed: UserData = JSON.parse(userDataStr);
    setUserData(parsed);

    // Load projects from localStorage
    loadProjects();
  }, [navigate]);

  const loadProjects = () => {
    const projectsStr = localStorage.getItem("projects");
    if (projectsStr) {
      const parsed: Project[] = JSON.parse(projectsStr);
      // Sort by lastAccessed
      const sorted = parsed.sort((a, b) => {
        const dateA = a.lastAccessed ? new Date(a.lastAccessed).getTime() : 0;
        const dateB = b.lastAccessed ? new Date(b.lastAccessed).getTime() : 0;
        return dateB - dateA;
      });
      setProjects(sorted);
      setRecentProjects(sorted.slice(0, 3));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userData");
    sessionStorage.removeItem("userData");
    navigate("/");
  };

  const handleCreateProject = () => {
    if (!newProjectName.trim()) {
      alert("Inserisci un nome per il progetto");
      return;
    }

    const newProject: Project = {
      id: `proj_${Date.now()}`,
      name: newProjectName.trim(),
      createdAt: new Date().toISOString(),
      sessionCount: 0,
      lastAccessed: new Date().toISOString(),
    };

    const updatedProjects = [...projects, newProject];
    localStorage.setItem("projects", JSON.stringify(updatedProjects));
    setProjects(updatedProjects);
    setNewProjectName("");
    setShowNewProjectDialog(false);

    // Open new session immediately
    navigate(`/exercise?projectId=${newProject.id}&new=true`);
  };

  const handleOpenProject = (projectId: string) => {
    // Update lastAccessed
    const updatedProjects = projects.map((p) =>
      p.id === projectId ? { ...p, lastAccessed: new Date().toISOString() } : p
    );
    localStorage.setItem("projects", JSON.stringify(updatedProjects));

    const project = projects.find((p) => p.id === projectId);
    if (project && project.sessionId) {
      // Load existing session
      navigate(`/exercise?projectId=${projectId}&sessionId=${project.sessionId}`);
    } else {
      // Create new session
      navigate(`/exercise?projectId=${projectId}&new=true`);
    }
  };

  const handleRenameProject = () => {
    if (!renameProjectName.trim() || !renameProjectId) return;

    const updatedProjects = projects.map((p) =>
      p.id === renameProjectId ? { ...p, name: renameProjectName.trim() } : p
    );
    localStorage.setItem("projects", JSON.stringify(updatedProjects));
    setProjects(updatedProjects);
    setShowRenameDialog(false);
    setRenameProjectId(null);
    setRenameProjectName("");
  };

  const handleDeleteProject = (projectId: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo progetto?")) return;

    const updatedProjects = projects.filter((p) => p.id !== projectId);
    localStorage.setItem("projects", JSON.stringify(updatedProjects));
    
    // Remove project sessions
    localStorage.removeItem(`project_${projectId}_sessions`);
    
    setProjects(updatedProjects);
    loadProjects(); // Reload to update recent projects
  };

  const handleSaveToAdmin = async (projectId: string) => {
    if (!userData) return;

    // Get current session data from exercise (localStorage)
    const savedStateStr = localStorage.getItem("hrdn_appState");
    if (!savedStateStr) {
      alert("Nessun dato sessione trovato. Apri prima il progetto e salva i dati.");
      return;
    }

    const sessionData = JSON.parse(savedStateStr);

    // Count existing sessions for this user to auto-increment
    const existingCount = await getExistingSessionCount(userData.nome, userData.cognome);
    const sessionName = `Sessione ${userData.nome} esercizio ${existingCount + 1}`;

    // Save to admin database
    const result = await saveSession(
      userData.nome,
      userData.cognome,
      sessionData,
      undefined,
      sessionName
    );

    if (result.success) {
      alert(`Sessione salvata come: ${sessionName}`);
    } else {
      alert("Errore nel salvataggio verso Admin");
    }
  };

  const getExistingSessionCount = async (nome: string, cognome: string): Promise<number> => {
    const result = await countUserSessions(nome, cognome);
    return result.count;
  };

  const openRenameDialog = (projectId: string, currentName: string) => {
    setRenameProjectId(projectId);
    setRenameProjectName(currentName);
    setShowRenameDialog(true);
  };

  if (!userData) return null;

  const welcomeMessage = userData.genere === "F" ? "Benvenuta" : "Benvenuto";
  const totalProjects = projects.length;
  const totalSessions = projects.reduce((sum, p) => sum + p.sessionCount, 0);

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Navbar - Minimal */}
      <nav className="sticky top-0 z-50 w-full border-b bg-[#1e293b]/90 border-slate-700 backdrop-blur-md">
        <div className="max-w-[2560px] mx-auto px-6 py-4 flex items-center justify-between">
          <span className="btn-shine">hrdn design</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout} 
            className="border-slate-600 hover:bg-slate-700 text-slate-300"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Esci
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Welcome Section - OUTSIDE NAVBAR */}
        <div className="text-center mb-12">
          <h1 
            className="text-white mb-2" 
            style={{ 
              fontFamily: "'Montserrat', sans-serif", 
              fontWeight: 500,
              fontSize: 'clamp(32px, 5vw, 56px)',
              letterSpacing: '-0.02em'
            }}
          >
            {welcomeMessage}, <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{userData.nome}</span>
          </h1>
          <p className="text-slate-400 text-lg">Gestisci i tuoi progetti e sessioni di analisi finanziaria</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="bg-[#1e293b]/50 border border-slate-700 rounded-lg p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <FolderOpen className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Progetti Totali</p>
                <p className="text-white text-2xl font-bold">{totalProjects}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-[#1e293b]/50 border border-slate-700 rounded-lg p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <FileText className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Sessioni Salvate</p>
                <p className="text-white text-2xl font-bold">{totalSessions}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-[#1e293b]/50 border border-slate-700 rounded-lg p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/20 rounded-lg">
                <Clock className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Ultimi Accessi</p>
                <p className="text-white text-2xl font-bold">{recentProjects.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Action Buttons - ROW on desktop, COLUMN on mobile */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-12">
          <button 
            onClick={() => setShowNewProjectDialog(true)}
            className="dashboard-button primary w-full md:w-auto"
          >
            <Plus />
            <span>Crea Progetto</span>
          </button>

          <button 
            onClick={() => setShowLoadMenu(!showLoadMenu)}
            className="dashboard-button secondary w-full md:w-auto"
          >
            <FolderOpen />
            <span>Carica Progetto</span>
          </button>
        </div>

        {/* Load Project Menu - Animated */}
        {showLoadMenu && (
          <div className="project-menu-enter">
            <h3 
              className="text-2xl font-semibold text-white mb-6" 
              style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 500 }}
            >
              I Tuoi Progetti
            </h3>
            {projects.length === 0 ? (
              <div className="bg-[#1e293b]/50 border border-slate-700 rounded-lg p-12 text-center backdrop-blur-sm">
                <FolderOpen className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                <p className="text-slate-400">Nessun progetto salvato</p>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="project-card bg-[#1e293b]/80 border border-slate-700 rounded-lg p-6 backdrop-blur-sm"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <FolderOpen className="w-5 h-5 text-blue-400" />
                          <h4 className="text-lg font-semibold text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                            {project.name}
                          </h4>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Creato: {new Date(project.createdAt).toLocaleDateString("it-IT")}
                          </span>
                          {project.lastAccessed && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Ultimo accesso: {new Date(project.lastAccessed).toLocaleDateString("it-IT")}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            {project.sessionCount} sessioni
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleOpenProject(project.id)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Apri
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openRenameDialog(project.id, project.name)}
                          className="border-slate-600 hover:bg-slate-700"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Rinomina
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSaveToAdmin(project.id)}
                          className="border-emerald-600 text-emerald-400 hover:bg-emerald-900/20"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Salva verso Admin
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteProject(project.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
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
        )}

        {/* Recent Projects Section */}
        {!showLoadMenu && recentProjects.length > 0 && (
          <div className="mt-12">
            <h3 
              className="text-2xl font-semibold text-white mb-6" 
              style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 500 }}
            >
              Progetti Recenti
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => handleOpenProject(project.id)}
                  className="project-card bg-[#1e293b]/80 border border-slate-700 rounded-lg p-6 cursor-pointer backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <FolderOpen className="w-5 h-5 text-blue-400" />
                    <h4 className="text-white font-semibold truncate" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                      {project.name}
                    </h4>
                  </div>
                  <p className="text-sm text-slate-400">
                    {project.sessionCount} {project.sessionCount === 1 ? 'sessione' : 'sessioni'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* New Project Dialog */}
      <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
        <DialogContent className="bg-[#1e293b] border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>Nuovo Progetto</DialogTitle>
            <DialogDescription className="text-slate-400">
              Inserisci un nome per il nuovo progetto
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="project-name" className="text-slate-300">Nome Progetto</Label>
              <Input
                id="project-name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
                placeholder="Es: Analisi Bilancio 2025"
                className="mt-1 bg-[#0f172a] border-slate-600 text-white placeholder:text-slate-500"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewProjectDialog(false)} className="border-slate-600 hover:bg-slate-700">
              Annulla
            </Button>
            <Button onClick={handleCreateProject} className="bg-blue-600 hover:bg-blue-700">Crea</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Project Dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent className="bg-[#1e293b] border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>Rinomina Progetto</DialogTitle>
            <DialogDescription className="text-slate-400">
              Inserisci il nuovo nome del progetto
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="rename-project-name" className="text-slate-300">Nome Progetto</Label>
              <Input
                id="rename-project-name"
                value={renameProjectName}
                onChange={(e) => setRenameProjectName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRenameProject()}
                className="mt-1 bg-[#0f172a] border-slate-600 text-white placeholder:text-slate-500"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenameDialog(false)} className="border-slate-600 hover:bg-slate-700">
              Annulla
            </Button>
            <Button onClick={handleRenameProject} className="bg-blue-600 hover:bg-blue-700">Rinomina</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
