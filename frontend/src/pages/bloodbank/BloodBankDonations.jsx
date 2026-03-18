import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Download } from 'lucide-react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import BloodBankLayout from '../../components/bloodbank/BloodBankLayout';
import BloodGroupBadge from '../../components/hospital/BloodGroupBadge';
import { getDonations } from '../../api/bloodBankApi';

const DATE_TABS = ['All', 'This Month', 'Last 3M', 'This Year'];
function fmt(d) { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
function initials(n) { return n.split(' ').slice(0, 2).map(x => x[0]).join(''); }

function DonationRow({ d }) {
    const [open, setOpen] = useState(false);
    return (
        <>
            <div onClick={() => setOpen(v => !v)}
                style={{ display: 'grid', gridTemplateColumns: '130px 1fr 90px 90px 120px 100px 30px', gap: 12, alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#fff' }}>DON-{String(d.donation_id).padStart(3,'0')}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(217,0,37,0.12)', border: '1px solid rgba(217,0,37,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 12, color: 'var(--red)', flexShrink: 0 }}>{initials(d.donor_name)}</div>
                    <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 14, color: '#fff' }}>{d.donor_name}</div>
                </div>
                <BloodGroupBadge group={d.blood_group} small />
                <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 15, color: '#fff' }}>{d.quantity} ml</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>{fmt(d.donation_date)}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--red)' }}>HC-{String(d.check_id || '—').padStart(3,'0')}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>{open ? '▲' : '▼'}</div>
            </div>
            {open && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: 'hidden', background: 'rgba(217,0,37,0.03)', borderLeft: '3px solid rgba(217,0,37,0.4)', paddingLeft: 20, paddingBottom: 16, paddingTop: 12, marginBottom: 4 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                        {d.hemoglobin && <div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', marginBottom: 8 }}>HEALTH CHECK</div>
                            {[['Weight', (d.weight || '—') + ' kg'], ['Hemoglobin', (d.hemoglobin || '—') + ' g/dL'], ['Blood Pressure', d.blood_pressure || '—'], ['Result', d.eligibility_status || '—']].map(([l, v]) => (
                                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>{l}</span>
                                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#fff' }}>{v}</span>
                                </div>
                            ))}
                        </div>}
                        <div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', marginBottom: 8 }}>DONATION DETAILS</div>
                            {[['Donation ID', `DON-${String(d.donation_id).padStart(3,'0')}`], ['Quantity', d.quantity + ' ml'], ['Date', fmt(d.donation_date)]].map(([l, v]) => (
                                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>{l}</span>
                                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#fff' }}>{v}</span>
                                </div>
                            ))}
                        </div>
                        <div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', marginBottom: 8 }}>STOCK IMPACT</div>
                            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#22c55e' }}>+{d.quantity}ml {d.blood_group} added to inventory</div>
                        </div>
                    </div>
                </motion.div>
            )}
        </>
    );
}

export default function BloodBankDonations() {
    const [tab, setTab] = useState('All');
    const [search, setSearch] = useState('');
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        getDonations()
            .then(data => { setDonations(data); setLoading(false); })
            .catch(err => { setError(err.message); setLoading(false); });
    }, []);

    if (loading) return <BloodBankLayout title="Donations" page="DONATIONS"><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, fontFamily: 'var(--font-mono)', color: 'var(--text3)', fontSize: 13 }}>Loading donations...</div></BloodBankLayout>;
    if (error) return <BloodBankLayout title="Donations" page="DONATIONS"><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, fontFamily: 'var(--font-mono)', color: 'var(--red)', fontSize: 13 }}>Error: {error}</div></BloodBankLayout>;

    const totalVol = donations.reduce((s, d) => s + (d.quantity || 0), 0);

    // Build trend data from real donations
    const trendMap = {};
    donations.forEach(d => {
        const month = new Date(d.donation_date).toLocaleDateString('en-IN', { month: 'short' });
        if (!trendMap[month]) trendMap[month] = { month, donations: 0, quantity_ml: 0 };
        trendMap[month].donations++;
        trendMap[month].quantity_ml += d.quantity || 0;
    });
    const donationTrend = Object.values(trendMap);

    const filtered = donations.filter(d => {
        const mq = (d.donor_name || '').toLowerCase().includes(search.toLowerCase())
            || `DON-${String(d.donation_id).padStart(3,'0')}`.toLowerCase().includes(search.toLowerCase());
        return mq;
    });

    return (
        <BloodBankLayout title="Donations" page="DONATIONS">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                    {[{ label: 'TOTAL DONATIONS', val: String(donations.length), color: '#fff' }, { label: 'TOTAL VOLUME', val: `${totalVol.toLocaleString()} ml`, color: '#fff' }, { label: 'UNIQUE DONORS', val: String(new Set(donations.map(d => d.donor_id)).size), color: '#fff' }, { label: 'THIS MONTH', val: String(donationTrend[donationTrend.length - 1]?.donations || 0), color: '#fff' }].map(({ label, val, color }, i) => (
                        <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.07 }}
                            style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>{label}</div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, color, lineHeight: 1 }}>{val}</div>
                        </motion.div>
                    ))}
                </div>
                {/* Chart */}
                {donationTrend.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                        style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28 }}>
                        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 4 }}>Donation Volume & Count</div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)', marginBottom: 20 }}>By month</div>
                        <ResponsiveContainer width="100%" height={180}>
                            <ComposedChart data={donationTrend}>
                                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="month" tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
                                <YAxis yAxisId="ml" tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
                                <YAxis yAxisId="ct" orientation="right" tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                                <Bar yAxisId="ml" dataKey="quantity_ml" name="Volume (ml)" fill="rgba(217,0,37,0.3)" radius={[4, 4, 0, 0]} />
                                <Line yAxisId="ct" type="monotone" dataKey="donations" name="Donations" stroke="#D90025" strokeWidth={2} dot={{ r: 3, fill: '#D90025' }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </motion.div>
                )}
                {/* Table */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 20, color: '#fff' }}>All Donation Records</div>
                        <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text2)' }}><Download size={13} /> Export PDF</button>
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
                        {DATE_TABS.map(t => <button key={t} onClick={() => setTab(t)} style={{ background: tab === t ? 'var(--red)' : 'rgba(255,255,255,0.05)', border: `1px solid ${tab === t ? 'var(--red)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 100, padding: '5px 12px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, color: tab === t ? '#fff' : 'var(--text2)' }}>{t}</button>)}
                        <div style={{ flex: 1, minWidth: 180, position: 'relative' }}>
                            <Search size={14} color="var(--text3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search donor, donation ID..."
                                style={{ width: '100%', background: '#0A0A12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 12px 8px 38px', fontFamily: 'var(--font-body)', fontSize: 13, color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr 90px 90px 120px 100px 30px', gap: 12, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        {['DONATION ID', 'DONOR', 'BLOOD GRP', 'QUANTITY', 'DATE', 'HEALTH CHECK', ''].map(h => <div key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</div>)}
                    </div>
                    {filtered.length === 0 && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', padding: '20px 0' }}>No donations found.</div>}
                    {filtered.map(d => <DonationRow key={d.donation_id} d={d} />)}
                </motion.div>
            </div>
        </BloodBankLayout>
    );
}
