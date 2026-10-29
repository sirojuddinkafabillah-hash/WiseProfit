import { createClient } from '@supabase/supabase-js';
const json = (res: any, status: number, body: unknown) => res.status(status).setHeader('Content-Type', 'application/json').json(body);
export default async function handler(req: any, res: VercelResponse) {
 if (req.method !== 'POST') return json(res,405,{error:'Method not allowed'});
 const auth = req.headers.authorization || ''; const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
 const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
 const anon = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
 const aiKey = process.env.OPENAI_API_KEY;
 if (!url || !anon) return json(res,503,{error:'Support service is not configured.'});
 if (!token) return json(res,401,{error:'Please sign in first.'});
 const client = createClient(url,anon,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:{user},error} = await client.auth.getUser(token);
 if (error || !user) return json(res,401,{error:'Invalid session.'});
 const messages = Array.isArray(req.body?.messages) ? req.body.messages.slice(-12) : [];
 if (!messages.length || messages.some((m:any)=>!['user','assistant'].includes(m?.role)||typeof m?.content!=='string'||m.content.length>2500)) return json(res,400,{error:'Invalid chat messages.'});
 if (!aiKey) return json(res,503,{error:'AI support is not configured yet. You can still create a support ticket.'});
 try {
  const response = await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{Authorization:'Bearer '+aiKey,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.SUPPORT_AI_MODEL||'gpt-4o-mini',temperature:0.2,max_tokens:500,messages:[{role:'system',content:'You are WiseProfit support assistant. Answer in the user’s language (Indonesian or English). Only explain these known features: inventory/purchases/sales records, business summaries, cash withdrawals, and data import/export. Give concise safe troubleshooting. Never claim you accessed or changed account data. Never ask for passwords, OTPs, API keys, or financial account credentials. Do not invent features or claim a developer received a report. If unsure or unresolved, suggest creating a support ticket. Do not request sensitive financial data.'},...messages]})});
  const data:any=await response.json().catch(()=>({}));
  if(!response.ok)return json(res,502,{error:'AI service is temporarily unavailable.'});
  const answer=data?.choices?.[0]?.message?.content;
  if(typeof answer!=='string'||!answer.trim())return json(res,502,{error:'AI returned an empty answer.'});
  return json(res,200,{answer:answer.trim()});
 } catch { return json(res,502,{error:'Could not reach the AI service.'}); }
}
