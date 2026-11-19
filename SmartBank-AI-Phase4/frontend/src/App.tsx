import { Navigate, Route, Routes } from "react-router-dom";
import { SiteLayout } from "./components/SiteLayout";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Portal from "./pages/Portal";
import NotFound from "./pages/NotFound";

function ProtectedPortal() {
  const session = localStorage.getItem("smartbank_demo_session");
  return session ? <Portal /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="/portal/*" element={<ProtectedPortal />} />
    </Routes>
  );
}
