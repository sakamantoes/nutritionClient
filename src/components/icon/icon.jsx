export default function YogaIcon({ size = 24, color = "currentColor" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Example yoga person pose */}
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7 L12 14" />
      <path d="M12 14 L9 20 L12 17 L15 20 L12 14" />
      <path d="M5 10 L9 12 L7 15" />
      <path d="M19 10 L15 12 L17 15" />
    </svg>
  );
}
