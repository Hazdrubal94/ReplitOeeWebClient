import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import ProductionReports from "@/pages/production-reports";
import CurrentReport from "@/pages/current-report";
import { ThemeToggle } from "@/components/theme-toggle";
import { CurrentReportProvider } from "@/lib/current-report-context";
import BwiMesLogo from "@/components/bwi-mes-logo";
import { TopMenu } from "@/components/top-menu";
import { FooterBar } from "@/components/footer-bar";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/reports" component={ProductionReports} />
      <Route path="/reports/:reportId" component={CurrentReport} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CurrentReportProvider>
          <div className="flex flex-col h-screen w-full overflow-hidden">

            {/* HEADER = logo + nav + actions */}
            <header className="flex items-center justify-between px-4 h-14 border-b border-border bg-background sticky top-0 z-20">
              <div className="flex items-center gap-6">
                <BwiMesLogo className="w-22 h-12 text-primary" />
              </div>
              
              <div className="flex-1 px-6">
                <TopMenu />
              </div>

              <div className="flex items-center gap-3">
                <ThemeToggle />
              </div>
            </header>

            {/* CONTENT */}
            <main className="flex-1 overflow-auto">
              <Router />
            </main>

            {/* STICKY BOTTOM */}
            <FooterBar />
          </div>

          <Toaster />
        </CurrentReportProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;