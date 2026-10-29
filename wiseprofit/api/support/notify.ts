import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
const json = (res: VercelResponse, status: number, body: unknown) => res.status(status).setHeader('Content-Type','application/json').json(body);
export default async function handler(req: VercelRequest,res: VercelResponse) {
 if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});
 const auth=req.headers.authorization||'';const token=auth.startsWith('Bearer ')?auth.slice(7):'';
 const url=process.env.SUPABASE_URL||process.env.VITE_SUPABASE_URL;
 const anon=process.env.SUPABASE_ANON_KEY||process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
 const serviceKey=process.env.SUPABASE_SERVICE_ROLE_KEY;const resendKey=process.env.RESEND_API_KEY;const adminEmail=process.env.SUPPORT_ADMIN_EMAIL;
 if(!url||!anon||!serviceKey||!resendKey||!adminEmail)return json(res,503,{error:'Email notifications are not configured yet.'});
 if(!token)return json(res,401,{error:'Please sign in first.'});
 const authClient=createClient(url,anon,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:{user},error:authError}=await authClient.auth.getUser(token);
 if(authError||!user)return json(res,401,{error:'Invalid session.'});
 const service=createClient(url,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
 const ticketId=typeof req.body?.ticketId==='string'?req.body.ticketId:'';
 if(!/^[0-9a-f-]{36}$/i.test(ticketId))return json(res,400,{error:'Invalid ticket ID.'});
 const {data:ticket,error}=await service.from('support_tickets').select('id,user_id,user_email,category,subject,detail,created_at').eq('id',ticketId).maybeSingle();
 if(error||!ticket||ticket.user_id!==user.id)return json(res,404,{error:'Ticket not found.'});
 try {
  const mail=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+resendKey,'Content-Type':'application/json'},body:JSON.stringify({from:process.env.SUPPORT_EMAIL_FROM||'WiseProfit Support <onboarding@resend.dev>',to:[adminEmail],subject:'[WiseProfit] New support ticket: '+ticket.subject,text:'New WiseProfit support ticket\nID: '+ticket.id+'\nFrom: '+(ticket.user_email||user.email||'unknown')+'\nCategory: '+ticket.category+'\nSubject: '+ticket.subject+'\n\nDetails:\n'+ticket.detail+'\n\nOpen the developer support dashboard to reply.'})});
  if(!mail.ok)return json(res,502,{error:'Ticket was saved, but email notification failed.'});
  return json(res,200,{sent:true});
 }catch{return json(res,502,{error:'Ticket was saved, but email notification failed.'});}
}
