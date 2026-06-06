import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini Client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in the environment.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", time: new Date().toISOString() });
});

// Endpoint to generate a customized Aurora Therapy Letter
app.post("/api/letter", async (req, res) => {
  try {
    const { feeling, journalText, name } = req.body;

    if (!feeling) {
      return res.status(400).json({ error: "O sentimento é obrigatório." });
    }

    // Attempt to invoke Gemini
    let letterContent = "";
    let systemInstruction = `Você é a terapeuta integrativa e mentora espiritual da marca 'Luz da Aurora', que apoia mulheres que cuidam demais de todos e acabam esquecendo de si mesmas. 
Seu tom é extremamente acolhedor, doce, maduro, profundamente empático e esperançoso.
Você se comunica em português brasileiro contemporâneo, elegante, sensível e sofisticado. Evite chavões religiosos pesados e termos místicos exagerados ou clichês banais.
Você deve responder à usuária como uma alma amiga que a vê, a entende e a conforta, lembrando-a do lema da nossa canção oficial: 'Você também merece cuidado'.`;

    try {
      const ai = getGeminiClient();
      
      const prompt = `Escreva uma carta terapêutica personalizada.
Nome da mulher: ${name || "Querida mulher"}
Sentimento relatado: ${feeling}
Pensamentos compartilhados no diário: "${journalText || "Apenas buscando um momento de silêncio e reconexão"}"

Estrutura recomendada da carta:
1. Uma saudação doce e profunda, reconhecendo o cansaço ou peso que ela carrega com tanta delicadeza.
2. Uma reflexão conectando o sentimento dela com a beleza e calma do amanhecer (a Aurora que nasce sem pressa).
3. Palavras de incentivo baseadas no refrão da nossa canção: ela não nasceu para viver se apagando enquanto ilumina outras vidas; ela também merece acolhimento, descanso, colo e oração.
4. Três pequenos rituais práticos, gentis e simples de autocuidado que ela possa fazer hoje mesmo (coisas de 5 a 10 minutos).
5. Uma mantra de poder em português curto e tocante para ela repetir no espelho.

Mantenha a carta com cerca de 250 a 350 palavras, dividida em parágrafos bonitos e espaçados.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      letterContent = response.text || "";
    } catch (geminiError: any) {
      console.error("Gemini API Error, implementing fallback letter:", geminiError);
      
      // Sophisticated elegant fallback if the API key is not yet set or encounters an issue
      letterContent = `Querida mulhers,

Sentimos o seu coração daqui. Você que carrega tanto, que cuida do mundo com tanto zelo, às vezes esquece que a sua própria luz também precisa ser alimentada. O sentimento de estar ${feeling.toLowerCase()} é um sussurro da sua alma pedindo um instante só seu.

Lembre-se do que a nossa canção diz com tanta ternura: você também merece cuidado, cura e acolhimento. Você não nasceu para viver se apagando enquanto tenta iluminar o caminho de outras vidas. O amor que você distribui com tanta generosidade também tem o direito de voltar para você.

Que tal se acolher agora com estes três passos simples?
1. **Pausa do Chá Cósmico**: Prepare uma xícara morna de chá, segure-a por 1 minuto concentrando-se apenas no calor em suas mãos antes de beber.
2. **Afirmação de Altar**: Toque seu peito, respire fundo e repita: "Eu honro quem sou e aceito o descanso."
3. **Silêncio da Aurora**: Feche os olhos por três respirações profundas ouvindo o nosso instrumental calmante.

Segure a sua mão hoje, respire com calma. A aurora nasce devagar, mas sempre nasce.

Com carinho,
**Luz da Aurora**`;
    }

    return res.json({ letter: letterContent });

  } catch (err: any) {
    console.error("Error in /api/letter endpoint:", err);
    return res.status(500).json({ error: "Erro interno ao gerar sua carta. Por favor, tente novamente." });
  }
});

// Setup Vite Dev server or production static serving
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving production files from dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Luz da Aurora server running on port ${PORT}`);
  });
}

setupServer();
