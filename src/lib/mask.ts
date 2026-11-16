// O painel é público: nome, e-mail, telefone e mensagem saem sempre reduzidos, mesmo que alguém digite dados reais.
export function maskEmail(email: string) {
  const [user = "", domain = ""] = email.split("@");
  const [host = "", ...rest] = domain.split(".");
  const tld = rest.length ? `.${rest.join(".")}` : "";
  return `${user.slice(0, 1)}***@${host.slice(0, 1)}***${tld}`;
}

export function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 4 ? `(**) *****-**${digits.slice(-2)}` : "***";
}

const capitalize = (word: string) => word.charAt(0).toLocaleUpperCase("pt-BR") + word.slice(1).toLocaleLowerCase("pt-BR");

/** "joão pedro silva" -> "João S." (primeiro nome + inicial do último sobrenome). */
export function maskName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Anônimo";
  const first = capitalize(parts[0]);
  return parts.length === 1 ? first : `${first} ${parts.at(-1)!.charAt(0).toLocaleUpperCase("pt-BR")}.`;
}

export const PUBLIC_MESSAGE_MAX = 200;

export function truncateMessage(message: string, max = PUBLIC_MESSAGE_MAX) {
  const chars = Array.from(message.trim()); // conta caracteres, não unidades UTF-16
  return chars.length <= max ? chars.join("") : `${chars.slice(0, max).join("").trimEnd()}…`;
}
