import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon: the stethoscope "P" on a white tile (iOS rounds the corners). */
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
      }}
    >
      <svg width="132" height="137" viewBox="0 -4 100 104" fill="#1e3765">
        <path d="M32 30 L17 7" fill="none" stroke="#1e3765" strokeWidth="6" strokeLinecap="round" />
        <ellipse cx="15" cy="4" rx="7.5" ry="5" transform="rotate(57 15 4)" />
        <path
          d="M32 30 C32 16 40 8 52 8 C66 8 76 18 76 30 C76 42 66 50 56 50"
          fill="none"
          stroke="#1e3765"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <ellipse cx="50" cy="50" rx="7.5" ry="5" />
        <circle cx="32" cy="32" r="6" />
        <path d="M32 36 L32 70" fill="none" stroke="#1e3765" strokeWidth="10" strokeLinecap="round" />
        <rect x="28" y="67" width="8" height="7" rx="1" />
        <circle cx="32" cy="84" r="13" />
        <circle cx="32" cy="84" r="8" fill="#007fa3" />
      </svg>
    </div>,
    size,
  );
}
