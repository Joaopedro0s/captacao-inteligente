import { describe, expect, it } from "vitest";
import { maskEmail, maskPhone } from "@/lib/mask";
import { clientIp, evaluateLimits, hashIp, startOfUtcDay } from "@/lib/rate-limit";

const limits = { perHour: 5, perDay: 50 };
const now = new Date("2026-11-16T21:30:00Z");

describe("evaluateLimits", () => {
  it("libera abaixo dos limites", () => {
    expect(evaluateLimits({ ipLastHour: 4, globalToday: 49 }, limits, now)).toEqual({ ok: true });
  });

  it("bloqueia o 6º pedido do mesmo IP na hora", () => {
    const d = evaluateLimits({ ipLastHour: 5, globalToday: 10 }, limits, now);
    expect(d).toMatchObject({ ok: false, reason: "ip", retryAfterSec: 3600 });
  });

  it("bloqueia ao atingir a cota diária global, antes de olhar o IP", () => {
    const d = evaluateLimits({ ipLastHour: 0, globalToday: 50 }, limits, now);
    expect(d).toMatchObject({ ok: false, reason: "global" });
  });

  it("calcula o Retry-After até a meia-noite UTC", () => {
    const d = evaluateLimits({ ipLastHour: 0, globalToday: 50 }, limits, now);
    expect(d.ok === false && d.retryAfterSec).toBe(2.5 * 3600);
  });

  it("início do dia é em UTC", () => {
    expect(startOfUtcDay(now).toISOString()).toBe("2026-11-16T00:00:00.000Z");
  });
});

describe("identificação do cliente", () => {
  it("usa o primeiro IP de x-forwarded-for", () => {
    expect(clientIp(new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" }))).toBe("203.0.113.7");
  });

  it("não guarda o IP puro: hash depende do salt", () => {
    const a = hashIp("203.0.113.7", "salt-a");
    expect(a).toMatch(/^[a-f0-9]{64}$/);
    expect(a).not.toContain("203.0.113.7");
    expect(hashIp("203.0.113.7", "salt-a")).toBe(a);
    expect(hashIp("203.0.113.7", "salt-b")).not.toBe(a);
  });
});

describe("máscaras do painel público", () => {
  it("mascara e-mail e telefone", () => {
    expect(maskEmail("marina.toledo@gmail.com.br")).toBe("m***@g***.com.br");
    expect(maskPhone("(11) 98765-4321")).toBe("(**) *****-**21");
  });
});
