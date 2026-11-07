import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

function Router() {
  return <Switch>
    <Route path="/" component={Home} />
    <Route path="/ambientes" component={Home} />
    <Route path="/coberturas" component={Home} />
    <Route path="/climatizacao" component={Home} />
    <Route path="/plantas" component={Home} />
    <Route path="/materiais" component={Home} />
    <Route path="/circuitos" component={Home} />
    <Route path="/assistente" component={Home} />
    <Route path="/painel/escritorio" component={Home} />
    <Route path="/painel/suite" component={Home} />
    <Route path="/painel/escritorio/assistente" component={Home} />
    <Route path="/painel/suite/assistente" component={Home} />
    <Route path="/painel/escritorio/coberturas" component={Home} />
    <Route path="/painel/suite/coberturas" component={Home} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster/><Router/></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
