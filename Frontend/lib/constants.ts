export const THEME = {
  colors: {
    primary: {
      DEFAULT: "#8e44ad",
      light: "#a55bca",
      dark: "#6c3483",
    },
    background: {
      DEFAULT: "#121212",
      card: "#1e1e1e",
      elevated: "#2a2a2a",
    },
    text: {
      primary: "#ffffff",
      secondary: "#a0a0a0",
      muted: "#6b7280",
    },
    border: {
      DEFAULT: "rgba(255, 255, 255, 0.1)",
      hover: "rgba(255, 255, 255, 0.2)",
    },
  },
  spacing: {
    container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
    section: "py-8 md:py-12",
  },
  animation: {
    DEFAULT: "transition-all duration-300 ease-in-out",
    fast: "transition-all duration-150 ease-in-out",
    slow: "transition-all duration-500 ease-in-out",
  },
  borderRadius: {
    DEFAULT: "rounded-lg",
    sm: "rounded-md",
    lg: "rounded-xl",
    full: "rounded-full",
  },
}

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
}
