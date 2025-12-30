import React, { useEffect, useState } from "react";
import ApiService from "../../service/CacheService";
import { toast } from "react-toastify";
import { 
  FaSync, FaDatabase, FaCheckCircle, FaExclamationTriangle, 
  FaTrash, FaInfoCircle, FaBroom, FaRedo, FaSignal,
  FaMemory, FaClock, FaPercentage, FaPlay, FaChartLine,
  FaHeart, FaRocket, FaCog, FaExclamationCircle
} from "react-icons/fa";

const CacheController = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    loadCacheDashboard();
  }, []);

  const loadCacheDashboard = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getCacheDashboard();
      setDashboardData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("❌ Failed to load cache dashboard:", error);
      toast.error("Failed to load cache dashboard");
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async (cacheName) => {
    try {
      const result = await ApiService.clearCache(cacheName);
      toast.success(result.message);
      await loadCacheDashboard();
    } catch (error) {
      console.error(`❌ Failed to clear cache ${cacheName}:`, error);
      toast.error("Failed to clear cache");
    }
  };

  const clearAllCaches = async () => {
    try {
      const result = await ApiService.clearAllCaches();
      toast.success(result.message);
      await loadCacheDashboard();
    } catch (error) {
      console.error("❌ Failed to clear all caches:", error);
      toast.error("Failed to clear all caches");
    }
  };

  const resetStats = async () => {
    try {
      const result = await ApiService.resetCacheStats();
      toast.success(result.message);
      await loadCacheDashboard();
    } catch (error) {
      console.error("❌ Failed to reset stats:", error);
      toast.error("Failed to reset statistics");
    }
  };

  const generateActivity = async () => {
    try {
      const result = await ApiService.generateCacheActivity();
      toast.success(result.message);
      await loadCacheDashboard();
    } catch (error) {
      console.error("❌ Failed to generate activity:", error);
      toast.error("Failed to generate cache activity");
    }
  };

  const getHealthConfig = (health) => {
    const configs = {
      EXCELLENT: { color: "success", icon: FaRocket, bg: "bg-success", text: "text-success", display: "EXCELLENT" },
      GOOD: { color: "info", icon: FaCheckCircle, bg: "bg-info", text: "text-info", display: "GOOD" },
      FAIR: { color: "warning", icon: FaExclamationTriangle, bg: "bg-warning", text: "text-warning", display: "FAIR" },
      POOR: { color: "danger", icon: FaExclamationCircle, bg: "bg-danger", text: "text-danger", display: "POOR" },
      CRITICAL: { color: "dark", icon: FaHeart, bg: "bg-dark", text: "text-dark", display: "CRITICAL" },
      IDLE: { color: "secondary", icon: FaInfoCircle, bg: "bg-secondary", text: "text-secondary", display: "IDLE" },
      LOW_USAGE: { color: "primary", icon: FaSignal, bg: "bg-primary", text: "text-primary", display: "LOW USAGE" }
    };
    return configs[health] || configs.IDLE;
  };

  const getHealthBadge = (health) => {
    const { color, icon: Icon, display } = getHealthConfig(health);
    return (
      <span className={`badge bg-${color} d-flex align-items-center`}>
        <Icon className="me-1" size={12} />
        {display}
      </span>
    );
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime || dateTime === "Never") return "Never";
    return new Date(dateTime).toLocaleString();
  };

  if (!dashboardData) {
    return (
      <div className="container-fluid p-4">
        <div className="d-flex justify-content-center align-items-center min-vh-50">
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" style={{width: '3rem', height: '3rem'}}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <h5 className="text-muted">Loading Cache Dashboard...</h5>
          </div>
        </div>
      </div>
    );
  }

  const { system, caches, redis, timestamp } = dashboardData;

  return (
    <div className="container-fluid p-4">
      {/* Header Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <div className="d-flex align-items-center">
                    <div className="bg-primary rounded-circle p-3 me-3">
                      <FaDatabase className="text-white" size={28} />
                    </div>
                    <div>
                      <h1 className="h3 mb-1 fw-bold text-dark">Redis Cache Management</h1>
                      <p className="text-muted mb-0">
                        Real-time monitoring and management of application cache performance
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 text-end">
                  <button 
                    className="btn btn-primary btn-lg px-4"
                    onClick={loadCacheDashboard}
                    disabled={loading}
                  >
                    <FaSync className={`me-2 ${loading ? 'fa-spin' : ''}`} />
                    {loading ? "Refreshing..." : "Refresh"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Redis Connection Status */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm border-success">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <div className="d-flex align-items-center mb-2">
                    <FaSignal className="text-success me-2" size={20} />
                    <h5 className="card-title mb-0 text-success">Redis Connection</h5>
                  </div>
                  <div className="ms-4">
                    <h4 className="text-success mb-1">{redis.status}</h4>
                    <p className="text-muted mb-1">
                      {redis.status === 'CONNECTED' ? 'Redis is operating normally' : redis.message}
                    </p>
                    {redis.ping && (
                      <span className="badge bg-light text-dark">
                        <strong>Ping:</strong> {redis.ping}
                      </span>
                    )}
                  </div>
                </div>
                <div className="col-md-4 text-end">
                  <div className="text-muted">
                    <small className="d-block">Last Updated</small>
                    <small>{lastUpdated ? lastUpdated.toLocaleString() : 'Never'}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="row mb-4">
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card text-white bg-primary h-100 shadow-sm border-0">
            <div className="card-body text-center p-4">
              <FaMemory size={40} className="mb-3 opacity-75" />
              <h2 className="card-title display-6 mb-2">{system.totalCaches}</h2>
              <p className="card-text mb-0 opacity-75 fs-6">Total Caches</p>
            </div>
          </div>
        </div>
        
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card text-white bg-success h-100 shadow-sm border-0">
            <div className="card-body text-center p-4">
              <FaCheckCircle size={40} className="mb-3 opacity-75" />
              <h2 className="card-title display-6 mb-2">{system.totalHits.toLocaleString()}</h2>
              <p className="card-text mb-0 opacity-75 fs-6">Total Hits</p>
            </div>
          </div>
        </div>
        
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card text-white bg-warning h-100 shadow-sm border-0">
            <div className="card-body text-center p-4">
              <FaExclamationTriangle size={40} className="mb-3 opacity-75" />
              <h2 className="card-title display-6 mb-2">{system.totalMisses.toLocaleString()}</h2>
              <p className="card-text mb-0 opacity-75 fs-6">Total Misses</p>
            </div>
          </div>
        </div>
        
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card text-white bg-info h-100 shadow-sm border-0">
            <div className="card-body text-center p-4">
              <FaPercentage size={40} className="mb-3 opacity-75" />
              <h2 className="card-title display-6 mb-2">{system.overallHitRate}%</h2>
              <p className="card-text mb-0 opacity-75 fs-6">Overall Hit Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Health Distribution */}
      {system.healthDistribution && Object.keys(system.healthDistribution).length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="mb-0 d-flex align-items-center">
                  <FaHeart className="me-2 text-primary" />
                  Cache Health Distribution
                </h5>
              </div>
              <div className="card-body">
                <div className="row justify-content-center g-3">
                  {Object.entries(system.healthDistribution).map(([health, count]) => {
                    const { bg, icon: Icon, display } = getHealthConfig(health);
                    return (
                      <div key={health} className="col-xl-2 col-lg-3 col-md-4 col-sm-6">
                        <div className={`card border-0 ${bg} text-white text-center h-100`}>
                          <div className="card-body py-4">
                            <Icon size={28} className="mb-3" />
                            <h3 className="mb-2">{count}</h3>
                            <small className="opacity-75 fw-medium">{display}</small>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="mb-0 d-flex align-items-center">
                <FaCog className="me-2 text-primary" />
                Cache Management Actions
              </h5>
            </div>
            <div className="card-body">
              <div className="d-flex flex-wrap gap-3 justify-content-center">
                <button className="btn btn-danger btn-lg px-4 py-3" onClick={clearAllCaches}>
                  <FaBroom className="me-2" />
                  Clear All Caches
                </button>
                <button className="btn btn-warning btn-lg px-4 py-3" onClick={resetStats}>
                  <FaRedo className="me-2" />
                  Reset Statistics
                </button>
                <button className="btn btn-success btn-lg px-4 py-3" onClick={generateActivity}>
                  <FaPlay className="me-2" />
                  Generate Activity
                </button>
                <button className="btn btn-info btn-lg px-4 py-3" onClick={loadCacheDashboard}>
                  <FaSync className="me-2" />
                  Refresh Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cache Details Table */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="mb-0 d-flex align-items-center">
                <FaDatabase className="me-2 text-primary" />
                Cache Details
              </h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Cache Name</th>
                      <th>Health Status</th>
                      <th>Hits</th>
                      <th>Misses</th>
                      <th>Hit Rate</th>
                      <th>Last Access</th>
                      <th>Last Update</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(caches).map(([cacheName, cache]) => (
                      <tr key={cacheName} className="align-middle">
                        <td className="ps-4">
                          <div>
                            <strong className="text-dark">{cacheName}</strong>
                            <br />
                            <small className="text-muted">
                              {cache.active ? "🟢 Active" : "🔴 Inactive"}
                            </small>
                          </div>
                        </td>
                        <td>{getHealthBadge(cache.healthStatus)}</td>
                        <td>
                          <span className="text-success fw-bold fs-6">{cache.hits.toLocaleString()}</span>
                        </td>
                        <td>
                          <span className="text-danger fw-bold fs-6">{cache.misses.toLocaleString()}</span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="progress flex-grow-1 me-2" style={{height: '10px', minWidth: '80px'}}>
                              <div 
                                className={`progress-bar ${getHealthConfig(cache.healthStatus).bg}`}
                                style={{width: `${Math.min(cache.hitRate, 100)}%`}}
                                role="progressbar"
                              ></div>
                            </div>
                            <span className="fw-bold text-dark" style={{minWidth: '50px'}}>
                              {cache.hitRate}%
                            </span>
                          </div>
                        </td>
                        <td>
                          <small className="text-muted">
                            <FaClock className="me-1" />
                            {formatDateTime(cache.lastAccess)}
                          </small>
                        </td>
                        <td>
                          <small className="text-muted">
                            <FaSync className="me-1" />
                            {formatDateTime(cache.lastUpdate)}
                          </small>
                        </td>
                        <td className="text-center">
                          <button 
                            className="btn btn-outline-danger btn-sm px-3"
                            onClick={() => clearCache(cacheName)}
                            title={`Clear ${cacheName} cache`}
                          >
                            <FaTrash className="me-1" />
                            Clear
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="text-center text-muted small p-3 border-top">
            <strong>Last system update:</strong> {formatDateTime(timestamp)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CacheController;