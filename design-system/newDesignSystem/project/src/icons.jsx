/* ───────── Lakshya Hub — Icons (Lucide-style, unified stroke) ───────── */
const Ico = ({ children, size = 16, className = "", strokeWidth = 1.6, fill = "none", style }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ flexShrink: 0, ...style }}
  >
    {children}
  </svg>
);

const Icon = {
  Home:   (p) => <Ico {...p}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></Ico>,
  Search: (p) => <Ico {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Ico>,
  Board:  (p) => <Ico {...p}><rect x="3" y="4" width="5" height="16" rx="1" /><rect x="10" y="4" width="5" height="10" rx="1" /><rect x="17" y="4" width="4" height="14" rx="1" /></Ico>,
  Resume: (p) => <Ico {...p}><path d="M7 3h7l5 5v13H7z" /><path d="M14 3v5h5" /><path d="M10 13h7M10 17h5" /></Ico>,
  User:   (p) => <Ico {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" /></Ico>,
  Settings:(p) => <Ico {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" /></Ico>,
  Plus:   (p) => <Ico {...p}><path d="M12 5v14M5 12h14" /></Ico>,
  Minus:  (p) => <Ico {...p}><path d="M5 12h14" /></Ico>,
  Check:  (p) => <Ico {...p}><path d="m5 12 5 5L20 7" /></Ico>,
  X:      (p) => <Ico {...p}><path d="M6 6l12 12M18 6 6 18" /></Ico>,
  ChevD:  (p) => <Ico {...p}><path d="m6 9 6 6 6-6" /></Ico>,
  ChevR:  (p) => <Ico {...p}><path d="m9 6 6 6-6 6" /></Ico>,
  ChevL:  (p) => <Ico {...p}><path d="m15 6-6 6 6 6" /></Ico>,
  ChevsL: (p) => <Ico {...p}><path d="m11 17-5-5 5-5M18 17l-5-5 5-5" /></Ico>,
  ChevsR: (p) => <Ico {...p}><path d="m13 17 5-5-5-5M6 17l5-5-5-5" /></Ico>,
  Arrow:  (p) => <Ico {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Ico>,
  Ext:    (p) => <Ico {...p}><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" /></Ico>,
  MapPin: (p) => <Ico {...p}><path d="M12 21s-7-6.5-7-12a7 7 0 1 1 14 0c0 5.5-7 12-7 12Z" /><circle cx="12" cy="9" r="2.5" /></Ico>,
  Globe:  (p) => <Ico {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></Ico>,
  Cmd:    (p) => <Ico {...p}><path d="M9 9V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V9" /></Ico>,
  Bell:   (p) => <Ico {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8" /><path d="M10 20a2 2 0 0 0 4 0" /></Ico>,
  Menu:   (p) => <Ico {...p}><path d="M4 6h16M4 12h16M4 18h16" /></Ico>,
  Grip:   (p) => <Ico {...p}><circle cx="9" cy="6" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="18" r="1" /><circle cx="15" cy="6" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="18" r="1" /></Ico>,
  Mail:   (p) => <Ico {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></Ico>,
  Phone:  (p) => <Ico {...p}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1l-1.3 1.3a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2Z" /></Ico>,
  Github: (p) => <Ico {...p}><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" /></Ico>,
  Linkedin:(p) => <Ico {...p}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6Z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></Ico>,
  Upload: (p) => <Ico {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m17 8-5-5-5 5" /><path d="M12 3v12" /></Ico>,
  Down:   (p) => <Ico {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5" /><path d="M12 15V3" /></Ico>,
  Save:   (p) => <Ico {...p}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" /><path d="M17 21v-8H7v8M7 3v5h8" /></Ico>,
  Sparkle:(p) => <Ico {...p}><path d="M12 3 13.5 9 19 10.5 13.5 12 12 18l-1.5-6L5 10.5 10.5 9Z" /></Ico>,
  Bolt:   (p) => <Ico {...p}><path d="m13 2-9 12h8l-1 8 9-12h-8Z" /></Ico>,
  Target: (p) => <Ico {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" /></Ico>,
  Filter: (p) => <Ico {...p}><path d="M22 3H2l8 10v7l4-2v-5Z" /></Ico>,
  Sort:   (p) => <Ico {...p}><path d="M7 4v16M3 8l4-4 4 4M17 20V4M13 16l4 4 4-4" /></Ico>,
  Trend:  (p) => <Ico {...p}><path d="m3 17 6-6 4 4 8-8" /><path d="M14 7h7v7" /></Ico>,
  Calendar:(p) => <Ico {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></Ico>,
  Briefcase:(p) => <Ico {...p}><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M2 13h20" /></Ico>,
  Building:(p) => <Ico {...p}><path d="M3 21V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v16" /><path d="M16 9h3a2 2 0 0 1 2 2v10M7 7h2M7 11h2M7 15h2M13 7h-2M13 11h-2M13 15h-2" /></Ico>,
  DollarSign:(p) => <Ico {...p}><path d="M12 2v20M17 7H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></Ico>,
  Clock:  (p) => <Ico {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Ico>,
  Info:   (p) => <Ico {...p}><circle cx="12" cy="12" r="9" /><path d="M12 16v-4M12 8h.01" /></Ico>,
  Warn:   (p) => <Ico {...p}><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></Ico>,
  Err:    (p) => <Ico {...p}><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></Ico>,
  LogOut: (p) => <Ico {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5M21 12H9" /></Ico>,
  Edit:   (p) => <Ico {...p}><path d="M17 3a2.85 2.85 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></Ico>,
  Trash:  (p) => <Ico {...p}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></Ico>,
  MoreH:  (p) => <Ico {...p}><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></Ico>,
  Layout: (p) => <Ico {...p}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></Ico>,
  Palette:(p) => <Ico {...p}><circle cx="13.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" /><circle cx="17.5" cy="10.5" r="1.5" fill="currentColor" stroke="none" /><circle cx="8.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" /><circle cx="6.5" cy="12.5" r="1.5" fill="currentColor" stroke="none" /><path d="M12 22a10 10 0 1 1 10-10c0 2-1 3-3 3h-2a2 2 0 0 0-2 2 2 2 0 0 1-2 2h-1" /></Ico>,
  Zap:    (p) => <Ico {...p}><path d="m13 2-9 12h8l-1 8 9-12h-8Z" /></Ico>,
  Pin:    (p) => <Ico {...p}><path d="M12 17v5M9 10.8V4h6v6.8l4 4.2H5z" /></Ico>,
  Book:   (p) => <Ico {...p}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5Z" /></Ico>,
  Eye:    (p) => <Ico {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12Z" /><circle cx="12" cy="12" r="3" /></Ico>,
  Dots:   (p) => <Ico {...p}><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></Ico>,
  List:   (p) => <Ico {...p}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></Ico>,
  Wand:   (p) => <Ico {...p}><path d="m15 4 1.5 3 3 1.5-3 1.5L15 13l-1.5-3-3-1.5 3-1.5Z" /><path d="M9 11 3 21" /></Ico>,
  Lock:   (p) => <Ico {...p}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 1 1 8 0v4" /></Ico>,
  Moon:   (p) => <Ico {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></Ico>,
  Flame:  (p) => <Ico {...p}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.5 0 2-1 2-3 0 0 2 0 2-2.5s-.5-3.5 0-4.5c0 0-3-.5-3-4.5-1.5 0-6.5 2-6.5 8.5 0 1 .5 3 3 3Z" /></Ico>,
  Brain:  (p) => <Ico {...p}><path d="M12 5a3 3 0 1 0-5.9.7A3 3 0 0 0 3 8.5a3 3 0 0 0 .5 1.7A3 3 0 0 0 3 13a3 3 0 0 0 2 2.8A3 3 0 0 0 7 19a3 3 0 0 0 5 0V5Z" /><path d="M12 5a3 3 0 1 1 5.9.7A3 3 0 0 1 21 8.5a3 3 0 0 1-.5 1.7A3 3 0 0 1 21 13a3 3 0 0 1-2 2.8A3 3 0 0 1 17 19a3 3 0 0 1-5 0" /></Ico>,
  Send:   (p) => <Ico {...p}><path d="M22 2 11 13M22 2l-7 20-4-9-9-4Z" /></Ico>,
};

window.Icon = Icon;
