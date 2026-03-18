import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, X, Check } from 'lucide-react';
import BloodBankLayout from '../../components/bloodbank/BloodBankLayout';
import BloodGroupBadge from '../../components/hospital/BloodGroupBadge';
import RecordDonationModal from '../../components/bloodbank/RecordDonationModal';
import { getDonors, registerDonor, getHealthChecks, getDonations } from '../../api/bloodBankApi';

const STATUS_TABS = ['All', 'Eligible', 'Cooling', 'Deferred'];
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const DISTRICTS = ['All', 'Thiruvananthapuram', 'Ernakulam', 'Thrissur', 'Kozhikode'];

function initials(n) { return n.split(' ').slice(0, 2).map(x => x[0]).join(''); }
function fmt(d) { return d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'; }
function daysAgo(d) { return d ? Math.floor((Date.now() - new Date(d)) / 86400000) : '—'; }

function statusStyle(s) {
    if (s === 'Eligible') return { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)' };
    if (s === 'Cooling') return { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' };
    return { color: 'var(--red)', bg: 'rgba(217,0,37,0.1)', border: 'rgba(217,0,37,0.25)' };
}

function RegisterDonorModal({ onClose, onSuccess }) {
    const [name, setName] = useState(''); const [age, setAge] = useState(''); const [gender, setGender] = useState('Male');
    const [bg, setBg] = useState(''); const [phone, setPhone] = useState(''); const [city, setCity] = useState('Thiruvananthapuram');
    const [loading, setLoading] = useState(false); const [done, setDone] = useState(false); const [err, setErr] = useState(null);
    const iS = { width: '100%', background: '#0A0A12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '11px 14px', fontFamily: 'var(--font-body)', fontSize: 14, color: '#fff', outline: 'none', boxSizing: 'border-box' };
    const lS = { display: 'block', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8, marginTop: 14 };
    const handleSubmit = () => {
        if (!name || !age || !bg || !phone) return setErr('Please fill all fields');
        setLoading(true); setErr(null);
        registerDonor({ name, age: parseInt(age), gender, phone_no: phone, blood_group: bg, city })
            .then(() => { setLoading(false); setDone(true); onSuccess(); })
            .catch(e => { setLoading(false); setErr(e.message); });
    };
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <motion.div initial={{ scale: 0.93, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.93, opacity: 0 }}
                style={{ background: '#0F0F17', border: '1px solid rgba(217,0,37,0.2)', borderRadius: 20, padding: 40, width: '100%', maxWidth: 460, position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} color="var(--text3)" /></button>
                {done ? (
                    <div style={{ textAlign: 'center', padding: '32px 0' }}>
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }} style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}><Check size={28} color="#22c55e" /></motion.div>
                        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 800, fontSize: 22, color: '#fff', marginBottom: 8 }}>Donor Registered!</div>
                        <button onClick={onClose} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '10px 28px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text2)' }}>Close</button>
                    </div>
                ) : (
                    <>
                        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 24, color: '#fff', marginBottom: 6 }}>Register New Donor</div>
                        {err && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--red)', marginBottom: 8 }}>{err}</div>}
                        <label style={lS}>FULL NAME</label><input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" style={iS} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div><label style={lS}>AGE</label><input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="Age" style={iS} /></div>
                            <div><label style={lS}>GENDER</label><select value={gender} onChange={e => setGender(e.target.value)} style={{ ...iS, cursor: 'pointer' }}>{['Male', 'Female', 'Other'].map(g => <option key={g} style={{ background: '#0F0F17' }}>{g}</option>)}</select></div>
                        </div>
                        <label style={lS}>BLOOD GROUP</label>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {BLOOD_TYPES.map(b => <button key={b} onClick={() => setBg(b)} style={{ padding: '5px 10px', borderRadius: 8, cursor: 'pointer', background: bg === b ? 'var(--red)' : 'rgba(255,255,255,0.05)', border: `1px solid ${bg === b ? 'var(--red)' : 'rgba(255,255,255,0.1)'}`, fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 11, color: '#fff' }}>{b}</button>)}
                        </div>
                        <label style={lS}>PHONE NUMBER</label><input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" style={iS} />
                        <label style={lS}>CITY / DISTRICT</label>
                        <select value={city} onChange={e => setCity(e.target.value)} style={{ ...iS, cursor: 'pointer', marginBottom: 24 }}>
                            {DISTRICTS.filter(d => d !== 'All').map(d => <option key={d} style={{ background: '#0F0F17' }}>{d}</option>)}
                        </select>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button onClick={onClose} style={{ flex: 1, background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 0', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text2)' }}>Cancel</button>
                            <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, background: 'var(--red)', border: 'none', borderRadius: 10, padding: '12px 0', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: '#fff', opacity: loading ? 0.7 : 1 }}>
                                {loading ? 'Registering...' : 'Register Donor →'}
                            </button>
                        </div>
                    </>
                )}
            </motion.div>
        </motion.div>
    );
}

function DonorDetailDrawer({ donor, onClose, healthChecks, donationRecs }) {
    const dcs = donationRecs.filter(d => d.donor_id === donor.donor_id);
    const hcs = healthChecks.filter(h => h.donor_id === donor.donor_id);
    const sts = statusStyle(donor.eligibility_status || (donor.status === 'active' ? 'Eligible' : 'Deferred'));
    const displayStatus = donor.eligibility_status || (donor.status === 'active' ? 'Eligible' : 'Deferred');
    const [showDonation, setShowDonation] = useState(false);
    return (
        <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.3 }}
                style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 384, background: '#0F0F17', borderLeft: '1px solid rgba(255,255,255,0.08)', zIndex: 110, overflowY: 'auto', padding: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 20, color: '#fff' }}>Donor Profile</div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} color="var(--text3)" /></button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(217,0,37,0.15)', border: '1px solid rgba(217,0,37,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--red)' }}>{initials(donor.name)}</div>
                    <div>
                        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 18, color: '#fff' }}>{donor.name}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>DNR-{String(donor.donor_id).padStart(3,'0')}</div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                    <BloodGroupBadge group={donor.blood_group} small />
                    <span style={{ background: sts.bg, border: `1px solid ${sts.border}`, borderRadius: 100, padding: '2px 8px', fontFamily: 'var(--font-mono)', fontSize: 9, color: sts.color }}>{displayStatus.toUpperCase()}</span>
                </div>
                {[['Age', (donor.age || '—') + ' yrs'], ['Gender', donor.gender], ['Phone', donor.phone_no], ['City', donor.city], ['Last Donation', fmt(donor.last_donation_date)], ['Total Donations', donor.total_donations || dcs.length]].map(([l, v]) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>{l}</span>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#fff' }}>{v}</span>
                    </div>
                ))}
                {hcs.length > 0 && <>
                    <div style={{ marginTop: 20, marginBottom: 12, fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>HEALTH CHECKS ({hcs.length})</div>
                    {hcs.map(hc => (
                        <div key={hc.check_id} style={{ background: '#0A0A12', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 12, marginBottom: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>HC-{String(hc.check_id).padStart(3,'0')} · {fmt(hc.check_date)}</span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: hc.eligibility_status === 'Eligible' ? '#22c55e' : 'var(--red)' }}>{hc.eligibility_status?.toUpperCase()}</span>
                            </div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text2)' }}>Hb: {hc.hemoglobin} · BP: {hc.blood_pressure} · Wt: {hc.weight}kg</div>
                        </div>
                    ))}
                </>}
                {dcs.length > 0 && <>
                    <div style={{ marginTop: 20, marginBottom: 12, fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>DONATIONS ({dcs.length})</div>
                    {dcs.map(d => (
                        <div key={d.donation_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>DON-{String(d.donation_id).padStart(3,'0')} · {fmt(d.donation_date)}</span>
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#fff' }}>{d.quantity}ml</span>
                        </div>
                    ))}
                </>}
                <button onClick={() => setShowDonation(true)} style={{ marginTop: 24, width: '100%', background: 'var(--red)', border: 'none', borderRadius: 10, padding: '12px 0', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: '#fff' }}>Record Donation →</button>
                <AnimatePresence>{showDonation && <RecordDonationModal onClose={() => setShowDonation(false)} donors={[donor]} />}</AnimatePresence>
            </motion.div>
        </>
    );
}

export default function BloodBankDonors() {
    const [statusFilter, setStatusFilter] = useState('All');
    const [district, setDistrict] = useState('All');
    const [search, setSearch] = useState('');
    const [showRegister, setShowRegister] = useState(false);
    const [drawerDonor, setDrawerDonor] = useState(null);
    const [recallDone, setRecallDone] = useState(false);
    const [donors, setDonors] = useState([]);
    const [healthChecks, setHealthChecks] = useState([]);
    const [donationRecs, setDonationRecs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAll = () => {
        setLoading(true);
        Promise.all([getDonors(), getHealthChecks(), getDonations()])
            .then(([d, hc, don]) => { setDonors(d); setHealthChecks(hc); setDonationRecs(don); setLoading(false); })
            .catch(err => { setError(err.message); setLoading(false); });
    };

    useEffect(() => { fetchAll(); }, []);

    if (loading) return <BloodBankLayout title="Donors" page="DONORS"><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, fontFamily: 'var(--font-mono)', color: 'var(--text3)', fontSize: 13 }}>Loading donors...</div></BloodBankLayout>;
    if (error) return <BloodBankLayout title="Donors" page="DONORS"><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, fontFamily: 'var(--font-mono)', color: 'var(--red)', fontSize: 13 }}>Error: {error}</div></BloodBankLayout>;

    const getStatus = (d) => d.eligibility_status || (d.status === 'active' ? 'Eligible' : 'Deferred');

    const filtered = donors.filter(d => {
        const ds = getStatus(d);
        const ms = statusFilter === 'All' || ds === statusFilter;
        const md = district === 'All' || d.city === district;
        const mq = d.name.toLowerCase().includes(search.toLowerCase())
            || `DNR-${String(d.donor_id).padStart(3,'0')}`.toLowerCase().includes(search.toLowerCase());
        return ms && md && mq;
    });

    const eligibleCount = donors.filter(d => getStatus(d) === 'Eligible').length;

    const handleRecall = () => { setRecallDone(true); setTimeout(() => setRecallDone(false), 3000); };

    return (
        <BloodBankLayout title="Donors" page="DONORS">
            <AnimatePresence>{showRegister && <RegisterDonorModal onClose={() => setShowRegister(false)} onSuccess={fetchAll} />}</AnimatePresence>
            <AnimatePresence>{drawerDonor && <DonorDetailDrawer donor={drawerDonor} onClose={() => setDrawerDonor(null)} healthChecks={healthChecks} donationRecs={donationRecs} />}</AnimatePresence>
            <AnimatePresence>
                {recallDone && (
                    <motion.div initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 80 }}
                        style={{ position: 'fixed', bottom: 32, right: 32, background: '#0F0F17', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 12, padding: '14px 20px', zIndex: 300, fontFamily: 'var(--font-body)', fontSize: 14, color: '#22c55e' }}>
                        ✓ SMS sent to {eligibleCount} eligible donors
                    </motion.div>
                )}
            </AnimatePresence>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                    {[{ label: 'TOTAL DONORS', val: String(donors.length), color: '#fff' }, { label: 'ELIGIBLE NOW', val: String(eligibleCount), color: '#22c55e' }, { label: 'COOLING PERIOD', val: String(donors.filter(d => getStatus(d) === 'Cooling').length), color: '#f59e0b' }, { label: 'DEFERRED', val: String(donors.filter(d => getStatus(d) === 'Deferred').length), color: 'var(--red)' }].map(({ label, val, color }, i) => (
                        <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.07 }} style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>{label}</div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 52, color, lineHeight: 1 }}>{val}</div>
                        </motion.div>
                    ))}
                </div>
                {eligibleCount > 0 && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 14, padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Users size={18} color="#22c55e" />
                            <div><div style={{ fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 15, color: '#22c55e' }}>{eligibleCount} donors eligible to donate</div><div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)', marginTop: 2 }}>Send bulk recall SMS/WhatsApp</div></div>
                        </div>
                        <button onClick={handleRecall} style={{ background: 'none', border: '1px solid rgba(34,197,94,0.4)', borderRadius: 10, padding: '8px 18px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: '#22c55e' }}>Send Recall →</button>
                    </motion.div>
                )}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 20, color: '#fff' }}>All Donors</div>
                        <button onClick={() => setShowRegister(true)} style={{ background: 'var(--red)', border: 'none', cursor: 'pointer', borderRadius: 10, padding: '10px 18px', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: '#fff', boxShadow: '0 2px 12px rgba(217,0,37,0.3)' }}>＋ Register Donor</button>
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
                        {STATUS_TABS.map(t => <button key={t} onClick={() => setStatusFilter(t)} style={{ background: statusFilter === t ? 'var(--red)' : 'rgba(255,255,255,0.05)', border: `1px solid ${statusFilter === t ? 'var(--red)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 100, padding: '5px 12px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, color: statusFilter === t ? '#fff' : 'var(--text2)' }}>{t}</button>)}
                        <select value={district} onChange={e => setDistrict(e.target.value)} style={{ background: '#0A0A12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100, padding: '5px 14px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)', cursor: 'pointer', outline: 'none' }}>
                            {DISTRICTS.map(d => <option key={d} style={{ background: '#0F0F17' }}>{d}</option>)}
                        </select>
                        <div style={{ flex: 1, minWidth: 180, position: 'relative' }}>
                            <Search size={14} color="var(--text3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, ID..."
                                style={{ width: '100%', background: '#0A0A12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 12px 8px 38px', fontFamily: 'var(--font-body)', fontSize: 13, color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 50px 70px 80px 110px 120px 100px 110px', gap: 10, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        {['DONOR ID', 'NAME', 'AGE', 'GENDER', 'BLOOD GRP', 'CITY', 'LAST DONATION', 'STATUS', 'ACTION'].map(h => <div key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</div>)}
                    </div>
                    {filtered.length === 0 && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', padding: '20px 0' }}>No donors found.</div>}
                    {filtered.map((d, i) => {
                        const ds = getStatus(d);
                        const sts = statusStyle(ds);
                        return (
                            <div key={d.donor_id} onClick={() => setDrawerDonor(d)}
                                style={{ display: 'grid', gridTemplateColumns: '90px 1fr 50px 70px 80px 110px 120px 100px 110px', gap: 10, alignItems: 'center', padding: '14px 0', borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>DNR-{String(d.donor_id).padStart(3,'0')}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(217,0,37,0.12)', border: '1px solid rgba(217,0,37,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 12, color: 'var(--red)', flexShrink: 0 }}>{initials(d.name)}</div>
                                    <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 14, color: '#fff' }}>{d.name}</div>
                                </div>
                                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text2)' }}>{d.age}</div>
                                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text2)' }}>{d.gender}</div>
                                <BloodGroupBadge group={d.blood_group} small />
                                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text2)' }}>{d.city}</div>
                                <div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>{fmt(d.last_donation_date)}</div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', marginTop: 2 }}>{daysAgo(d.last_donation_date)} days ago</div></div>
                                <span style={{ display: 'inline-flex', alignItems: 'center', background: sts.bg, border: `1px solid ${sts.border}`, borderRadius: 100, padding: '2px 8px', fontFamily: 'var(--font-mono)', fontSize: 9, color: sts.color }}>{ds.toUpperCase()}</span>
                                <div onClick={e => e.stopPropagation()}>
                                    {ds === 'Eligible' && <button onClick={e => { e.stopPropagation(); handleRecall(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--red)', padding: 0 }}>Recall</button>}
                                    {ds === 'Deferred' && <button style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, padding: '4px 10px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text2)' }}>Review</button>}
                                </div>
                            </div>
                        );
                    })}
                </motion.div>
            </div>
        </BloodBankLayout>
    );
}