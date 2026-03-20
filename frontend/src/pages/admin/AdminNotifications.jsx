import { motion } from 'framer-motion';
import { Bell, Check, AlertTriangle, Info, MessageSquare } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useState, useEffect } from 'react';

const typeColor = t => t === 'CRITICAL' ? 'var(--red)' : '#3b82f6';

export default function AdminNotifications() {
    const [notifications, setNotifications] = useState([]);

useEffect(() => {
    fetch("http://localhost:5000/api/notifications")
        .then(res => res.json())
        .then(data => {
            console.log("NOTIFICATIONS:", data);
            setNotifications(data);
        })
        .catch(err => console.error(err));
}, []);
    return (
        <AdminLayout title="Notifications" page="NOTIFICATIONS">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 700, fontSize: 20, color: '#fff' }}>Notifications</div>
                        <span style={{ background: 'rgba(217,0,37,0.15)', border: '1px solid rgba(217,0,37,0.3)', borderRadius: 100, padding: '2px 10px', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--red)' }}>{notifications.length} NEW</span>
                    </div>
                    <button style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text2)' }}>Mark All Read</button>
                </div>

                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    style={{ background: '#0F0F17', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 8 }}>
                    {notifications.map((n, i) => {
                        
                        const Icon = n.type === "CRITICAL" ? AlertTriangle : Info;
                        const c = typeColor(n.type);
                        return (
                            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '18px 20px', borderBottom: i < notifications.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', borderRadius: 12, background: 'rgba(217,0,37,0.03)', cursor: 'pointer', transition: 'background 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(217,0,37,0.03)'}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${c}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                                    <Icon size={16} color={c} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                        <div style={{ fontFamily: 'var(--font-sub)', fontWeight: 600, fontSize: 14, color: '#fff' }}>{n.title}</div>
                                        {!n.read && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--red)', flexShrink: 0 }} />}
                                    </div>
                                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)', marginBottom: 4 }}>{n.message}</div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>{n.time}</div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </AdminLayout>
    );
}
