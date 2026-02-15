import { ThemeProvider } from "./context/ThemeProvider.tsx";
import AppRoutes from "./routes/index.tsx";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AppRoutes />
    </ThemeProvider>
  );
}

export default App;