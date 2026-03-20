import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Search, Shield, Building2, Droplets, User, X, Copy, Check } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';


const roleColors = { 'Super Admin': '#f59e0b', 'Hospital Admin': '#3b82f6', 'Blood Bank Admin': '#22c55e', 'Donor': '#D90025' };
const roleIcons = { 'Super Admin': Shield, 'Hospital Admin': Building2, 'Blood Bank Admin': Droplets, 'Donor': User };


function timeAgo(d) {
    const now = new Date();
    const past = new Date(d);
    const hrs = Math.round((now - past) / 3600000);
    if (hrs < 24) return `${hrs} hours ago`;
    return `${Math.round(hrs / 24)} days ago`;
}

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    useEffect(() => {
    fetch("http://localhost:5000/api/users")
        .then(res => res.json())
        .then(data => {
            console.log("API DATA:", data);
            setUsers(data);
        })
        .catch(err => console.error(err));
}, []);
    const [roleFilter, setRoleFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [toast, setToast] = useState(null);
    const filtered = users.filter(u => {
        if (roleFilter !== 'All' && u.role !== roleFilter) return false;
        if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 3000); };
    const tempPw = 'H3m@' + Math.random().toString(36).slice(2, 8).toUpperCase();
    const roleCounts = {
    'Super Admin': 0,
    'Hospital Admin': 0,
    'Blood Bank Admin': 0,
    'Donor': 0
};

users.forEach(u => {
    if (roleCounts[u.role] !== undefined) {
        roleCounts[u.role]++;
    }
});

const pieData = Object.entries(roleCounts).map(([name, value]) => ({ name, value }));
    return (
        <AdminLayout title="Users & Roles" page="USERS">
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 100, opacity: 0 }}
                        style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 999, background: '#161622', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 12, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                        <Check size={16} color="#22c55e" /><span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#fff' }}>{toast}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Create Admin Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
                        onClick={e => { if (e.target === e.currentTarget) setShowCreateModal(false); }}>
                        <motion.div initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
                            style={{ background: '#0F0F17', border: '1px solid rgba(217,0,37,0.2)', borderRadius: 20, padding: 40, width: '100%', maxWidth: 480, position: 'relative' }}>
                            <button onClick={() => setShowCreateModal(false)} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} color="var(--text3)" /></button>
                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 24, color: '#fff', marginBottom: 24 }}>Create Admin Account</div>
                            {['Full Name', 'Email', 'Phone'].map(f => (
                                <div key={f} style={{ marginBottom: 16 }}>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>{f}</div>
                                    <input placeholder={f} style={{ width: '100%', background: '#0A0A12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '11px 14px', fontFamily: 'var(--font-body)', fontSize: 14, color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                            ))}
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>ADMIN LEVEL</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                                {[{ l: '🛡️ Super Admin', d: 'Full access' }, { l: '🏢 Regional Admin', d: 'District-only' }].map(({ l, d }, i) => (
                                    <div key={l} style={{ background: i === 0 ? 'rgba(217,0,37,0.08)' : '#0A0A12', border: `1px solid ${i === 0 ? 'rgba(217,0,37,0.3)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 12, padding: 14, cursor: 'pointer', textAlign: 'center' }}>
                                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#fff' }}>{l}</div>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>{d}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>TEMPORARY PASSWORD</div>
                            <div style={{ background: '#0A0A12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: 16, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                {tempPw} <Copy size={14} color="var(--text3)" style={{ cursor: 'pointer' }} />
                            </div>
                            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text3)', marginBottom: 20 }}>Will be emailed to user</div>
                            <button onClick={() => { setShowCreateModal(false); showToast('Admin account created. Credentials emailed.'); }}
                                style={{ width: '100%', background: 'var(--red)', border: 'none', borderRadius: 10, padding: '13px 0', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: '#fff' }}>Create Admin Account →</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Invite Modal */}
            <AnimatePresence>
                {showInviteModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
                        onClick={e => { if (e.target === e.currentTarget) setShowInviteModal(false); }}>
                        <motion.div initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
                            style={{ background: '#0F0F17', border: '1px solid rgba(217,0,37,0.2)', borderRadius: 20, padding: 40, width: '100%', maxWidth: 440, position: 'relative' }}>
                            <button onClick={() => setShowInviteModal(false)} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} color="var(--text3)" /></button>
                            <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 24, color: '#fff', marginBottom: 24 }}>Invite User</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>EMAIL</div>
                            <input placeholder="email@example.com" style={{ width: '100%', background: '#0A0A12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '11px 14px', fontFamily: 'var(--font-body)', fontSize: 14, color: '#fff', outline: 'none', boxSizing: 'border-box', marginBottom: 16 }} />
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>ROLE</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
                                {Object.entries(roleColors).map(([r, c]) => {
                                    const Icon = roleIcons[r]; return (
                                        <div key={r} style={{ background: '#0A0A12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <Icon size={14} color={c} /><span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#fff' }}>{r}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <button onClick={() => { setShowInviteModal(false); showToast('Invite sent successfully'); }}
                                style={{ width: '100%', background: 'var(--red)', border: 'none', borderRadius: 10, padding: '13px 0', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: '#fff' }}>Send Invite →</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                    {[
 { l: 'TOTAL USERS', v: users.length },
 { l: 'ACTIVE TODAY', v: users.length, c: '#22c55e' },
 { l: 'SUPER ADMINS', v: users.filter(u => u.role === 'Super Admin').length, c: 'var(--red)' },
 { l: 'PENDING INVITE', v: 0, c: '#f59e0b' }
].map(({ l, v, c }, i) => (
                        <motion.div key={l} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                            style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>{l}</div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, color: c || '#fff', lineHeight: 1 }}>{v}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Pie Chart */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28 }}>
                    <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 16 }}>User Role Distribution</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                        <ResponsiveContainer width={200} height={200}>
                            <PieChart><Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={60} outerRadius={85} stroke="none">
                                {pieData.map((entry, i) => <Cell key={entry.name} fill={roleColors[entry.name]} />)}
                            </Pie></PieChart>
                        </ResponsiveContainer>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {pieData.map(e => (
                                <div key={e.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{ width: 10, height: 10, borderRadius: 2, background: roleColors[e.name] }} />
                                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#fff' }}>{e.name}</span>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>{e.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Header + Filters */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 20, color: '#fff' }}>All Users</div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => setShowInviteModal(true)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text2)' }}>＋ Invite User</button>
                        <button onClick={() => setShowCreateModal(true)} style={{ background: 'var(--red)', border: 'none', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: '#fff' }}>＋ Create Admin</button>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    {['All', ...Object.keys(roleColors)].map(r => (
                        <button key={r} onClick={() => setRoleFilter(r)} style={{ background: roleFilter === r ? 'var(--red)' : 'rgba(255,255,255,0.05)', border: `1px solid ${roleFilter === r ? 'var(--red)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 100, padding: '5px 14px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, color: roleFilter === r ? '#fff' : 'var(--text2)' }}>{r}</button>
                    ))}
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={14} color="var(--text3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email..." style={{ width: '100%', background: '#0F0F17', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '9px 12px 9px 38px', fontFamily: 'var(--font-body)', fontSize: 13, color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                </div>

                {/* Users Table */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '30px 1fr 1fr 120px 1fr 100px 80px 60px 120px', gap: 10, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        {['#', 'NAME', 'EMAIL', 'ROLE', 'ORG', 'DISTRICT', 'ACTIVE', 'STATUS', 'ACTIONS'].map(h => <div key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', letterSpacing: '0.08em' }}>{h}</div>)}
                    </div>
                    {filtered.map((u, i) => {
                        const RoleIcon = roleIcons[u.role]; const rc = roleColors[u.role]; const ini = u.name.split(' ').map(n => n[0]).join(''); return (
                            <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '30px 1fr 1fr 120px 1fr 100px 80px 60px 120px', gap: 10, alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>{i + 1}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: `${rc}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 11, color: rc, flexShrink: 0 }}>{ini}</div>
                                    <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 13, color: '#fff' }}>{u.name}</div>
                                </div>
                                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)' }}>{u.email}</div>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: `${rc}15`, border: `1px solid ${rc}40`, borderRadius: 100, padding: '2px 8px', fontFamily: 'var(--font-mono)', fontSize: 9, color: rc }}><RoleIcon size={10} />{u.role}</span>
                                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)' }}>-</div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>-</div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>{timeAgo(u.created_at)}</div>
                                <span style={{
    background: 'rgba(34,197,94,0.1)',
    border: '1px solid rgba(34,197,94,0.25)',
    borderRadius: 100,
    padding: '2px 8px',
    fontFamily: 'var(--font-mono)',
    fontSize: 9,
    color: '#22c55e'
}}>
    {u.status?.toUpperCase()}
</span>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text3)' }}>Edit</button>
                                    <button style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text3)' }}>Reset</button>
                                </div>
                            </div>
                        );
                    })}
                </motion.div>
            </div>
        </AdminLayout>
    );
}
