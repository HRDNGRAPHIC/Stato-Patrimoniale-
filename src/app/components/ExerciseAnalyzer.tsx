import { useState, useEffect } from "react";

interface ExerciseAnalyzerProps {
    exerciseText: string;
}

export default function ExerciseAnalyzer({ exerciseText }: ExerciseAnalyzerProps) {
    const [thinkingResult, setThinkingResult] = useState<string>("");
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Clear previous error when text changes
        setError(null);

        // Skip if text is too short
        if (exerciseText.trim().length < 10) {
            setThinkingResult("");
            return;
        }

        // Debounce timer
        const timer = setTimeout(async () => {
            await analyzeExercise();
        }, 1500);

        return () => clearTimeout(timer);
    }, [exerciseText]);

    const analyzeExercise = async () => {
        console.log("Inizio chiamata a Ollama con testo:", exerciseText);
        setIsAnalyzing(true);
        setError(null);
        setThinkingResult("");

        try {
            const systemPrompt = `Sei un assistente didattico di Economia Aziendale italiana molto rigoroso e preciso.
            Analizza SOLO il testo fornito dall'utente (multi-riga, un dato per riga).

            Regole strette di riconoscimento (ignora tutto il resto se non esatto):
            - Riconosci SOLO queste forme esatte (case-sensitive, spazi obbligatori intorno a =):
            "Roe = X,YY%" (virgola decimali max 2, no trailing zero; intero ok come 17%)
            "Roi = X,YY%"
            "Ro = valore" (no %, es. 45000 o 1.200.000 o 4.445.000 con punto migliaia)
            "Cp = valore" (punto migliaia, es. 350.000 o 4.445.000)
            "Ci = valore"
            "Vendite = valore"
            "Of = valore" (no %, es. 45000 o 1.200.000 o 4.445.000 con punto migliaia)
            "Rn = valore"
            "ROA = X,YY%"
            "Rod = X,YY%"
            "V = valore" (no %, es. 45000 o 1.200.000 o 4.445.000 con punto migliaia)
            "Leverage = valore"   // o "Leverage = valore" se l'utente lo scrive così
            - Prima di riconoscere un valore numerico, normalizzalo: rimuovi TUTTI i punti migliaia (4.445.000 → 4445000) per validarlo come numero intero.
            - Un dato per riga. Ignora sinonimi, spazi extra, €, maiusc/min diverse, formattazioni sbagliate.

            Regola di utilità didattica (obbligatoria):
            - Suggerisci una formula SOLO se la grandezza calcolata NON è già presente come dato inserito dall'utente.
            Esempio: se c'è "Rn = 450.486" → NON suggerire formule che producono Rn.
            Se c'è "Cp = 5.350.200" → NON suggerire formule che producono Cp.
            - Priorità: suggerisci formule che aiutano a ricavare grandezze mancanti dall'esercizio. //IMPORTANTE
            - Se non resta nessuna formula utile → scrivi "Nessuna formula utile aggiuntiva (hai già i principali risultati o controlla i dati inseriti)".

            // BLACKLIST – FORMULE VIETATE (NON SCRIVERLE MAI, NEANCHE SE SEMBRANO CORRETTE O EQUIVALENTI)
            - Vietate tutte le seguenti formule e qualsiasi loro variante, anche algebricamente equivalente:
            - Cp = Ro / Roi × 100
            - Ci = Ro / (Roi / 100)
            - Ro = Ri / Ci × 100
            - Ci = Ro / Roi × 100
            - Qualsiasi formula che usi "Ri" invece di "Roi"
            - Qualsiasi inversione o riformulazione non elencata parola per parola nei blocchi sotto
            - Se il modello è tentato di suggerire qualcosa di simile → non stampare nessuna formula per quella grandezza invece di inventarne una.


            Formule da suggerire in forma estesa/testuale (usa esattamente queste descrizioni, acronimi con prima lettera maiuscola):
            - Ci = Ro x 100 / Roi
            - Ci = attivo fisso + attivo circolante   (da Stato Patrimoniale: immobilizzazioni + attivo circolante)
            - Ci = Cp + debiti   (forma classica: mezzi propri + capitale di terzi)
            - Cp = capitale sociale + riserve + utile d'esercizio
            - Cp = Ci - debiti 
            - Ro = valore della produzione - costi della produzione
            - Ro = Roi × Ci / 100
            - Ro = v × ROS / 100
            - Rai = Ro - Of + proventi finanziari
            - Rn = Rai - imposte
            - Roe = Rn / Cp x 100 
            - Roi = Ro / Ci x 100 
            - Rod = Of / Debiti x 100 
            - Leverage = Ci / Cp   
            - ROS = Ro / v × 100
            - Debiti = Ci − Cp
            - Of = Debiti × ROD / 100

            Formule inverse/salvezza quando mancano dati (suggeriscile SOLO se i dati di input ci sono e l'output manca):
            - Ro = Roi × Ci / 100
            - Rn = Roe × Cp / 100
            - Ci = ricavi di vendita / tasso di rotazione del capitale
            - Cp = Rn x 100 / Roe
            - Leverage = Ci / Cp   // con nota: se 1 → no debiti; >2 → alto indebitamento
            - Cp = Ci / Leverage
            - Ci = Cp × Leverage
            - Debiti = Ci - Cp
            - Debiti = Of × 100 / ROD
            - Roe = Rn × 100 / Cp
            - Debiti = Ci - Cp
            - Ci = Ro × 100 / Roi
            

            VIETATO ASSOLUTAMENTE suggerire qualsiasi formula, inversa, definizione, calcolo o variante che NON sia elencata ESATTAMENTE parola per parola in uno dei due blocchi sopra.
            Non inventare nulla, non ricostruire equivalenti algebrici (es. proibito Ci = Ro / (Roi / 100), Ro = Ri / Ci × 100 o qualsiasi altra forma non scritta letteralmente qui).
            Se non è scritto identico → NON SCRIVERLA MAI, neanche se è corretta matematicamente.

            Output OBBLIGATORIO: testo piano puro, senza markdown, senza multi-backtick, senza tag.
            - Dati riconosciuti: '• Dato: ' + valore ORIGINALE (es. • Dato: Roe = 8,42%)
            - Formule: '→ Formula: ' + descrizione estesa (es. → Formula: Roe = Rn / Cp x 100 )
            - Se niente o nessuna utile: la frase appropriata.
            Rispondi in italiano, breve, una riga per dato/formula. Niente spiegazioni extra a meno che non richiesto.`;

            const response = await fetch("http://localhost:11434/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "phi4-mini:latest",
                    messages: [
                        {
                            role: "system",
                            content: systemPrompt,
                        },
                        {
                            role: "user",
                            content: exerciseText,
                        },
                    ],
                    temperature: 0.1,
                    max_tokens:  300,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            // Extract the assistant's response
            const assistantMessage = data.choices?.[0]?.message?.content || "";

            if (assistantMessage) {
                setThinkingResult(assistantMessage);
            } else {
                setError("Nessuna risposta ricevuta da Ollama");
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            if (errorMsg.includes("Failed to fetch") || errorMsg.includes("ERR_")) {
                setError("Avvia ollama serve: ollama serve (porta 11434)");
            } else {
                setError(`Errore: ${errorMsg}`);
            }
            setThinkingResult("");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const renderResult = () => {
        if (isAnalyzing) {
            return <p className="text-blue-600 font-medium">Analisi in corso...</p>;
        }

        if (error) {
            return <p className="text-red-600 font-medium">{error}</p>;
        }

        if (!thinkingResult) {
            return (
                <p className="text-gray-500 italic">
                    Inserisci testo dell'esercizio con dati riconoscibili...
                </p>
            );
        }

        // Split result into lines and apply styling based on prefixes
        const lines = thinkingResult.split("\n").filter((line) => line.trim());

        return (
            <div className="space-y-1">
                {lines.map((line, idx) => {
                    const trimmedLine = line.trim();

                    // Check if line starts with "• Dato: " prefix
                    if (trimmedLine.startsWith("• Dato:")) {
                        return (
                            <p key={idx} className="text-green-700 font-medium">
                                {trimmedLine}
                            </p>
                        );
                    }

                    // Check if line starts with "→ Formula: " prefix
                    if (trimmedLine.startsWith("→ Formula:")) {
                        return (
                            <p key={idx} className="text-blue-700">
                                {trimmedLine}
                            </p>
                        );
                    }

                    // Check if line contains "Nessun dato" (no data found)
                    if (trimmedLine.includes("Nessun dato")) {
                        return (
                            <p key={idx} className="text-gray-700">
                                {trimmedLine}
                            </p>
                        );
                    }

                    // Default: normal text
                    return (
                        <p key={idx} className="text-gray-700">
                            {trimmedLine}
                        </p>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="mt-6 bg-gray-50 rounded-xl shadow-lg p-6 border border-gray-200 min-h-[150px]">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
                Ragionamento & Formule suggerite
            </h3>
            {renderResult()}
        </div>
    );
}
