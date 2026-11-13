import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function RevenueChart() {
  return <div className="chart-placeholder"><ResponsiveContainer width="100%" height="100%"><AreaChart data={[]}><defs><linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4c9cff" stopOpacity={0.28}/><stop offset="95%" stopColor="#4c9cff" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 6" vertical={false} stroke="var(--line)"/><XAxis dataKey="name" hide/><YAxis hide/><Tooltip/><Area dataKey="value" stroke="#4c9cff" fill="url(#revenueFill)" /></AreaChart></ResponsiveContainer></div>;
}
