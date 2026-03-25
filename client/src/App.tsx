import { ThemeProvider } from "./context/ThemeProvider.tsx";
import AppRoutes from "./routes/AppRoutes.tsx";

function App() {
  return (
    <ThemeProvider storageKey="vite-ui-theme">
      <AppRoutes />
    </ThemeProvider>
  );
}

export default App;