import { useState, useEffect } from "react";
import { useAuth } from "../lib/auth/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AlertsPage } from "./pages/AlertsPage";
import { UsersPage } from "./pages/UsersPage";
import { ReportsPage } from "./pages/ReportsPage";
import { MobileDashboard } from "./pages/MobileDashboard";
import { Sidebar } from "./components/Sidebar";
import { AIAssistant } from "./components/AIAssistant";
import { TopBar } from "./components/TopBar";
import { LoadingScreen } from "./components/LoadingScreen";
import { IntroScreen } from "./components/IntroScreen";
import { NeuralBackground } from "./components/NeuralBackground";
import { Toaster } from "sonner";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const { isLoggedIn, isAdmin, carregandoSessao, logout } = useAuth();
  const [currentRoute, setCurrentRoute] = useState("dashboard");
  // A abertura roda uma vez por aba. Recarregar durante o desenvolvimento
  // não repete a animação; abrir uma aba nova sim.
  const [mostrarIntro, setMostrarIntro] = useState(() => {
    try {
      return sessionStorage.getItem("biosyn.intro") !== "visto";
    } catch {
      return true;
    }
  });

  const encerrarIntro = () => {
    try {
      sessionStorage.setItem("biosyn.intro", "visto");
    } catch {
      /* ignora */
    }
    setMostrarIntro(false);
  };
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleNavigate = (route: string) => {
    setCurrentRoute(route);
  };

  const handleLogout = () => {
    logout();
    setCurrentRoute("dashboard");
  };

  if (mostrarIntro) {
    return <IntroScreen onFinish={encerrarIntro} />;
  }

  // Reidratando a sessão a partir do token salvo.
  if (carregandoSessao) {
    return <LoadingScreen />;
  }

  if (!isLoggedIn) {
    return <LoginPage />;
  }

  // Mobile View
  if (isMobile) {
    return <MobileDashboard />;
  }

  const renderPage = () => {
    switch (currentRoute) {
      case "dashboard":
        return <DashboardPage />;
      case "alerts":
        // Rota de admin: POST /alertas responde 403 pra usuário comum.
        return isAdmin ? <AlertsPage /> : <DashboardPage />;
      case "reports":
        return <ReportsPage />;
      case "users":
        // Rota de admin: as rotas /usuarios respondem 403 pra usuário comum.
        return isAdmin ? <UsersPage /> : <DashboardPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#0B1F2A] overflow-hidden">
      <Sidebar activeRoute={currentRoute} onNavigate={handleNavigate} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentRoute}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <AIAssistant />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(11, 31, 42, 0.95)",
            border: "1px solid rgba(0, 255, 163, 0.3)",
            color: "white",
          },
        }}
      />

      {/* Visual Effects */}
      <NeuralBackground />
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00FFA3] opacity-5 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#6C5CE7] opacity-5 blur-[100px] rounded-full" />
      </div>
    </div>
  );
}