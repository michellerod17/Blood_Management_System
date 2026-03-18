import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import BloodBankLayout from '../../components/bloodbank/BloodBankLayout';
import { getPayments, getPaymentTrend, markPaymentPaid } from '../../api/bloodBankApi';

const PAY_TABS = ['All', 'Paid', 'Pending'];
function fmt(d) { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }

function ChartTip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return <div style={{ background: '#161622', border: '1px solid rgba(217,0,37,0.3)', borderRadius: 8, padding: '10px 14px' }}><div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginBottom: 4 }}>{label}</div>{payload.map(p => <div key={p.dataKey} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: p.color, marginBottom: 2 }}>₹{p.value} {p.dataKey}</div>)}</div>;
}

export default function BloodBankPayments() {
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [payments, setPayments] = useState([]);
    const [trend, setTrend] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAll = () => {
        setLoading(true);
        Promise.all([getPayments(), getPaymentTrend()])
            .then(([p, t]) => { setPayments(p); setTrend(t); setLoading(false); })
            .catch(err => { setError(err.message); setLoading(false); });
    };

    useEffect(() => { fetchAll(); }, []);

    if (loading) return <BloodBankLayout title="Payments" page="PAYMENTS"><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, fontFamily: 'var(--font-mono)', color: 'var(--text3)', fontSize: 13 }}>Loading payments...</div></BloodBankLayout>;
    if (error) return <BloodBankLayout title="Payments" page="PAYMENTS"><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, fontFamily: 'var(--font-mono)', color: 'var(--red)', fontSize: 13 }}>Error: {error}</div></BloodBankLayout>;

    const totalPaid = payments.filter(p => p.payment_status === 'Paid').reduce((s, p) => s + Number(p.amount), 0);
    const totalPending = payments.filter(p => p.payment_status === 'Pending').reduce((s, p) => s + Number(p.amount), 0);
    const filtered = payments.filter(p => {
        const mf = filter === 'All' || p.payment_status === filter;
        const pid = `PAY-${String(p.payment_id).padStart(3,'0')}`;
        const mq = pid.toLowerCase().includes(search.toLowerCase())
            || (p.hospital_name || '').toLowerCase().includes(search.toLowerCase());
        return mf && mq;
    });

    const handleMarkPaid = (payId) => {
        markPaymentPaid(payId)
            .then(() => setPayments(prev => prev.map(p => p.payment_id === payId ? { ...p, payment_status: 'Paid' } : p)))
            .catch(e => alert('Error: ' + e.message));
    };

    return (
        <BloodBankLayout title="Payments" page="PAYMENTS">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                    {[{ label: 'TOTAL RECEIVED', val: `₹${totalPaid.toLocaleString()}`, color: '#22c55e' }, { label: 'PENDING', val: `₹${totalPending.toLocaleString()}`, color: '#f59e0b' }, { label: 'TOTAL THIS MONTH', val: `₹${(totalPaid + totalPending).toLocaleString()}`, color: '#fff' }, { label: 'INVOICES', val: String(payments.length), color: '#fff' }].map(({ label, val, color }, i) => (
                        <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.07 }} style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>{label}</div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 44, color, lineHeight: 1 }}>{val}</div>
                        </motion.div>
                    ))}
                </div>
                {trend.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28 }}>
                        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 4 }}>Payment History</div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)', marginBottom: 20 }}>Received vs pending by month</div>
                        <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={trend} barGap={4}>
                                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="month" tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
                                <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                                <Bar dataKey="received" name="received" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="pending" name="pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>
                )}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 20, color: '#fff' }}>Payment Records</div>
                        <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text2)' }}><Download size={13} /> Download Statement</button>
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
                        {PAY_TABS.map(t => <button key={t} onClick={() => setFilter(t)} style={{ background: filter === t ? 'var(--red)' : 'rgba(255,255,255,0.05)', border: `1px solid ${filter === t ? 'var(--red)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 100, padding: '5px 12px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, color: filter === t ? '#fff' : 'var(--text2)' }}>{t}</button>)}
                        <div style={{ flex: 1, minWidth: 180, position: 'relative' }}>
                            <Search size={14} color="var(--text3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search hospital, payment ID..."
                                style={{ width: '100%', background: '#0A0A12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 12px 8px 38px', fontFamily: 'var(--font-body)', fontSize: 13, color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr 110px 100px 120px 100px 90px', gap: 12, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        {['PAYMENT ID', 'HOSPITAL', 'REQUEST', 'AMOUNT', 'DATE', 'STATUS', 'ACTION'].map(h => <div key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</div>)}
                    </div>
                    {filtered.length === 0 && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', padding: '20px 0' }}>No payments found.</div>}
                    {filtered.map((p, i) => {
                        const paid = p.payment_status === 'Paid';
                        return (
                            <div key={p.payment_id}
                                style={{ display: 'grid', gridTemplateColumns: '130px 1fr 110px 100px 120px 100px 90px', gap: 12, alignItems: 'center', padding: '14px 0', borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', transition: 'background 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#fff' }}>PAY-{String(p.payment_id).padStart(3,'0')}</div>
                                <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#fff' }}>{p.hospital_name}</div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--red)' }}>REQ-{String(p.request_id).padStart(3,'0')}</div>
                                <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 16, color: '#fff' }}>₹{Number(p.amount).toLocaleString()}</div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>{fmt(p.payment_date)}</div>
                                <span style={{ display: 'inline-block', background: paid ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${paid ? 'rgba(34,197,94,0.25)' : 'rgba(245,158,11,0.3)'}`, borderRadius: 100, padding: '2px 8px', fontFamily: 'var(--font-mono)', fontSize: 9, color: paid ? '#22c55e' : '#f59e0b' }}>{paid ? 'PAID' : 'PENDING'}</span>
                                <div>
                                    {paid
                                        ? <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)', padding: 0 }}>Receipt →</button>
                                        : <button onClick={() => handleMarkPaid(p.payment_id)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, padding: '5px 10px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text2)' }}>Mark Paid</button>}
                                </div>
                            </div>
                        );
                    })}
                </motion.div>
            </div>
        </BloodBankLayout>
    );
}
