import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { BookOpen, LineChart, Calculator, LogIn } from "lucide-react";

interface UserData {
  nome: string;
  cognome: string;
  genere: "M" | "F";
  stayLoggedIn: boolean;
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [genere, setGenere] = useState<"M" | "F">("M");

  // Check if already logged in
  useEffect(() => {
    const userDataStr = localStorage.getItem("userData") || sessionStorage.getItem("userData");
    if (userDataStr) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLogin = () => {
    if (!nome.trim() || !cognome.trim()) {
      alert("Inserisci nome e cognome");
      return;
    }

    const userData: UserData = {
      nome: nome.trim(),
      cognome: cognome.trim(),
      genere,
      stayLoggedIn: true, // Always persist in localStorage
    };

    localStorage.setItem("userData", JSON.stringify(userData));
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b bg-[#1e293b]/90 border-slate-700 backdrop-blur-md">
        <div className="max-w-[2560px] mx-auto px-6 h-14 flex items-center justify-between">
          <span className="btn-shine">hrdn design</span>
          <Button 
            onClick={() => setShowLoginDialog(true)} 
            variant="outline"
            size="sm"
            className="border-slate-600 hover:bg-slate-700"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Accedi
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-5xl font-bold mb-4 text-white">
            Analisi Economico-Finanziaria
          </h1>
          <p className="text-xl text-slate-400">
            Strumento didattico per l'analisi di bilancio e calcolo indici finanziari
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-20 max-w-6xl mx-auto">
          <div className="bg-[#1e293b] p-6 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
            <BookOpen className="w-10 h-10 mb-4 text-blue-400" />
            <h3 className="text-lg font-semibold mb-2 text-white">Analisi di Bilancio</h3>
            <p className="text-slate-400 text-sm">
              Riclassifica Stato Patrimoniale (finanziario) e Conto Economico (valore aggiunto)
            </p>
          </div>

          <div className="bg-[#1e293b] p-6 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
            <LineChart className="w-10 h-10 mb-4 text-green-400" />
            <h3 className="text-lg font-semibold mb-2 text-white">Indici Finanziari</h3>
            <p className="text-slate-400 text-sm">
              Calcolo automatico di margini, indici di liquidità, solidità e redditività
            </p>
          </div>

          <div className="bg-[#1e293b] p-6 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
            <Calculator className="w-10 h-10 mb-4 text-purple-400" />
            <h3 className="text-lg font-semibold mb-2 text-white">Formule Didattiche</h3>
            <p className="text-slate-400 text-sm">
              Visualizzazione interattiva delle formule con spiegazioni passo-passo
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button 
            onClick={() => setShowLoginDialog(true)} 
            size="lg"
            className="text-base px-8 py-6 bg-blue-600 hover:bg-blue-700"
          >
            Inizia Ora
          </Button>
        </div>
      </div>

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="bg-[#1e293b] border-slate-700 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl">Accesso</DialogTitle>
            <DialogDescription className="text-slate-400">
              Inserisci i tuoi dati per accedere alla dashboard
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="nome" className="text-slate-300">Nome</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Mario"
                className="mt-1 bg-[#0f172a] border-slate-600 text-white placeholder:text-slate-500"
                autoFocus
              />
            </div>

            <div>
              <Label htmlFor="cognome" className="text-slate-300">Cognome</Label>
              <Input
                id="cognome"
                value={cognome}
                onChange={(e) => setCognome(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Rossi"
                className="mt-1 bg-[#0f172a] border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>

            <div>
              <Label className="text-slate-300">Sesso</Label>
              <div className="flex gap-6 mt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="radio"
                    name="genere"
                    checked={genere === "M"}
                    onChange={() => setGenere("M")}
                    className="w-4 h-4 text-blue-500"
                  />
                  <span>M</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="radio"
                    name="genere"
                    checked={genere === "F"}
                    onChange={() => setGenere("F")}
                    className="w-4 h-4 text-blue-500"
                  />
                  <span>F</span>
                </label>
              </div>
            </div>

            <Button 
              onClick={handleLogin} 
              className="w-full bg-blue-600 hover:bg-blue-700 mt-4" 
              size="lg"
            >
              Accedi alla Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
