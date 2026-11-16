import { describe, expect, it } from "vitest";
import { relativeTime } from "@/lib/relative-time";
import { seedLeads } from "@/lib/seed-data";

const now = new Date("2026-11-16T12:00:00Z");
const ago = (ms: number) => new Date(now.getTime() - ms);

describe("relativeTime", () => {
  it("usa minutos, horas e dias", () => {
    expect(relativeTime(ago(30_000), now)).toBe("agora");
    expect(relativeTime(ago(20 * 60_000), now)).toBe("há 20 min");
    expect(relativeTime(ago(3 * 3_600_000 + 59 * 60_000), now)).toBe("há 3 h");
    expect(relativeTime(ago(26 * 3_600_000), now)).toBe("há 1 dia");
    expect(relativeTime(ago(72 * 3_600_000), now)).toBe("há 3 dias");
  });
});

describe("seedLeads", () => {
  it("gera horários relativos ao momento do reset, do mais recente ao mais antigo", () => {
    const before = Date.now();
    const times = seedLeads().map((l) => new Date(l.createdAt as Date).getTime());
    expect(times.map((t) => Math.round((before - t) / 60_000))).toEqual([20, 60, 180, 300]);
    expect([...times].sort((a, b) => b - a)).toEqual(times);
  });
});
