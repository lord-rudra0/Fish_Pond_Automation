import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient.js";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { authService } from "./lib/auth.js";
import { useEffect, useState } from "react";

import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Thresholds from "@/pages/thresholds";
import Sensors from "@/pages/sensors";
import History from "@/pages/history";
import Profile from "@/pages/profile";
import Documentation from "@/pages/documentation";
import Help from "@/pages/help";
import Contact from "@/pages/contact";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout";

function Router() {
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(authService.isAuthenticated());
    };
    
    // Check auth status on mount and whenever storage changes
    checkAuth();
    window.addEventListener('storage', checkAuth);
    
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/signup" component={Signup} />
        <Route path="/" component={Login} />
        <Route component={Login} />
      </Switch>
    );
  }

  return (
            <Layout>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/sensors" component={Sensors} />
            <Route path="/history" component={History} />
            <Route path="/thresholds" component={Thresholds} />
            <Route path="/profile" component={Profile} />
            <Route path="/documentation" component={Documentation} />
            <Route path="/help" component={Help} />
            <Route path="/contact" component={Contact} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;