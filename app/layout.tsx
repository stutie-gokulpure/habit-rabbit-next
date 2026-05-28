import "./globals.css"
import { ThemeProvider } from "@/context/ThemeContext"
import { HabitDataProvider } from "@/context/HabitDataContext"
import { PreferencesProvider } from "@/context/PreferencesContext"

const themeInitScript = `(function(){try{var t=localStorage.getItem('theme')||'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeProvider>
          <PreferencesProvider>
            <HabitDataProvider>{children}</HabitDataProvider>
          </PreferencesProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
