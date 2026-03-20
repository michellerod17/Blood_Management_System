import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Check } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import StatusBadge from '../../components/hospital/StatusBadge';


function fmt(d) { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }); }
function ChartTip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (<div style={{ background: '#161622', border: '1px solid rgba(217,0,37,0.3)', borderRadius: 8, padding: '10px 14px' }}><div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginBottom: 4 }}>{label}</div>{payload.map(p => <div key={p.dataKey} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: p.color }}>{p.name}: {p.value}</div>)}</div>);
}

const revenueData = [];

export default function AdminPayments() {
    const [payments, setPayments] = useState([]);
    useEffect(() => {
    fetch("http://localhost:5000/admin/payments")
        .then(res => res.json())
        .then(data => {
            console.log("API DATA:", data);

            const formatted = data.map(p => ({
                ...p,
                amount: Number(p.amount),
                payment_status: p.payment_status.charAt(0).toUpperCase() + p.payment_status.slice(1)
            }));

            setPayments(formatted);
        })
        .catch(err => console.error(err));
}, []);
    const [toast, setToast] = useState(null);

    const pendingAmt = payments.filter(p => p.payment_status === 'Pending').reduce((s, p) => s + p.amount, 0);
    const paidAmt = payments.filter(p => p.payment_status === 'Paid').reduce((s, p) => s + p.amount, 0);

    const markPaid = id => { setPayments(ps => ps.map(p => p.payment_id === id ? { ...p, payment_status: 'Paid' } : p)); setToast('Payment marked as paid'); setTimeout(() => setToast(null), 3000); };
    const totalRevenue = payments.reduce((s, p) => s + p.amount, 0);
    const grouped = {};

payments.forEach(p => {
  const month = new Date(p.payment_date).toLocaleString('default', { month: 'short' });

  if (!grouped[month]) {
    grouped[month] = { month, received: 0, pending: 0 };
  }

  if (p.payment_status === "Paid") {
    grouped[month].received += p.amount;
  } else {
    grouped[month].pending += p.amount;
  }
});

const revenueData = Object.values(grouped);
const thisMonth = payments
  .filter(p => {
    const d = new Date(p.payment_date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  })
  .reduce((s, p) => s + p.amount, 0);
    return (
        <AdminLayout title="Payments" page="PAYMENTS">
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 100, opacity: 0 }}
                        style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 999, background: '#161622', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 12, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                        <Check size={16} color="#22c55e" /><span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#fff' }}>{toast}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                    {[{ l: 'TOTAL REVENUE', v: `₹${totalRevenue.toLocaleString()}`, c: '#22c55e' }, { l: 'PENDING', v: `₹${pendingAmt.toLocaleString()}`, c: '#f59e0b' }, { l: 'THIS MONTH',v: `₹${thisMonth.toLocaleString()}` }, { l: 'TRANSACTIONS', v: payments.length }].map(({ l, v, c }, i) => (
                        <motion.div key={l} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                            style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>{l}</div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, color: c || '#fff', lineHeight: 1 }}>{v}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Revenue Chart */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28 }}>
                    <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 20 }}>Revenue Trend</div>
                    <ResponsiveContainer width="100%" height={180}>
                        <AreaChart data={revenueData}>
                            <defs>
                                <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#D90025" stopOpacity={0.3} /><stop offset="100%" stopColor="#D90025" stopOpacity={0} /></linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="month" tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<ChartTip />} />
                            <Area type="monotone" dataKey="received" name="Received" stroke="#D90025" strokeWidth={2} fill="url(#redGrad)" />
                            <Area type="monotone" dataKey="pending" name="Pending" stroke="#f59e0b" strokeWidth={1.5} fill="transparent" strokeDasharray="4 4" />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Table */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 1fr 90px 70px 80px 80px 90px', gap: 10, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        {['ID', 'HOSPITAL', 'BLOOD BANK', 'REQUEST', 'AMOUNT', 'DATE', 'STATUS', 'ACTION'].map(h => <div key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', letterSpacing: '0.08em' }}>{h}</div>)}
                    </div>
                    {payments.map(p => (
                        <div key={`PAY-${String(p.payment_id).padStart(3, "0")}`} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 1fr 90px 70px 80px 80px 90px', gap: 10, alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#fff' }}>{`PAY-${String(p.payment_id).padStart(3, "0")}`}</div>
                            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#fff' }}>{p.hospital_name}</div>
                            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)' }}>{p.bank_name}</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--red)' }}>{p.request_id}</div>
                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 15, color: '#fff' }}>₹{p.amount.toLocaleString()}</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>{fmt(p.payment_date)}</div>
                            <StatusBadge status={p.payment_status} />
                            {p.payment_status === 'Pending' ? (
                                <button onClick={() => markPaid(p.payment_id)} style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 11, color: '#22c55e' }}>Mark Paid</button>
                            ) : (
                                <button style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text3)' }}>Receipt</button>
                            )}
                        </div>
                    ))}
                </motion.div>
            </div>
        </AdminLayout>
    );
}
