import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Package, Droplets, Inbox, CreditCard } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useNavigate } from 'react-router-dom';
import BloodBankLayout from '../../components/bloodbank/BloodBankLayout';
import StockCard from '../../components/bloodbank/StockCard';
import PriorityBadge from '../../components/hospital/PriorityBadge';
import StatusBadge from '../../components/hospital/StatusBadge';
import BloodGroupBadge from '../../components/hospital/BloodGroupBadge';
import StockUpdateModal from '../../components/bloodbank/StockUpdateModal';
import IssueBloodModal from '../../components/bloodbank/IssueBloodModal';
import { getDashboard, getStockTrend } from '../../api/bloodBankApi';

const STOCK_ORDER = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
const LINE_COLORS = { 'O+': '#D90025', 'A+': '#3b82f6', 'B+': '#22c55e', 'O-': '#f59e0b' };
const LINE_KEYS = ['O+', 'A+', 'B+', 'O-'];

function ChartTip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: '#161622', border: '1px solid rgba(217,0,37,0.3)', borderRadius: 8, padding: '10px 14px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginBottom: 6 }}>{label}</div>
            {payload.map(p => <div key={p.dataKey} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: p.color, marginBottom: 2 }}>{p.dataKey}: {p.value}</div>)}
        </div>
    );
}

function initials(name) { return name.split(' ').slice(0, 2).map(n => n[0]).join(''); }
function fmt(d) { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }); }

export default function BloodBankDashboard() {
    const navigate = useNavigate();
    const [lineFilters, setLineFilters] = useState(['O+', 'A+', 'B+', 'O-']);
    const [reqTab, setReqTab] = useState('All');
    const [showStockModal, setShowStockModal] = useState(false);
    const [issueRequest, setIssueRequest] = useState(null);

    const [data, setData] = useState(null);
    const [stockTrend, setStockTrend] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        Promise.all([getDashboard(), getStockTrend()])
            .then(([dash, trend]) => {
                setData(dash);
                setStockTrend(trend);
                setLoading(false);
            })
            .catch(err => { setError(err.message); setLoading(false); });
    }, []);

    const refetch = () => {
        setLoading(true);
        Promise.all([getDashboard(), getStockTrend()])
            .then(([dash, trend]) => { setData(dash); setStockTrend(trend); setLoading(false); })
            .catch(err => { setError(err.message); setLoading(false); });
    };

    if (loading) return (
        <BloodBankLayout title="Dashboard" page="DASHBOARD">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, fontFamily: 'var(--font-mono)', color: 'var(--text3)', fontSize: 13 }}>Loading dashboard...</div>
        </BloodBankLayout>
    );
    if (error) return (
        <BloodBankLayout title="Dashboard" page="DASHBOARD">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, fontFamily: 'var(--font-mono)', color: 'var(--red)', fontSize: 13 }}>Error: {error}</div>
        </BloodBankLayout>
    );

    const { stock = [], requests = [], donations = [], donorStats = [], pendingPayments = {}, donationTrend = [] } = data || {};

    const sortedStock = STOCK_ORDER.map(g => stock.find(s => s.blood_group === g)).filter(Boolean);
    const totalUnits = sortedStock.reduce((s, b) => s + b.available_units, 0);
    const criticalTypes = sortedStock.filter(s => (s.available_units / (s.capacity || 200)) <= 0.3);

    const emergencyPending = requests.filter(r => r.priority === 'Emergency' && r.status === 'Pending');
    const pendingReqs = requests.filter(r => r.status === 'Pending').length;

    const reqCounts = { All: requests.length };
    requests.forEach(r => { reqCounts[r.status] = (reqCounts[r.status] || 0) + 1; });
    const filteredReqs = reqTab === 'All' ? requests : requests.filter(r => r.status === reqTab);

    const eligibleDonors = donorStats.find(d => d.status === 'active')?.count || 0;
    const coolingDonors = donorStats.find(d => d.status === 'inactive')?.count || 0;

    const toggleLine = (key) => setLineFilters(f => f.includes(key) ? f.filter(x => x !== key) : [...f, key]);

    return (
        <BloodBankLayout title="Dashboard" page="DASHBOARD">
            <AnimatePresence>{showStockModal && <StockUpdateModal onClose={() => { setShowStockModal(false); refetch(); }} />}</AnimatePresence>
            <AnimatePresence>{issueRequest && <IssueBloodModal onClose={() => { setIssueRequest(null); refetch(); }} request={issueRequest} />}</AnimatePresence>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                {/* Critical Stock Banner */}
                {criticalTypes.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        style={{ background: 'rgba(217,0,37,0.08)', border: '1px solid rgba(217,0,37,0.3)', borderRadius: 16, padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <AlertTriangle size={20} color="var(--red)" style={{ animation: 'bounce 1s ease-in-out infinite' }} />
                            <div>
                                <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 16, color: 'var(--red)' }}>
                                    Critical Stock: {criticalTypes.map(s => `${s.blood_group} (${s.available_units} units)`).join(' · ')}
                                </div>
                                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)', marginTop: 2 }}>Stock levels below 30% threshold</div>
                            </div>
                        </div>
                        <button onClick={() => setShowStockModal(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--red)', fontWeight: 600 }}>Update Stock →</button>
                    </motion.div>
                )}

                {/* KPI Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                    {[
                        { icon: Package, label: 'TOTAL UNITS IN STOCK', val: String(totalUnits), sub: 'Across 8 blood groups', color: '#fff' },
                        { icon: Droplets, label: 'DONATIONS THIS MONTH', val: String(donationTrend[donationTrend.length - 1]?.donations || 0), sub: `${donationTrend[donationTrend.length - 1]?.quantity_ml || 0} ml collected`, color: '#fff' },
                        { icon: Inbox, label: 'PENDING REQUESTS', val: String(pendingReqs), sub: `${emergencyPending.length} emergency`, color: pendingReqs > 0 ? 'var(--red)' : '#fff', pulse: pendingReqs > 0 },
                        { icon: CreditCard, label: 'PENDING PAYMENTS', val: `₹${(pendingPayments.total || 0).toLocaleString()}`, sub: `${pendingPayments.count || 0} invoices`, color: '#fff' },
                    ].map(({ icon: Icon, label, val, sub, color, pulse }, i) => (
                        <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.07 }}
                            style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(217,0,37,0.1)', border: '1px solid rgba(217,0,37,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={16} color="var(--red)" /></div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
                            </div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 52, color, lineHeight: 1, marginBottom: 6 }}>{val}</div>
                            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)' }}>{sub}</div>
                            {pulse && <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)', animation: 'pulse 1.2s infinite' }} /><span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--red)' }}>EMERGENCY ACTIVE</span></div>}
                        </motion.div>
                    ))}
                </div>

                {/* Stock Grid */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                    style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 18, color: '#fff' }}>Live Blood Stock</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s ease-in-out infinite' }} />
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>LIVE</span>
                            </div>
                        </div>
                        <button onClick={() => setShowStockModal(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--red)', fontWeight: 600 }}>Update Stock +</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
                        {sortedStock.map(s => <StockCard key={s.stock_id} stock={{ ...s, capacity: s.capacity || 200 }} onUpdate={refetch} />)}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        {[`Total: ${totalUnits} units`, `Critical: ${criticalTypes.length} types`, `Last updated: Today`].map(t => (
                            <span key={t} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>{t}</span>
                        ))}
                    </div>
                </motion.div>

                {/* Charts Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 18, color: '#fff' }}>Stock Level Trends</div>
                            <div style={{ display: 'flex', gap: 6 }}>
                                {LINE_KEYS.map(k => (
                                    <button key={k} onClick={() => toggleLine(k)} style={{ background: lineFilters.includes(k) ? LINE_COLORS[k] : 'rgba(255,255,255,0.05)', border: `1px solid ${lineFilters.includes(k) ? LINE_COLORS[k] : 'rgba(255,255,255,0.12)'}`, borderRadius: 100, padding: '3px 10px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#fff' }}>{k}</button>
                                ))}
                            </div>
                        </div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)', marginBottom: 20 }}>Last 7 days</div>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={stockTrend}>
                                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="date" tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
                                <Tooltip content={<ChartTip />} />
                                <ReferenceLine y={30} stroke="rgba(217,0,37,0.4)" strokeDasharray="4 4" label={{ value: 'Critical', fill: 'rgba(217,0,37,0.6)', fontFamily: 'var(--font-mono)', fontSize: 9 }} />
                                {LINE_KEYS.filter(k => lineFilters.includes(k)).map(k => (
                                    <Line key={k} type="monotone" dataKey={k} stroke={LINE_COLORS[k]} strokeWidth={2} dot={{ r: 3, fill: LINE_COLORS[k] }} isAnimationActive animationDuration={700} />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                        style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28 }}>
                        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 16 }}>Monthly Donations</div>
                        <ResponsiveContainer width="100%" height={160}>
                            <BarChart data={donationTrend} barSize={20}>
                                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="month" tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
                                <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                                <Bar dataKey="donations" fill="#D90025" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={700} />
                            </BarChart>
                        </ResponsiveContainer>
                        <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 16, color: '#fff' }}>
                                {donationTrend.reduce((s, d) => s + (d.donations || 0), 0)} total
                            </div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginTop: 3 }}>Last 6 months</div>
                        </div>
                    </motion.div>
                </div>

                {/* Incoming Requests */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 18, color: '#fff' }}>Incoming Blood Requests</div>
                        <button onClick={() => navigate('/bloodbank/requests')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--red)' }}>View All →</button>
                    </div>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                        {['All', 'Pending', 'Processing', 'Fulfilled'].map(t => (
                            <button key={t} onClick={() => setReqTab(t)} style={{ background: reqTab === t ? 'var(--red)' : 'rgba(255,255,255,0.05)', border: `1px solid ${reqTab === t ? 'var(--red)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 100, padding: '4px 12px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, color: reqTab === t ? '#fff' : 'var(--text2)' }}>{t} ({reqCounts[t] || 0})</button>
                        ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 130px 90px 55px 110px 120px 110px', gap: 10, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        {['REQUEST ID', 'HOSPITAL', 'PATIENT', 'BLOOD GRP', 'UNITS', 'PRIORITY', 'STATUS', 'ACTION'].map(h => (
                            <div key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</div>
                        ))}
                    </div>
                    {filteredReqs.map(req => {
                        const isEmerg = req.priority === 'Emergency';
                        return (
                            <div key={req.request_id}
                                style={{ display: 'grid', gridTemplateColumns: '110px 1fr 130px 90px 55px 110px 120px 110px', gap: 10, alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', background: isEmerg && req.status === 'Pending' ? 'rgba(217,0,37,0.04)' : 'transparent', borderLeft: isEmerg && req.status === 'Pending' ? '3px solid #D90025' : '3px solid transparent', paddingLeft: isEmerg && req.status === 'Pending' ? 10 : 0 }}
                                onMouseEnter={e => e.currentTarget.style.background = (isEmerg && req.status === 'Pending') ? 'rgba(217,0,37,0.06)' : 'rgba(255,255,255,0.02)'}
                                onMouseLeave={e => e.currentTarget.style.background = (isEmerg && req.status === 'Pending') ? 'rgba(217,0,37,0.04)' : 'transparent'}>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#fff' }}>REQ-{String(req.request_id).padStart(3,'0')}</div>
                                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#fff' }}>{req.hospital_name}</div>
                                <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 13, color: '#fff' }}>{req.patient_name}</div>
                                <BloodGroupBadge group={req.blood_group} small />
                                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: '#fff', lineHeight: 1 }}>{req.units_required}</div>
                                <PriorityBadge priority={req.priority || 'Routine'} />
                                <StatusBadge status={req.status} />
                                <div>
                                    {req.status === 'Pending' && isEmerg && <button onClick={() => setIssueRequest(req)} style={{ background: 'var(--red)', border: 'none', cursor: 'pointer', borderRadius: 7, padding: '5px 10px', fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: '#fff' }}>Fulfil Now →</button>}
                                    {req.status === 'Pending' && !isEmerg && <button onClick={() => setIssueRequest(req)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', borderRadius: 7, padding: '5px 10px', fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text2)' }}>Process →</button>}
                                    {req.status === 'Processing' && <button onClick={() => setIssueRequest(req)} style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', cursor: 'pointer', borderRadius: 7, padding: '5px 10px', fontFamily: 'var(--font-body)', fontSize: 11, color: '#f59e0b' }}>Issue Blood →</button>}
                                    {req.status === 'Fulfilled' && <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)' }}>View Issue</span>}
                                </div>
                            </div>
                        );
                    })}
                </motion.div>

                {/* Recent Activity Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    {/* Recent Donations */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                        style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 18, color: '#fff' }}>Recent Donations</div>
                            <button onClick={() => navigate('/bloodbank/donations')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--red)' }}>View All →</button>
                        </div>
                        {donations.slice(0, 3).map((d, i) => (
                            <div key={d.donation_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(217,0,37,0.15)', border: '1px solid rgba(217,0,37,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--red)', flexShrink: 0 }}>{initials(d.donor_name)}</div>
                                    <div><div style={{ fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 14, color: '#fff' }}>{d.donor_name}</div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>{fmt(d.donation_date)}</div></div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <BloodGroupBadge group={d.blood_group} small />
                                    <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 14, color: '#fff' }}>{d.quantity}ml</div>
                                </div>
                            </div>
                        ))}
                        {donations.length === 0 && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', padding: '14px 0' }}>No recent donations</div>}
                    </motion.div>
                    {/* Donor Pool */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                        style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 18, color: '#fff' }}>Donor Pool</div>
                            <button onClick={() => navigate('/bloodbank/donors')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--red)' }}>View All →</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                            {[{ label: 'ELIGIBLE', val: eligibleDonors, color: '#22c55e' }, { label: 'COOLING', val: coolingDonors, color: '#f59e0b' }, { label: 'DEFERRED', val: 0, color: 'var(--red)' }].map(({ label, val, color }) => (
                                <div key={label} style={{ background: '#0A0A12', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 10px', textAlign: 'center' }}>
                                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, color, lineHeight: 1 }}>{val}</div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', marginTop: 4 }}>{label}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </BloodBankLayout>
    );
}