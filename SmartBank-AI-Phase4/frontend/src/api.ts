const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
export function getToken(){return localStorage.getItem("smartbank_token")||"";}
export async function api<T=any>(path:string, options:RequestInit={}):Promise<T>{
  const headers:Record<string,string>={"Content-Type":"application/json",...(options.headers as Record<string,string>||{})};
  const token=getToken(); if(token) headers.Authorization=`Bearer ${token}`;
  const response=await fetch(`${API_URL}${path}`,{...options,headers});
  const body=await response.json().catch(()=>({detail:"Unexpected server response."}));
  if(!response.ok) throw new Error(body.detail||`Request failed (${response.status})`);
  return body as T;
}
