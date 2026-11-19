import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, ShieldCheck, Sparkles, Wallet, Zap, ChartNoAxesCombined, Target, LockKeyhole, CheckCircle2, Play } from "lucide-react";
import { SectionHeading } from "../components/SectionHeading";

const features = [
  { icon: Wallet, title: "Smart digital banking", text: "See your accounts and activity in one clear, organised place." },
  { icon: Zap, title: "Instant transfers", text: "Move funds between demo accounts with a simple, guided flow." },
  { icon: Sparkles, title: "AI financial assistant", text: "Ask everyday money questions and get practical, data-led guidance." },
  { icon: ChartNoAxesCombined, title: "Expense insights", text: "Understand where your money goes with easy-to-read summaries." },
  { icon: Target, title: "Savings goals", text: "Turn your plans into milestones and track your progress." },
  { icon: ShieldCheck, title: "Fraud alerts", text: "See clear risk signals from our educational demo detection engine." },
];

export default function Home() {
  return <>
    <section className="hero">
      <div className="hero-glow glow-one" /><div className="hero-glow glow-two" />
      <div className="container hero-grid">
        <div className="hero-copy">
          <div className="pill"><span className="pulse-dot" /> A smarter way to manage money</div>
          <h1>Banking made smarter.<br /><span>Money managed better.</span></h1>
          <p className="hero-lead">Take control of your finances with an intelligent digital banking experience built around clarity, confidence and convenience.</p>
          <div className="hero-actions"><Link to="/register" className="btn btn-primary">Get started <ArrowRight size={17} /></Link><Link to="/services" className="btn btn-ghost">Explore services <ArrowUpRight size={16} /></Link></div>
          <div className="hero-proof"><div className="avatar-stack"><i> S </i><i> A </i><i> M </i></div><span><strong>Designed for smarter decisions</strong><br />One connected view of your finances</span></div>
        </div>
        <div className="hero-visual">
          <div className="orbit orbit-a" /><div className="orbit orbit-b" />
          <div className="bank-card">
            <div className="card-top"><span className="card-chip"><LandmarkIcon /></span><span className="card-label">SMARTBANK AI</span><span className="card-contactless">)))</span></div>
            <div className="card-balance-label">Available balance <span className="demo-tag">DEMO</span></div>
            <div className="card-balance">₹ 84,520<span>.00</span></div>
            <div className="card-number">•••• &nbsp; •••• &nbsp; •••• &nbsp; 4829</div>
            <div className="card-bottom"><div><small>ACCOUNT HOLDER</small><b>YOUR NAME</b></div><div className="master-mark"><i /><i /></div></div>
          </div>
          <div className="insight-float"><div className="insight-icon"><Sparkles size={17} /></div><div><small>SMART INSIGHT</small><b>Your savings are growing</b><span>You're on track this month</span></div><span className="trend">↗ 12%</span></div>
          <div className="secure-float"><ShieldCheck size={17} /><span>Security-minded<br /><b>by design</b></span></div>
        </div>
      </div>
      <div className="hero-bottom container"><span>BUILT FOR EVERYDAY FINANCIAL CLARITY</span><div><span>ACCOUNTS</span><span>INSIGHTS</span><span>SECURITY</span><span>GOALS</span></div></div>
    </section>

    <section className="section section-white">
      <div className="container"><SectionHeading eyebrow="WHAT YOU CAN DO" title="Your money, with a little more intelligence." text="The tools you need to understand, organise and plan your finances — brought together in one experience." />
        <div className="feature-grid">{features.map(({ icon: Icon, title, text }) => <article className="feature-card" key={title}><div className="feature-icon"><Icon size={21} /></div><h3>{title}</h3><p>{text}</p><Link to="/services">Learn more <ArrowRight size={14} /></Link></article>)}</div>
      </div>
    </section>

    <section className="section why-section"><div className="container why-grid"><div><SectionHeading eyebrow="WHY SMARTBANK AI" title="More clarity. Less financial guesswork." text="We bring everyday banking tools and intelligent insights together, so the next money decision feels easier." /><div className="check-list"><p><CheckCircle2 /> Intelligent financial insights</p><p><CheckCircle2 /> Easy-to-understand money management</p><p><CheckCircle2 /> A thoughtful, user-friendly experience</p><p><CheckCircle2 /> Security-focused product design</p></div><Link to="/about" className="text-link">Discover our approach <ArrowRight size={16} /></Link></div><div className="why-panel"><div className="panel-top"><span>MONTHLY OVERVIEW</span><span className="panel-period">DEMO DATA</span></div><div className="overview-total">₹ 32,480 <span>spent this month</span></div><div className="mini-bars">{[36,52,42,68,48,78,58,88,64,72,50,82].map((v,i)=><i key={i} style={{height:`${v}%`}} />)}</div><div className="panel-legend"><span><i className="legend-dot cyan" /> Spending pattern</span><span>Illustrative sample</span></div><div className="panel-insight"><Sparkles size={17} /><span><b>A helpful nudge</b><br />Reviewing recurring expenses can make room for your savings goals.</span></div></div></div></section>

    <section className="section section-white"><div className="container"><SectionHeading eyebrow="GET STARTED IN FOUR STEPS" title="A clearer financial routine starts here." text="A simple journey from creating your profile to making more informed money decisions." /><div className="steps-grid">{[["01","Create an account","Set up your personal demo profile."],["02","Build your profile","Add the details needed for your banking workspace."],["03","Manage your finances","Review activity, expenses and savings goals."],["04","Get useful insights","Use intelligent summaries to plan your next step."]].map(([n,t,d])=><div className="step" key={n}><span>{n}</span><div><h3>{t}</h3><p>{d}</p></div></div>)}</div></div></section>

    <section className="security-band"><div className="container security-inner"><div className="security-symbol"><LockKeyhole size={26} /></div><div><span className="eyebrow">SECURITY & TRUST</span><h2>Designed with your privacy in mind.</h2><p>SmartBank AI is an academic demonstration. It uses simulated financial data and does not connect to real banking networks or move actual money.</p></div><Link to="/about" className="btn btn-outline-light">Our approach <ArrowUpRight size={16} /></Link></div></section>

    <section className="section testimonials"><div className="container"><SectionHeading eyebrow="A VISION FOR BETTER BANKING" title="Built around real everyday needs." text="Illustrative feedback from fictional demo users, representing the experience SmartBank AI aims to deliver." /><div className="quote-grid"><blockquote><div className="quote-stars">★★★★★</div><p>“I like having my spending and savings goals in one place. It makes my monthly check-in feel simple.”</p><footer><b>Demo user · Priya</b><span>Fictional testimonial</span></footer></blockquote><blockquote><div className="quote-stars">★★★★★</div><p>“The assistant-style insights make financial information feel easier to understand.”</p><footer><b>Demo user · Arjun</b><span>Fictional testimonial</span></footer></blockquote><blockquote><div className="quote-stars">★★★★★</div><p>“The layout feels clear, and I can quickly find the tools I need.”</p><footer><b>Demo user · Neha</b><span>Fictional testimonial</span></footer></blockquote></div></div></section>

    <section className="final-cta"><div className="container cta-inner"><div><span className="eyebrow">TAKE THE FIRST STEP</span><h2>Make your next money move a smarter one.</h2><p>Explore a more thoughtful way to manage your financial life.</p></div><Link to="/register" className="btn btn-primary">Open an account <ArrowRight size={17} /></Link></div></section>
  </>;
}

function LandmarkIcon() { return <span className="tiny-landmark">S</span>; }
