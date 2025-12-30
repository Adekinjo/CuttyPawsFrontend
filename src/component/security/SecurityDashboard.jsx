import  { useState, useEffect } from 'react';
import ApiService from '../../service/SecurityService';

const SecurityDashboard = () => {
    const [events, setEvents] = useState([]);
    const [maliciousUsers, setMaliciousUsers] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        try {
            const [eventsData, usersData] = await Promise.all([
                ApiService.getSecurityEvents(),
                ApiService.getMaliciousUsers()
            ]);
            setEvents(eventsData);
            setMaliciousUsers(usersData);
        } catch (error) {
            console.error('Failed to load security data:', error);
        }
    };

    const showEventDetails = (event) => {
        setSelectedEvent(event);
    };

    const formatDateTime = (timestamp) => {
        return new Date(timestamp).toLocaleString();
    };

    const getEventSeverity = (eventType) => {
        if (eventType.includes('SQL') || eventType.includes('XSS')) return 'critical';
        if (eventType.includes('MALICIOUS')) return 'high';
        return 'medium';
    };

    return (
        <div className="container-fluid py-4">
            <div className="row">
                <div className="col-12">
                    <h1 className="h3 mb-4">
                        <i className="fas fa-shield-alt text-danger me-2"></i>
                        Security Dashboard - Complete Attack Monitoring
                    </h1>

                    {/* Event Details Modal */}
                    {selectedEvent && (
                        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                            <div className="modal-dialog modal-lg">
                                <div className="modal-content">
                                    <div className="modal-header bg-dark text-white">
                                        <h5 className="modal-title">
                                            🚨 Attack Details - {selectedEvent.eventType}
                                        </h5>
                                        <button type="button" className="btn-close btn-close-white" 
                                                onClick={() => setSelectedEvent(null)}></button>
                                    </div>
                                    <div className="modal-body">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <h6>📋 Attack Information</h6>
                                                <p><strong>Type:</strong> {selectedEvent.eventType}</p>
                                                <p><strong>Time:</strong> {formatDateTime(selectedEvent.timestamp)}</p>
                                                <p><strong>Description:</strong> {selectedEvent.description}</p>
                                            </div>
                                            <div className="col-md-6">
                                                <h6>👤 Attacker Identity</h6>
                                                <p><strong>Email:</strong> {selectedEvent.userEmail}</p>
                                                <p><strong>IP Address:</strong> <code>{selectedEvent.ipAddress}</code></p>
                                                <p><strong>Location:</strong> {selectedEvent.city}, {selectedEvent.country}</p>
                                                <p><strong>ISP:</strong> {selectedEvent.isp}</p>
                                            </div>
                                        </div>
                                        <div className="mt-3 p-3 bg-light rounded">
                                            <h6>🔍 Full Context</h6>
                                            <small className="text-muted">
                                                {selectedEvent.description}
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security Events Table */}
                    <div className="card">
                        <div className="card-header bg-white">
                            <h5 className="card-title mb-0">
                                <i className="fas fa-list-alt me-2"></i>
                                All Security Events ({events.length})
                            </h5>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>Time</th>
                                            <th>Type</th>
                                            <th>Attacker</th>
                                            <th>IP Address</th>
                                            <th>Location</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {events.map(event => (
                                            <tr key={event.id} className={`${getEventSeverity(event.eventType) === 'critical' ? 'table-danger' : ''}`}>
                                                <td>
                                                    <small>{formatDateTime(event.timestamp)}</small>
                                                </td>
                                                <td>
                                                    <span className={`badge ${
                                                        getEventSeverity(event.eventType) === 'critical' ? 'bg-danger' :
                                                        getEventSeverity(event.eventType) === 'high' ? 'bg-warning' : 'bg-info'
                                                    }`}>
                                                        {event.eventType}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div>
                                                        <strong>{event.userEmail}</strong>
                                                        <br/>
                                                        <small className="text-muted">
                                                            {event.userEmail === 'unknown' ? 'External Attacker' : 'Registered User'}
                                                        </small>
                                                    </div>
                                                </td>
                                                <td>
                                                    <code>{event.ipAddress}</code>
                                                </td>
                                                <td>
                                                    <small>
                                                        {event.city}, {event.country}
                                                        <br/>
                                                        <span className="text-muted">{event.isp}</span>
                                                    </small>
                                                </td>
                                                <td>
                                                    <button 
                                                        className="btn btn-sm btn-outline-primary me-1"
                                                        onClick={() => showEventDetails(event)}
                                                    >
                                                        <i className="fas fa-search me-1"></i>Details
                                                    </button>
                                                    <button 
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => ApiService.blockIp(event.ipAddress).then(loadAllData)}
                                                    >
                                                        <i className="fas fa-ban me-1"></i>Block IP
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Malicious Users Section */}
                    <div className="card mt-4">
                        <div className="card-header bg-white">
                            <h5 className="card-title mb-0">
                                <i className="fas fa-user-shield me-2"></i>
                                Malicious Users ({maliciousUsers.length})
                            </h5>
                        </div>
                        <div className="card-body">
                            {maliciousUsers.length > 0 ? (
                                <div className="row">
                                    {maliciousUsers.map((user, index) => (
                                        <div key={index} className="col-md-6 col-lg-4 mb-3">
                                            <div className={`card ${user.isRegistered ? 'border-danger' : 'border-warning'}`}>
                                                <div className={`card-header ${user.isRegistered ? 'bg-danger' : 'bg-warning'} text-white`}>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <h6 className="mb-0">
                                                                <i className="fas fa-envelope me-2"></i>
                                                                {user.email}
                                                            </h6>
                                                            <small>
                                                                {user.isRegistered ? '🔴 Registered User' : '🟡 External Attacker'}
                                                            </small>
                                                        </div>
                                                        <span className="badge bg-dark">{user.riskLevel}/10 Risk</span>
                                                    </div>
                                                </div>
                                                <div className="card-body">
                                                    {user.isRegistered && (
                                                        <div className="mb-2">
                                                            <strong>User Details:</strong>
                                                            <br/>
                                                            <small>Name: {user.userName}</small>
                                                            <br/>
                                                            <small>Role: {user.userRole}</small>
                                                        </div>
                                                    )}
                                                    <div className="row text-center mb-2">
                                                        <div className="col-6">
                                                            <div className="h5 text-danger">{user.eventCount}</div>
                                                            <small className="text-muted">Events</small>
                                                        </div>
                                                        <div className="col-6">
                                                            <div className="h5 text-warning">{user.ipCount}</div>
                                                            <small className="text-muted">IPs Used</small>
                                                        </div>
                                                    </div>
                                                    <div className="mb-2">
                                                        <strong>IP Addresses:</strong>
                                                        <div className="mt-1">
                                                            {Array.from(user.ipAddresses || []).map((ip, ipIndex) => (
                                                                <span key={ipIndex} className="badge bg-light text-dark border me-1 mb-1">
                                                                    <code>{ip}</code>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <button 
                                                        className="btn btn-warning btn-sm w-100"
                                                        onClick={() => ApiService.blockAllUserIps(user.email).then(loadAllData)}
                                                    >
                                                        <i className="fas fa-ban me-1"></i>
                                                        Block All IPs
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <i className="fas fa-check-circle fa-3x text-success mb-3"></i>
                                    <h5 className="text-muted">No malicious users detected</h5>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecurityDashboard;


