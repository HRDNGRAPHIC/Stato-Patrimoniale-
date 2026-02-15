import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { LogIn } from "lucide-react";

interface UserData {
  nome: string;
  cognome: string;
  genere: "M" | "F";
  stayLoggedIn: boolean;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [genere, setGenere] = useState<"M" | "F">("M");
  const [stayLoggedIn, setStayLoggedIn] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const parsed: UserData = JSON.parse(userData);
      if (parsed.stayLoggedIn) {
        navigate("/dashboard");
      }
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
      stayLoggedIn,
    };

    // Save to localStorage if "stay logged in" is checked
    if (stayLoggedIn) {
      localStorage.setItem("userData", JSON.stringify(userData));
    } else {
      // Use sessionStorage for temporary login
      sessionStorage.setItem("userData", JSON.stringify(userData));
    }

    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b bg-[#1e293b]/90 border-slate-700 backdrop-blur-md">
        <div className="max-w-[2560px] mx-auto px-6 h-14 flex items-center justify-between">
          <span className="btn-shine">hrdn design</span>
          <button
            onClick={() => navigate("/")}
            className="text-sm text-slate-400 hover:text-slate-300 transition-colors"
          >
            ← Indietro
          </button>
        </div>
      </nav>

      <div className="flex items-center justify-center p-4 mt-16">
        <div className="bg-[#1e293b] rounded-lg border border-slate-700 p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <LogIn className="w-12 h-12 mx-auto mb-4 text-blue-400" />
            <h1 className="text-2xl font-bold mb-2 text-white">Accesso</h1>
            <p className="text-slate-400 text-sm">
              Inserisci i tuoi dati per continuare
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="nome" className="text-slate-300">Nome</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Mario"
                className="mt-1 bg-[#0f172a] border-slate-600 text-white placeholder:text-slate-500"
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
              <Label className="text-slate-300">Genere</Label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="radio"
                    name="genere"
                    checked={genere === "M"}
                    onChange={() => setGenere("M")}
                    className="w-4 h-4 text-blue-500"
                  />
                  <span>Maschile</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="radio"
                    name="genere"
                    checked={genere === "F"}
                    onChange={() => setGenere("F")}
                    className="w-4 h-4 text-blue-500"
                  />
                  <span>Femminile</span>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="stay-logged-in"
                checked={stayLoggedIn}
                onCheckedChange={(checked) => setStayLoggedIn(checked as boolean)}
                className="border-slate-600"
              />
              <Label htmlFor="stay-logged-in" className="cursor-pointer text-slate-300">
                Resta connesso
              </Label>
            </div>

            <Button onClick={handleLogin} className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
              Accedi
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
