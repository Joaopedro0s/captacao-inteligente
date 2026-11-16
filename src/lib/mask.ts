// O painel é público: e-mail e telefone saem sempre mascarados, mesmo que alguém digite dados reais.
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
