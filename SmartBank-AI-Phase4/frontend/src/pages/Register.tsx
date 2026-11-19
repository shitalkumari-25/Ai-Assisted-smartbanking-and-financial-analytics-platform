import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Landmark } from "lucide-react";
import { api } from "../api";

type Data = { name:string; email:string; phone:string; dob:string; accountType:string; password:string; confirm:string };
const initial:Data = {name:"",email:"",phone:"",dob:"",accountType:"Savings",password:"",confirm:""};

export default function Register() {
  const [step,setStep]=useState(1); const [data,setData]=useState<Data>(initial);
  const [show,setShow]=useState(false); const [error,setError]=useState(""); const [done,setDone]=useState(false); const [otp,setOtp]=useState(""); const [otpSent,setOtpSent]=useState(false);
  const navigate=useNavigate();
  const update=(key:keyof Data,value:string)=>setData(d=>({...d,[key]:value}));
  function next() {
    setError("");
    if(step===1) {
      if(data.name.trim().length<2) return setError("Enter your full name.");
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return setError("Enter a valid email address.");
      if(!/^[6-9]\d{9}$/.test(data.phone)) return setError("Enter a valid 10-digit Indian mobile number.");
      if(!data.dob) return setError("Select your date of birth.");
    }
    if(step===2) {
      if(data.password.length<8) return setError("Password must contain at least 8 characters.");
      if(!/[A-Z]/.test(data.password)||!/[0-9]/.test(data.password)) return setError("Use at least one uppercase letter and one number.");
      if(data.password!==data.confirm) return setError("Passwords do not match.");
    }
    setStep(s=>Math.min(3,s+1));
  }
  async function sendOtp(){setError('');try{const r=await api<any>('/api/auth/otp/request',{method:'POST',body:JSON.stringify({email:data.email,phone:data.phone,purpose:'register'})});setOtpSent(true);setError(r.message);}catch(e){setError(e instanceof Error?e.message:'Could not send OTP.');}}
  async function submit(e:FormEvent) {
    e.preventDefault(); setError('');
    if(!otpSent){await sendOtp();return;}
    try {
      const result=await api<{token:string;user:{name:string;email:string;phone:string}}>('/api/auth/register',{method:'POST',body:JSON.stringify({name:data.name,email:data.email,phone:data.phone,dob:data.dob,accountType:data.accountType,password:data.password,otp})});
      localStorage.setItem('smartbank_token',result.token);
      localStorage.setItem('smartbank_demo_user',JSON.stringify(result.user));
      setDone(true);
    } catch(err) { setError(err instanceof Error?err.message:'Unable to create account.'); }
  }
  if(done) return <section className="auth-page"><div className="auth-success"><div className="success-icon"><Check size={32}/></div><span className="eyebrow">PROFILE CREATED</span><h1>You're ready to explore.</h1><p>Your profile has been saved to the SmartBank AI backend. You can now sign in.</p><Link className="btn btn-primary" to="/login">Go to login <ArrowRight size={17}/></Link><small>Backend registration is enabled. Email OTP was verified. Mobile SMS delivery requires a configured SMS provider.</small></div></section>;
  return <section className="auth-page"><div className="auth-decoration"><div className="auth-decoration-inner"><div className="auth-logo"><Landmark size={25}/></div><span className="eyebrow">GET STARTED</span><h2>A smarter financial<br/>routine begins here.</h2><p>Create your demo profile and explore the SmartBank AI experience.</p><div className="auth-trust"><Check size={17}/> A guided, three-step setup</div></div></div><div className="auth-form-side"><form className="auth-form register-form" onSubmit={e=>{e.preventDefault(); if(step<3) next(); else submit(e);}}><span className="eyebrow">CREATE YOUR PROFILE</span><h1>Open an account</h1><p className="form-intro">A few details to get your profile set up.</p><div className="step-indicator">{["Personal details","Account setup","Review"].map((s,i)=><div className={step>=i+1?"step-active":""} key={s}><span>{step>i+1?<Check size={13}/>:i+1}</span><small>{s}</small></div>)}</div>
    {error&&<div className="form-alert error">{error}</div>}
    {step===1&&<div className="form-fields"><label>Full name<input value={data.name} onChange={e=>update("name",e.target.value)} placeholder="Your full name" autoComplete="name"/></label><label>Email address<input type="email" value={data.email} onChange={e=>update("email",e.target.value)} placeholder="you@example.com" autoComplete="email"/></label><label>Phone number<input type="tel" value={data.phone} onChange={e=>update("phone",e.target.value.replace(/\D/g,"").slice(0,10))} placeholder="10-digit mobile number" /></label><label>Date of birth<input type="date" value={data.dob} onChange={e=>update("dob",e.target.value)} max={new Date().toISOString().slice(0,10)}/></label></div>}
    {step===2&&<div className="form-fields"><label>Account type<select value={data.accountType} onChange={e=>update("accountType",e.target.value)}><option>Savings</option><option>Current</option><option>Student</option></select></label><label>Password<div className="password-wrap"><input type={show?"text":"password"} value={data.password} onChange={e=>update("password",e.target.value)} placeholder="Min. 8 characters"/><button type="button" className="eye-button" onClick={()=>setShow(v=>!v)}>{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></label><label>Confirm password<input type="password" value={data.confirm} onChange={e=>update("confirm",e.target.value)} placeholder="Re-enter password"/></label><p className="field-hint">Use at least 8 characters, including one uppercase letter and one number.</p></div>}
    {step===3&&<div className="review-card"><div><span>FULL NAME</span><b>{data.name}</b></div><div><span>EMAIL ADDRESS</span><b>{data.email}</b></div><div><span>PHONE NUMBER</span><b>+91 {data.phone}</b></div><div><span>DATE OF BIRTH</span><b>{data.dob}</b></div><div><span>ACCOUNT TYPE</span><b>{data.accountType}</b></div><p>Your password is securely hashed by the backend. Do not reuse a real banking password.</p></div>}
    {step===3&&otpSent&&<label>Email verification code<input value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,'').slice(0,6))} inputMode="numeric" maxLength={6} placeholder="Enter 6-digit OTP" required/></label>}<div className="register-actions">{step>1&&<button type="button" className="btn btn-back" onClick={()=>{setError("");setStep(s=>s-1)}}><ArrowLeft size={16}/> Back</button>}<button className="btn btn-primary" type="submit">{step===3?(otpSent?"Verify & create account":"Send verification OTP"):"Continue"} <ArrowRight size={16}/></button></div>
    <p className="auth-switch">Already have a profile? <Link to="/login">Log in</Link></p><p className="auth-disclaimer">Email OTP verification is required. Configure SMTP for delivery; development mode prints the code in the backend terminal.</p>
  </form></div></section>;
}
