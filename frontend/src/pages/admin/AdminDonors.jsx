import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, ChevronDown, ChevronUp } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import BloodGroupBadge from '../../components/hospital/BloodGroupBadge';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
function fmt(d) { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }

export default function AdminDonors() {
    const [statusFilter, setStatusFilter] = useState('All');
    const [bloodFilter, setBloodFilter] = useState('');
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState(null);
    const [donors, setDonors] = useState([]);
    useEffect(() => {
    fetch("http://localhost:5000/donors")
        .then(res => res.json())
        .then(data => setDonors(data))
        .catch(err => console.error(err));
}, []);
    const mappedDonors = donors.map(d => ({
    ...d,
    status: d.status === "active" ? "Eligible" : "Deferred",
    total_donations: d.total_donations || 1
}));
    const filtered = mappedDonors.filter(d => {
        if (statusFilter !== 'All' && d.status !== statusFilter) return false;
        if (bloodFilter && d.blood_group !== bloodFilter) return false;
        if (search && !d.name.toLowerCase().includes(search.toLowerCase()) && !d.donor_id.toString().includes(search.toLowerCase())) return false;
        return true;
    });

    const eligible = mappedDonors.filter(d => d.status === 'Eligible').length;
    const cooling =mappedDonors.filter(d => d.status === 'Cooling').length;
    const deferred = mappedDonors.filter(d => d.status === 'Deferred').length;
    const stColor = s => s === 'Eligible' ? '#22c55e' : s === 'Cooling' ? '#f59e0b' : 'var(--red)';

    return (
        <AdminLayout title="Donors" page="DONORS">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                    {[
  { l: 'TOTAL DONORS', v: mappedDonors.length, c: '#fff' },
  { l: 'ELIGIBLE', v: eligible, c: '#22c55e' },
  { l: 'COOLING', v: cooling, c: '#f59e0b' },
  { l: 'DEFERRED', v: deferred, c: 'var(--red)' }
].map(({ l, v, c }, i) => (
                        <motion.div key={l} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                            style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>{l}</div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, color: c, lineHeight: 1 }}>{v}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 20, color: '#fff' }}>All Donors</div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text2)' }}><Download size={14} /> Export</button>
                        <button style={{ background: 'var(--red)', border: 'none', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: '#fff' }}>＋ Add Donor</button>
                    </div>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    {['All', 'Eligible', 'Cooling', 'Deferred'].map(t => (
                        <button key={t} onClick={() => setStatusFilter(t)} style={{ background: statusFilter === t ? 'var(--red)' : 'rgba(255,255,255,0.05)', border: `1px solid ${statusFilter === t ? 'var(--red)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 100, padding: '5px 14px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, color: statusFilter === t ? '#fff' : 'var(--text2)' }}>{t}</button>
                    ))}
                    <select value={bloodFilter} onChange={e => setBloodFilter(e.target.value)} style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '7px 12px', fontFamily: 'var(--font-body)', fontSize: 13, color: '#fff', outline: 'none', cursor: 'pointer' }}>
                        <option value="" style={{ background: '#0F0F17' }}>All Blood</option>
                        {BLOOD_TYPES.map(t => <option key={t} value={t} style={{ background: '#0F0F17' }}>{t}</option>)}
                    </select>
                    <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
                        <Search size={14} color="var(--text3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, ID..." style={{ width: '100%', background: '#0F0F17', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '9px 12px 9px 38px', fontFamily: 'var(--font-body)', fontSize: 13, color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                </div>

                {/* Table */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 40px 60px 70px 80px 100px 80px 90px 28px', gap: 10, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        {['ID', 'NAME', 'AGE', 'GENDER', 'BLOOD', 'CITY', 'LAST DONATION', 'TOTAL', 'STATUS', ''].map(h => <div key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', letterSpacing: '0.08em' }}>{h}</div>)}
                    </div>
                    {filtered.map(d => (
                        <div key={d.donor_id}>
                            <div onClick={() => setExpanded(expanded === d.donor_id ? null : d.donor_id)}
                                style={{ display: 'grid', gridTemplateColumns: '90px 1fr 40px 60px 70px 80px 100px 80px 90px 28px', gap: 10, alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer', transition: 'background 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#fff' }}>{d.donor_id}</div>
                                <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 14, color: '#fff' }}>{d.name}</div>
                                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)' }}>{d.age}</div>
                                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)' }}>{d.gender}</div>
                                <BloodGroupBadge group={d.blood_group} small />
                                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)' }}>{d.city}</div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>{fmt(d.last_donation_date)}</div>
                                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: '#fff' }}>{d.total_donations}</div>
                                <span style={{ background: `${stColor(d.status)}18`, border: `1px solid ${stColor(d.status)}40`, borderRadius: 100, padding: '2px 8px', fontFamily: 'var(--font-mono)', fontSize: 9, color: stColor(d.status) }}>{d.status.toUpperCase()}</span>
                                {expanded === d.donor_id ? <ChevronUp size={13} color="var(--text3)" /> : <ChevronDown size={13} color="var(--text3)" />}
                            </div>
                            {expanded === d.donor_id && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} style={{ overflow: 'hidden' }}>
                                    <div style={{ background: 'rgba(217,0,37,0.03)', borderLeft: '3px solid rgba(217,0,37,0.4)', padding: '16px 20px', marginBottom: 4, display: 'flex', gap: 24 }}>
                                        <div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>PHONE</div><div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#fff' }}>{d.phone_no}</div></div>
                                        <div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>DISTRICT</div><div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#fff' }}>{d.city}</div></div>
                                        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                                            <button style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text2)' }}>Edit</button>
                                            <button style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text2)' }}>View</button>
                                            <button style={{ background: 'rgba(217,0,37,0.1)', border: '1px solid rgba(217,0,37,0.3)', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--red)' }}>Suspend</button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    ))}
                </motion.div>
            </div>
        </AdminLayout>
    );
}
