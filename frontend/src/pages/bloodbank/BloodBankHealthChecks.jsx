import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Check } from 'lucide-react';
import BloodBankLayout from '../../components/bloodbank/BloodBankLayout';
import { getHealthChecks, getDonors, createHealthCheck } from '../../api/bloodBankApi';

const RESULT_TABS = ['All', 'Eligible', 'Deferred'];
function initials(n) { return n.split(' ').slice(0, 2).map(x => x[0]).join(''); }
function fmt(d) { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }

function NewHealthCheckModal({ onClose, donors, onSuccess }) {
    const [donorId, setDonorId] = useState('');
    const [weight, setWeight] = useState('');
    const [hemo, setHemo] = useState('');
    const [bp, setBp] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [err, setErr] = useState(null);
    const eligible = parseFloat(hemo) >= 12.5 && parseFloat(weight) >= 50;
    const checked = hemo !== '' && weight !== '';
    const iS = { width: '100%', background: '#0A0A12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '11px 14px', fontFamily: 'var(--font-body)', fontSize: 14, color: '#fff', outline: 'none', boxSizing: 'border-box' };
    const lS = { display: 'block', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8, marginTop: 14 };
    const handleSubmit = () => {
        if (!donorId) return setErr('Select a donor');
        setLoading(true); setErr(null);
        createHealthCheck({
            donor_id: parseInt(donorId),
            check_date: date,
            weight: parseFloat(weight),
            blood_pressure: bp,
            hemoglobin: parseFloat(hemo),
            eligibility_status: eligible ? 'Eligible' : 'Deferred',
        }).then(() => { setLoading(false); setDone(true); onSuccess(); })
          .catch(e => { setLoading(false); setErr(e.message); });
    };
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <motion.div initial={{ scale: 0.93, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.93, opacity: 0 }}
                style={{ background: '#0F0F17', border: '1px solid rgba(217,0,37,0.2)', borderRadius: 20, padding: 40, width: '100%', maxWidth: 480, position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} color="var(--text3)" /></button>
                {done ? (
                    <div style={{ textAlign: 'center', padding: '32px 0' }}>
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }} style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}><Check size={28} color="#22c55e" /></motion.div>
                        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 22, color: '#fff', marginBottom: 8 }}>Health Check Saved!</div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#22c55e', marginBottom: 20 }}>Donor marked {eligible ? 'Eligible' : 'Deferred'}.</div>
                        <button onClick={onClose} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '10px 28px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text2)' }}>Close</button>
                    </div>
                ) : (
                    <>
                        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 24, color: '#fff', marginBottom: 6 }}>Record Health Check</div>
                        {err && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--red)', marginBottom: 8 }}>{err}</div>}
                        <label style={lS}>SELECT DONOR</label>
                        <select value={donorId} onChange={e => setDonorId(e.target.value)} style={{ ...iS, cursor: 'pointer' }}>
                            <option value="" style={{ background: '#0F0F17' }}>Select donor...</option>
                            {donors.map(d => <option key={d.donor_id} value={d.donor_id} style={{ background: '#0F0F17' }}>{d.name} · {d.blood_group}</option>)}
                        </select>
                        <div style={{ marginTop: 18, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>MEASUREMENTS</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div><label style={{ ...lS, marginTop: 0 }}>WEIGHT (KG)</label><input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 65" style={iS} /></div>
                            <div><label style={{ ...lS, marginTop: 0 }}>HEMOGLOBIN (G/DL)</label><input type="number" step="0.1" value={hemo} onChange={e => setHemo(e.target.value)} placeholder="e.g. 13.5" style={iS} /></div>
                            <div><label style={{ ...lS, marginTop: 0 }}>BLOOD PRESSURE</label><input value={bp} onChange={e => setBp(e.target.value)} placeholder="120/80" style={iS} /></div>
                            <div><label style={{ ...lS, marginTop: 0 }}>CHECK DATE</label><input type="date" value={date} onChange={e => setDate(e.target.value)} style={iS} /></div>
                        </div>
                        {checked && (
                            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                                style={{ marginTop: 14, background: eligible ? 'rgba(34,197,94,0.08)' : 'rgba(217,0,37,0.08)', border: `1px solid ${eligible ? 'rgba(34,197,94,0.25)' : 'rgba(217,0,37,0.25)'}`, borderRadius: 10, padding: '12px 16px' }}>
                                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13, color: eligible ? '#22c55e' : 'var(--red)', marginBottom: 4 }}>{eligible ? '✓ ELIGIBLE TO DONATE' : '✕ DEFERRED'}</div>
                                {!eligible && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--red)' }}>
                                    {parseFloat(hemo) < 12.5 && 'Hemoglobin below 12.5 g/dL. '}
                                    {parseFloat(weight) < 50 && 'Weight below 50kg.'}
                                </div>}
                            </motion.div>
                        )}
                        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                            <button onClick={onClose} style={{ flex: 1, background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 0', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text2)' }}>Cancel</button>
                            <button onClick={handleSubmit} disabled={loading || !donorId} style={{ flex: 2, background: 'var(--red)', border: 'none', borderRadius: 10, padding: '12px 0', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: '#fff', opacity: (loading || !donorId) ? 0.5 : 1 }}>
                                {loading ? 'Saving...' : 'Save Health Check →'}
                            </button>
                        </div>
                    </>
                )}
            </motion.div>
        </motion.div>
    );
}

export default function BloodBankHealthChecks() {
    const [tab, setTab] = useState('All');
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [openRow, setOpenRow] = useState(null);
    const [healthChecks, setHealthChecks] = useState([]);
    const [donors, setDonors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAll = () => {
        setLoading(true);
        Promise.all([getHealthChecks(), getDonors()])
            .then(([hc, d]) => { setHealthChecks(hc); setDonors(d); setLoading(false); })
            .catch(err => { setError(err.message); setLoading(false); });
    };

    useEffect(() => { fetchAll(); }, []);

    if (loading) return <BloodBankLayout title="Health Checks" page="HEALTH-CHECKS"><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, fontFamily: 'var(--font-mono)', color: 'var(--text3)', fontSize: 13 }}>Loading...</div></BloodBankLayout>;
    if (error) return <BloodBankLayout title="Health Checks" page="HEALTH-CHECKS"><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, fontFamily: 'var(--font-mono)', color: 'var(--red)', fontSize: 13 }}>Error: {error}</div></BloodBankLayout>;

    const eligibleCount = healthChecks.filter(h => h.eligibility_status === 'Eligible').length;
    const deferredCount = healthChecks.filter(h => h.eligibility_status === 'Deferred').length;
    const filtered = healthChecks.filter(h => {
        const mt = tab === 'All' || h.eligibility_status === tab;
        const mq = (h.donor_name || '').toLowerCase().includes(search.toLowerCase())
            || `HC-${String(h.check_id).padStart(3,'0')}`.toLowerCase().includes(search.toLowerCase());
        return mt && mq;
    });

    return (
        <BloodBankLayout title="Health Checks" page="HEALTH-CHECKS">
            <AnimatePresence>{showModal && <NewHealthCheckModal onClose={() => setShowModal(false)} donors={donors} onSuccess={fetchAll} />}</AnimatePresence>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                    {[{ label: 'TOTAL CHECKS', val: String(healthChecks.length), color: '#fff' }, { label: 'ELIGIBLE RESULTS', val: String(eligibleCount), color: '#22c55e' }, { label: 'DEFERRED RESULTS', val: String(deferredCount), color: 'var(--red)' }, { label: 'THIS MONTH', val: String(healthChecks.length), color: '#fff' }].map(({ label, val, color }, i) => (
                        <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.07 }} style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>{label}</div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 52, color, lineHeight: 1 }}>{val}</div>
                        </motion.div>
                    ))}
                </div>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 20, color: '#fff' }}>All Health Checks</div>
                        <button onClick={() => setShowModal(true)} style={{ background: 'var(--red)', border: 'none', cursor: 'pointer', borderRadius: 10, padding: '10px 18px', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: '#fff', boxShadow: '0 2px 12px rgba(217,0,37,0.3)' }}>＋ New Check</button>
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
                        {RESULT_TABS.map(t => <button key={t} onClick={() => setTab(t)} style={{ background: tab === t ? 'var(--red)' : 'rgba(255,255,255,0.05)', border: `1px solid ${tab === t ? 'var(--red)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 100, padding: '5px 12px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, color: tab === t ? '#fff' : 'var(--text2)' }}>{t}</button>)}
                        <div style={{ flex: 1, minWidth: 180, position: 'relative' }}>
                            <Search size={14} color="var(--text3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search donor, check ID..."
                                style={{ width: '100%', background: '#0A0A12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 12px 8px 38px', fontFamily: 'var(--font-body)', fontSize: 13, color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 100px 80px 100px 110px 100px 110px', gap: 12, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        {['CHECK ID', 'DONOR', 'DATE', 'WEIGHT', 'HEMOGLOBIN', 'BLOOD PRESS', 'RESULT', 'DONATION'].map(h => <div key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</div>)}
                    </div>
                    {filtered.length === 0 && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', padding: '20px 0' }}>No health checks found.</div>}
                    {filtered.map((hc, i) => {
                        const isOpen = openRow === hc.check_id;
                        const elig = hc.eligibility_status === 'Eligible';
                        return (
                            <div key={hc.check_id}>
                                <div onClick={() => setOpenRow(isOpen ? null : hc.check_id)}
                                    style={{ display: 'grid', gridTemplateColumns: '90px 1fr 100px 80px 100px 110px 100px 110px', gap: 12, alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'background 0.15s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>HC-{String(hc.check_id).padStart(3,'0')}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(217,0,37,0.12)', border: '1px solid rgba(217,0,37,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 12, color: 'var(--red)', flexShrink: 0 }}>{initials(hc.donor_name || '?')}</div>
                                        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 14, color: '#fff' }}>{hc.donor_name}</div>
                                    </div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>{fmt(hc.check_date)}</div>
                                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#fff' }}>{hc.weight} kg</div>
                                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: hc.hemoglobin >= 12.5 ? '#22c55e' : 'var(--red)', fontWeight: 600 }}>{hc.hemoglobin} g/dL</div>
                                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text2)' }}>{hc.blood_pressure}</div>
                                    <span style={{ display: 'inline-flex', background: elig ? 'rgba(34,197,94,0.1)' : 'rgba(217,0,37,0.1)', border: `1px solid ${elig ? 'rgba(34,197,94,0.25)' : 'rgba(217,0,37,0.3)'}`, borderRadius: 100, padding: '2px 8px', fontFamily: 'var(--font-mono)', fontSize: 9, color: elig ? '#22c55e' : 'var(--red)' }}>{hc.eligibility_status?.toUpperCase()}</span>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>—</div>
                                </div>
                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: 'hidden' }}>
                                            <div style={{ background: 'rgba(217,0,37,0.03)', borderLeft: '3px solid rgba(217,0,37,0.3)', paddingLeft: 16, paddingTop: 12, paddingBottom: 12, marginBottom: 4, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                                                {[['Weight', hc.weight + ' kg', hc.weight >= 50], ['Hemoglobin', hc.hemoglobin + ' g/dL', hc.hemoglobin >= 12.5], ['Blood Pressure', hc.blood_pressure, true]].map(([l, v, ok]) => (
                                                    <div key={l}><div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', marginBottom: 4 }}>{l}</div><div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 18, color: ok ? '#22c55e' : 'var(--red)' }}>{v}</div></div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </motion.div>
            </div>
        </BloodBankLayout>
    );
}
