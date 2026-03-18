import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import StatusBadge from '../../components/hospital/StatusBadge';


export default function AdminHospitals() {
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState(null);
    const [hospitals, setHospitals] = useState([]);
    const filtered = hospitals.filter(h => !search || h.hospital_name.toLowerCase().includes(search.toLowerCase()) || h.city.toLowerCase().includes(search.toLowerCase()));
    const active = hospitals.length; // no status in backend yet
    const pending = 0;
    const totalReqs = 0;
    
    useEffect(() => {
    fetch("http://localhost:5000/hospitals")
        .then(res => res.json())
        .then(data => setHospitals(data))
        .catch(err => console.error(err));
}, []);

    return (
        <AdminLayout title="Hospitals" page="HOSPITALS">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                    {[{ l: 'TOTAL', v: hospitals.length, c: '#fff' }, { l: 'ACTIVE', v: String(active), c: '#22c55e' }, { l: 'PENDING', v: String(pending), c: '#f59e0b' }, { l: 'TOTAL REQUESTS', v: totalReqs.toLocaleString(), c: '#fff' }].map(({ l, v, c }, i) => (
                        <motion.div key={l} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                            style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>{l}</div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, color: c, lineHeight: 1 }}>{v}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Search */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={14} color="var(--text3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search hospital name, city..." style={{ width: '100%', background: '#0F0F17', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '9px 12px 9px 38px', fontFamily: 'var(--font-body)', fontSize: 13, color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                </div>

                {/* Table */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 120px 60px 100px 60px 70px 80px 28px', gap: 10, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        {['ID', 'NAME', 'CITY', 'BEDS', 'CONTACT', 'PATIENTS', 'REQUESTS', 'STATUS', ''].map(h => <div key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', letterSpacing: '0.08em' }}>{h}</div>)}
                    </div>
                    {filtered.map(h => (
                        <div key={h.hospital_id}>
                            <div onClick={() => setExpanded(expanded === h.hospital_id ? null : h.hospital_id)}
                                style={{ display: 'grid', gridTemplateColumns: '80px 1fr 120px 60px 100px 60px 70px 80px 28px', gap: 10, alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer', transition: 'background 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#fff' }}>{h.hospital_id}</div>
                                <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 14, color: '#fff' }}>{h.hospital_name}</div>
                                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)' }}>{h.city}</div>
                                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: '#fff' }}>{h.beds || 0}</div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.contact_no}</div>
                                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: '#fff' }}>{h.total_patients || 0}</div>
                                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: '#fff' }}>{h.total_requests || 0}</div>
                                <StatusBadge status={h.status || "Active"} />
                                {expanded === h.hospital_id ? <ChevronUp size={13} color="var(--text3)" /> : <ChevronDown size={13} color="var(--text3)" />}
                            </div>
                            {expanded === h.hospital_id && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} style={{ overflow: 'hidden' }}>
                                    <div style={{ background: 'rgba(59,130,246,0.03)', borderLeft: '3px solid rgba(59,130,246,0.4)', padding: '16px 20px', marginBottom: 4, display: 'flex', gap: 24, alignItems: 'center' }}>
                                        <div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>CONTACT</div><div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#fff' }}>{h.contact_no}</div></div>
                                        <div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>BEDS</div><div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#fff' }}>{h.beds || 0}</div></div>
                                        <div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>ACTIVE PATIENTS</div><div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#fff' }}>{h.total_patients || 0}</div></div>
                                        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                                            <button style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text2)' }}>View</button>
                                            <button style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text2)' }}>Edit</button>
                                            {h.status === 'Pending' && <button style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12, color: '#22c55e' }}>Approve</button>}
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
