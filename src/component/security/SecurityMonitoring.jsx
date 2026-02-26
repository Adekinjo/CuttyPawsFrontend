
import React, { useState, useEffect } from 'react';
        import ApiService from '../../service/SecurityService';

        const SecurityMonitoring = () => {
        const [stats, setStats] = useState({
    totalEvents: 0,
            maliciousAttempts: 0,
            failedLogins: 0
});

useEffect(() => {
loadStats();
        const interval = setInterval(loadStats, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

            const loadStats = async () => {
        try {
        const events = await ApiService.getSecurityEvents();
            const malicious = events.filter(e => e.eventType.includes('MALICIOUS')).length;
            const failedLogins = events.filter(e => e.eventType.includes('FAILED')).length;

setStats({
    totalEvents: events.length,
            maliciousAttempts: malicious,
            failedLogins: failedLogins
});
        } catch (error) {
        console.error('Failed to load security stats:', error);
        }
                };

                return (
        <div style={{ padding: '20px', backgroundColor: '#f5f5f5' }}>
<h3>Live Security Monitoring</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '5px', textAlign: 'center' }}>
                    <h4 style={{ color: 'blue' }}>Total Events</h4>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalEvents}</div>
                </div>

                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '5px', textAlign: 'center' }}>
                    <h4 style={{ color: 'orange' }}>Malicious Attempts</h4>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.maliciousAttempts}</div>
                </div>

                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '5px', textAlign: 'center' }}>
                    <h4 style={{ color: 'red' }}>Failed Logins</h4>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.failedLogins}</div>
                </div>
            </div>

            <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
Last updated: {new Date().toLocaleTimeString()}
            </div>
        </div>
        );
        };

export default SecurityMonitoring;

