import { FormEvent, useState } from "react";
import { Mail, Phone, Clock, Send, ChevronDown } from "lucide-react";
import { SectionHeading } from "../components/SectionHeading";

const faqs = [
  ["Is SmartBank AI a real bank?","No. SmartBank AI is an academic demonstration project. It is not a regulated bank and does not provide real banking services."],
  ["Can I transfer real money?","No. Any transfer functionality developed for this project will use simulated demo accounts only."],
  ["How is my demo profile stored?","In Phase 1, registration data is stored locally in your browser for demonstration. Backend storage and secure authentication are planned for later phases."],
  ["Can I use my actual banking password?","No. Please use a unique demo password and never enter real banking credentials into this prototype."]
];

export default function Contact() {
  const [sent,setSent]=useState(false); const [error,setError]=useState("");
  function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setError("");const form=e.currentTarget;const data=new FormData(form);if(String(data.get("message")).trim().length<10){setError("Please enter a message with at least 10 characters.");return;}setSent(true);form.reset();}
  return <>
    <section className="page-hero"><div className="container"><span className="eyebrow">CONTACT US</span><h1>We're here to help<br /><span>you find your way.</span></h1><p>Questions about the SmartBank AI demonstration? Send our project support team a message.</p></div></section>
    <section className="section section-white"><div className="container contact-grid"><div><SectionHeading eyebrow="GET IN TOUCH" title="Let's start a conversation." text="Use the form to share a question, suggestion or feedback about the project."/><div className="contact-method"><div className="feature-icon"><Mail/></div><div><span>EMAIL SUPPORT</span><b>support@smartbankai.demo</b></div></div><div className="contact-method"><div className="feature-icon"><Phone/></div><div><span>PHONE (DEMO)</span><b>+91 00000 00000</b></div></div><div className="contact-method"><div className="feature-icon"><Clock/></div><div><span>SUPPORT HOURS</span><b>Monday–Friday, 9 AM–6 PM IST</b></div></div><p className="contact-note">Contact details shown here are illustrative project information, not a live banking support service.</p></div>
    <form className="contact-form" onSubmit={submit}><h3>Send us a message</h3><p>All fields are required.</p>{sent&&<div className="form-alert success">Thank you! Your demo message has been recorded for this session.</div>}{error&&<div className="form-alert error">{error}</div>}<label>Your name<input name="name" placeholder="Enter your name" required minLength={2}/></label><label>Email address<input name="email" type="email" placeholder="you@example.com" required/></label><label>Subject<input name="subject" placeholder="How can we help?" required/></label><label>Message<textarea name="message" rows={4} placeholder="Write your message..." required/></label><button className="btn btn-primary" type="submit">Send message <Send size={16}/></button><small>This form provides local demo feedback only; it does not send an email.</small></form></div></section>
    <section className="section muted-section"><div className="container"><SectionHeading eyebrow="COMMON QUESTIONS" title="A few things you might be wondering."/><div className="faq-list">{faqs.map(([q,a])=><details key={q}><summary>{q}<ChevronDown size={18}/></summary><p>{a}</p></details>)}</div></div></section>
  </>;
}
