// Tempo relativo curto em pt-BR ("há 20 min", "há 3 h", "há 2 dias").
// Feito à mão porque o Intl.RelativeTimeFormat curto põe ponto em "min." e troca números por "ontem".
export function relativeTime(date: Date, now: Date = new Date()): string {
  const minutes = Math.floor((now.getTime() - date.getTime()) / 60_000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "há 1 dia" : `há ${days} dias`;
}
