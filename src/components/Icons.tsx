// Ícones de linha (24×24, traço 1.5). Decorativos: o texto ao lado carrega o significado.
type IconProps = { className?: string };

function Svg({ className = "size-5", children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

export const IconForm = (p: IconProps) => (
  <Svg {...p}>
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <path d="M9 8h6M9 12h6M9 16h3" />
  </Svg>
);

export const IconClassify = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9-9-9Z" />
    <circle cx="8" cy="8" r="1.5" />
  </Svg>
);

export const IconDatabase = (p: IconProps) => (
  <Svg {...p}>
    <ellipse cx="12" cy="5" rx="8" ry="3" />
    <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
    <path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
  </Svg>
);

export const IconSend = (p: IconProps) => (
  <Svg {...p}>
    <path d="M21 3 10 14" />
    <path d="M21 3 14 21l-4-7-7-4 18-7Z" />
  </Svg>
);

export const IconDroplet = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z" />
  </Svg>
);

export const IconPolish = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="3" />
    <path d="M12 4v2M12 18v2M4 12h2M18 12h2" />
  </Svg>
);

export const IconShield = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3 5 6v6c0 4.4 3 7.6 7 9 4-1.4 7-4.6 7-9V6l-7-3Z" />
    <path d="m9 12 2 2 4-4" />
  </Svg>
);

export const IconSeat = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 4h6a2 2 0 0 1 2 2v7H9L7 4Z" />
    <path d="M5 17h12l2-4H8" />
    <path d="M8 17v3M16 17v3" />
  </Svg>
);

export const IconLayers = (p: IconProps) => (
  <Svg {...p}>
    <path d="m12 3 9 5-9 5-9-5 9-5Z" />
    <path d="m3 13 9 5 9-5" />
  </Svg>
);

export const IconCheck = (p: IconProps) => (
  <Svg {...p}>
    <path d="m5 12 4.5 4.5L19 7" />
  </Svg>
);

export const IconX = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);

export const IconMinus = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 12h12" />
  </Svg>
);

export const IconChevron = (p: IconProps) => (
  <Svg {...p}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
);
