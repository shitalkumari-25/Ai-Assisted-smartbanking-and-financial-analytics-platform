import { Outlet, Link, NavLink } from "react-router-dom";
import { ArrowUpRight, Landmark, Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  ["Home", "/"],
  ["About Us", "/about"],
  ["Services", "/services"],
  ["Contact", "/contact"],
];

export function SiteLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="site-shell">
      <header className="topbar">
        <div className="nav-wrap">
          <Link to="/" className="brand" onClick={() => setMenuOpen(false)}>
            <span className="brand-mark"><Landmark size={20} /></span>
            <span>SmartBank<span className="brand-ai"> AI</span></span>
          </Link>
          <button className="mobile-menu" aria-label="Toggle navigation" onClick={() => setMenuOpen(v => !v)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <nav className={menuOpen ? "nav-links nav-open" : "nav-links"}>
            {navItems.map(([label, path]) => (
              <NavLink key={path} to={path} end={path === "/"} onClick={() => setMenuOpen(false)}
                className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>{label}</NavLink>
            ))}
          </nav>
          <div className="nav-actions">
            <Link className="login-link" to="/login">Log in</Link>
            <Link className="btn btn-small btn-primary" to="/register">Open an account <ArrowUpRight size={15} /></Link>
          </div>
        </div>
      </header>
      <main><Outlet /></main>
      <footer className="footer">
        <div className="footer-main">
          <div className="footer-brand">
            <Link to="/" className="brand"><span className="brand-mark"><Landmark size={20} /></span><span>SmartBank<span className="brand-ai"> AI</span></span></Link>
            <p>Banking made smarter. Money managed better.</p>
            <span className="demo-note">Academic demonstration platform · Simulated data only</span>
          </div>
          <div><h4>Explore</h4><Link to="/about">About us</Link><Link to="/services">Services</Link><Link to="/contact">Contact</Link></div>
          <div><h4>Get started</h4><Link to="/login">Log in</Link><Link to="/register">Open an account</Link><a href="mailto:support@smartbankai.demo">Support email</a></div>
          <div><h4>Contact</h4><p>support@smartbankai.demo</p><p>Mon–Fri · 9:00 AM–6:00 PM</p></div>
        </div>
        <div className="footer-bottom"><span>© 2026 SmartBank AI. All rights reserved.</span><span>Privacy-first design · Demo environment</span></div>
      </footer>
    </div>
  );
}
