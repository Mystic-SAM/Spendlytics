import type { ThemeType } from "@/constants/constants"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type ThemeProviderProps = {
  children: ReactNode
  defaultTheme?: ThemeType
  storageKey?: string
}

type ThemeProviderState = {
  theme: ThemeType
  setTheme: (theme: ThemeType) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [uiTheme, setUiTheme] = useState<ThemeType>(
    () => (localStorage.getItem(storageKey) as ThemeType) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (uiTheme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(uiTheme)
  }, [uiTheme])

  const setTheme = (theme: ThemeType) => {
    localStorage.setItem(storageKey, theme)
    setUiTheme(theme)
  }

  const value = {
    theme: uiTheme,
    setTheme,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}