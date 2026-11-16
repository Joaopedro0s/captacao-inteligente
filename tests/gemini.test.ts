import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { classifyLead } from "@/lib/ai";

const lead = {
  name: "Ana Souza",
  phone: "(11) 90000-0101",
  email: "ana@example.com",
  service: "Polimento técnico" as const,
  message: "Quero polir o carro antes da viagem.",
  consent: true as const,
};

const geminiText = (text: string, status = 200) =>
  new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] }), { status });

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubEnv("GEMINI_API_KEY", "chave-de-teste");
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("classifyLead com Gemini", () => {
  it("envia o pedido como dado e lê a classificação estruturada", async () => {
    fetchMock.mockResolvedValueOnce(geminiText('{"temperatura":"quente","justificativa":"Quer agendar."}'));

    await expect(classifyLead(lead)).resolves.toEqual({ temperature: "QUENTE", reason: "Quer agendar." });

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain(":generateContent");
    expect((init?.headers as Record<string, string>)["x-goog-api-key"]).toBe("chave-de-teste");
    const body = JSON.parse(String(init?.body));
    expect(body.contents[0].parts[0].text).toMatch(/^<pedido>/);
    expect(body.generationConfig.responseMimeType).toBe("application/json");
    expect(body.generationConfig.responseJsonSchema).not.toHaveProperty("$schema");
  });

  it("tenta de novo em erro 503 e segue com a resposta seguinte", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response("{}", { status: 503 }))
      .mockResolvedValueOnce(geminiText('{"temperatura":"frio","justificativa":"Só curiosidade."}'));

    await expect(classifyLead(lead)).resolves.toMatchObject({ temperature: "FRIO" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("não tenta de novo em erro 400 (ex.: chave inválida)", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: { message: "API key not valid" } }), { status: 400 }),
    );

    await expect(classifyLead(lead)).rejects.toThrow("Gemini 400: API key not valid");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("devolve null após duas respostas com JSON inválido", async () => {
    fetchMock.mockResolvedValueOnce(geminiText("não sei")).mockResolvedValueOnce(geminiText("{}"));

    await expect(classifyLead(lead)).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("falha sem chamar a API quando falta a chave", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    await expect(classifyLead(lead)).rejects.toThrow("GEMINI_API_KEY não configurada");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
