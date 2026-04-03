import React, { useEffect, useMemo, useState } from "react";
import ApiService from "../../service/CacheService";
import FeedService from "../../service/FeedService";
import { toast } from "react-toastify";
import {
  FaSync, FaDatabase, FaCheckCircle, FaExclamationTriangle,
  FaTrash, FaInfoCircle, FaBroom, FaRedo, FaSignal,
  FaMemory, FaClock, FaPercentage, FaPlay, FaHeart,
  FaRocket, FaCog, FaExclamationCircle, FaToggleOn, FaToggleOff,
  FaStream, FaCommentDots, FaPaw, FaThumbsUp
} from "react-icons/fa";

const CacheController = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [cacheHealthData, setCacheHealthData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loadError, setLoadError] = useState("");

  // NEW: caching toggle status
  const [cacheToggle, setCacheToggle] = useState(null); // { caching: "ENABLED" | "DISABLED" }
  const [toggleLoading, setToggleLoading] = useState(false);

  useEffect(() => {
    bootstrapLoad();
  }, []);

  const bootstrapLoad = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [dash, toggle, health] = await Promise.all([
        ApiService.getCacheDashboard(),
        ApiService.cacheToggleStatus(),
        ApiService.getCacheHealth().catch(() => null)
      ]);
      setDashboardData(dash);
      setCacheToggle(toggle);
      setCacheHealthData(health);
      setLastUpdated(new Date());
    } catch (e) {
      console.error("❌ Failed to load cache dashboard:", e);
      setLoadError("Failed to load cache dashboard data. Check the backend cache endpoints and try again.");
      toast.error("Failed to load cache dashboard");
    } finally {
      setLoading(false);
    }
  };

  const loadCacheDashboard = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [data, health] = await Promise.all([
        ApiService.getCacheDashboard(),
        ApiService.getCacheHealth().catch(() => null)
      ]);
      setDashboardData(data);
      setCacheHealthData(health);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("❌ Failed to load cache dashboard:", error);
      setLoadError("Failed to refresh cache dashboard data.");
      toast.error("Failed to load cache dashboard");
    } finally {
      setLoading(false);
    }
  };

  const refreshToggleStatus = async () => {
    try {
      const toggle = await ApiService.cacheToggleStatus();
      setCacheToggle(toggle);
    } catch (e) {
      console.error("❌ Failed to load cache toggle status:", e);
      toast.error("Failed to load cache toggle status");
    }
  };

  const setCachingEnabled = async (enabled) => {
    setToggleLoading(true);
    try {
      const result = enabled
        ? await ApiService.enableCaching()
        : await ApiService.disableCaching();

      toast.success(`Caching ${enabled ? "enabled" : "disabled"} successfully`);
      setCacheToggle(result);
      await loadCacheDashboard(); // refresh stats view too
    } catch (e) {
      console.error("❌ Toggle caching failed:", e);
      toast.error("Failed to toggle caching");
    } finally {
      setToggleLoading(false);
    }
  };

  const clearCache = async (cacheName) => {
    try {
      const normalizedCacheName = String(cacheName || "").toLowerCase();
      const result = normalizedCacheName === "mixed-feed"
        ? await FeedService.clearMixedFeedCache()
        : await ApiService.clearCache(cacheName);

      toast.success(result.message || "Cache cleared");
      await loadCacheDashboard();
    } catch (error) {
      console.error(`❌ Failed to clear cache ${cacheName}:`, error);
      toast.error("Failed to clear cache");
    }
  };

  const clearAllCaches = async () => {
    try {
      const result = await ApiService.clearAllCaches();
      toast.success(result.message || "All caches cleared");
      await loadCacheDashboard();
    } catch (error) {
      console.error("❌ Failed to clear all caches:", error);
      toast.error("Failed to clear all caches");
    }
  };

  const resetStats = async () => {
    try {
      const result = await ApiService.resetCacheStats();
      toast.success(result.message || "Statistics reset");
      await loadCacheDashboard();
    } catch (error) {
      console.error("❌ Failed to reset stats:", error);
      toast.error("Failed to reset statistics");
    }
  };

  const generateActivity = async () => {
    try {
      const result = await ApiService.generateCacheActivity();
      toast.success(result.message || "Activity generated");
      await loadCacheDashboard();
    } catch (error) {
      console.error("❌ Failed to generate activity:", error);
      toast.error("Failed to generate cache activity");
    }
  };

  const clearMixedFeedCache = async () => {
    await clearCache("mixed-feed");
  };

  const getHealthConfig = (health) => {
    const configs = {
      EXCELLENT: { color: "success", icon: FaRocket, bg: "bg-success", display: "EXCELLENT" },
      GOOD: { color: "info", icon: FaCheckCircle, bg: "bg-info", display: "GOOD" },
      FAIR: { color: "warning", icon: FaExclamationTriangle, bg: "bg-warning", display: "FAIR" },
      POOR: { color: "danger", icon: FaExclamationCircle, bg: "bg-danger", display: "POOR" },
      CRITICAL: { color: "dark", icon: FaHeart, bg: "bg-dark", display: "CRITICAL" },
      IDLE: { color: "secondary", icon: FaInfoCircle, bg: "bg-secondary", display: "IDLE" },
      LOW_USAGE: { color: "primary", icon: FaSignal, bg: "bg-primary", display: "LOW USAGE" }
    };
    return configs[health] || configs.IDLE;
  };

  const getHealthBadge = (health) => {
    const { color, icon: Icon, display } = getHealthConfig(health);
    return (
      <span className={`badge bg-${color} d-inline-flex align-items-center gap-1 px-2 py-2`}>
        <Icon size={12} />
        <span className="fw-semibold">{display}</span>
      </span>
    );
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime || dateTime === "Never") return "Never";
    const parsed = new Date(dateTime);
    return Number.isNaN(parsed.getTime()) ? String(dateTime) : parsed.toLocaleString();
  };

  const cachingEnabled = useMemo(() => {
    return (cacheToggle?.caching || "").toUpperCase() === "ENABLED";
  }, [cacheToggle]);

  const safeDashboard = useMemo(() => {
    const emptySystem = {
      totalCaches: 0,
      totalHits: 0,
      totalMisses: 0,
      overallHitRate: 0,
    };

    return {
      system: dashboardData?.system || emptySystem,
      caches: dashboardData?.caches || {},
      redis: dashboardData?.redis || { status: "UNKNOWN", message: "Redis health is unavailable" },
      timestamp: dashboardData?.timestamp || null,
    };
  }, [dashboardData]);

  const socialCacheDefinitions = useMemo(() => ([
    { id: "post", label: "Post Cache", description: "Post details and feed reads", icon: FaStream, matches: ["postcache", "post", "posts"] },
    { id: "postlike", label: "Post Like Cache",description: "Post reaction and like counters",icon: FaThumbsUp, matches: ["postreactions", "userpostreaction","userlikedposts", "reaction"]},
    { id: "comment", label: "Comment Cache", description: "Comment thread and reply reads", icon: FaCommentDots, matches: ["commentcache", "comment", "comments"] },
    { id: "commentlike", label: "Comment Like Cache", description: "Comment reaction counters", icon: FaHeart, matches: ["commentlike", "commentlikes", "comment-reaction", "commentreaction"] },
    { id: "pet", label: "Pet Cache", description: "Pet profile and listing reads", icon: FaPaw, matches: ["petcache", "pet", "pets"] },
    { id: "mixedfeed", label: "Mixed Feed Cache", description: "Combined mixed-feed payloads for the home timeline", icon: FaStream, matches: ["mixedfeed", "mixed-feed"] },
  ]), []);

  const normalizedCacheEntries = useMemo(() => {
    return Object.entries(safeDashboard.caches).map(([cacheName, cache]) => ({
      cacheName,
      normalized: cacheName.toLowerCase().replace(/[^a-z0-9]/g, ""),
      cache: cache || {},
    }));
  }, [safeDashboard.caches]);

  const socialCacheCards = useMemo(() => {
    return socialCacheDefinitions.map((definition) => {
      const matchedEntry = normalizedCacheEntries.find(({ normalized }) =>
        definition.matches.some((token) => normalized.includes(token))
      );

      const healthRecord = cacheHealthData?.[matchedEntry?.cacheName] || cacheHealthData?.[definition.id] || null;
      const mergedCache = matchedEntry?.cache || {};
      const healthStatus = healthRecord?.healthStatus || mergedCache.healthStatus || (matchedEntry ? "IDLE" : "UNKNOWN");

      return {
        ...definition,
        cacheName: matchedEntry?.cacheName || "Not detected",
        healthStatus,
        active: typeof mergedCache.active === "boolean" ? mergedCache.active : Boolean(matchedEntry),
        hits: Number(healthRecord?.hits ?? mergedCache.hits ?? 0),
        misses: Number(healthRecord?.misses ?? mergedCache.misses ?? 0),
        hitRate: Math.min(Number(healthRecord?.hitRate ?? mergedCache.hitRate ?? 0), 100),
        lastAccess: healthRecord?.lastAccess ?? mergedCache.lastAccess ?? "Never",
        lastUpdate: healthRecord?.lastUpdate ?? mergedCache.lastUpdate ?? "Never",
      };
    });
  }, [cacheHealthData, normalizedCacheEntries, socialCacheDefinitions]);

  if (!dashboardData && loading) {
    return (
      <div className="container-fluid p-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" style={{ width: "3rem", height: "3rem" }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <h5 className="text-muted mb-0">Loading Cache Dashboard...</h5>
          </div>
        </div>
      </div>
    );
  }

  const { system, caches, redis, timestamp } = safeDashboard;

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-primary rounded-circle p-3">
                    <FaDatabase className="text-white" size={28} />
                  </div>
                  <div>
                    <h1 className="h4 fw-bold mb-1">Redis Cache Management</h1>
                    <div className="text-muted">
                      Monitor cache hit/miss performance, clear caches, and toggle caching in production.
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={refreshToggleStatus}
                    disabled={toggleLoading}
                    title="Refresh toggle status"
                  >
                    <FaSync className={toggleLoading ? "fa-spin" : ""} />
                  </button>

                  <button
                    className={`btn ${cachingEnabled ? "btn-danger" : "btn-success"} px-4`}
                    onClick={() => setCachingEnabled(!cachingEnabled)}
                    disabled={toggleLoading}
                    title="Toggle caching"
                  >
                    {toggleLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Updating...
                      </>
                    ) : (
                      <>
                        {cachingEnabled ? <FaToggleOff className="me-2" /> : <FaToggleOn className="me-2" />}
                        {cachingEnabled ? "Disable Caching" : "Enable Caching"}
                      </>
                    )}
                  </button>

                  <button
                    className="btn btn-primary px-4"
                    onClick={bootstrapLoad}
                    disabled={loading}
                  >
                    <FaSync className={`me-2 ${loading ? "fa-spin" : ""}`} />
                    {loading ? "Refreshing..." : "Refresh"}
                  </button>
                </div>
              </div>

              {/* Banner */}
              <div className={`alert mt-4 mb-0 ${cachingEnabled ? "alert-success" : "alert-warning"} d-flex align-items-center justify-content-between`}>
                <div className="d-flex align-items-center gap-2">
                  {cachingEnabled ? <FaCheckCircle /> : <FaExclamationTriangle />}
                  <div>
                    <div className="fw-bold">
                      Caching is {cachingEnabled ? "ENABLED" : "DISABLED"}
                    </div>
                    <div className="small">
                      {cachingEnabled
                        ? "Cacheable methods will use Redis and return faster responses."
                        : "All requests will bypass cache and hit the database."}
                    </div>
                  </div>
                </div>
                <div className="text-end small text-muted">
                  <div><span className="fw-semibold">Last Updated:</span> {lastUpdated ? lastUpdated.toLocaleString() : "Never"}</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {loadError && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-danger border-0 shadow-sm d-flex align-items-start gap-3">
              <FaExclamationCircle className="mt-1 flex-shrink-0" />
              <div>
                <div className="fw-bold">Cache dashboard failed to load completely</div>
                <div>{loadError}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Redis Connection */}
      <div className="row mb-4">
        <div className="col-12">
          <div className={`card shadow-sm border-2 ${redis.status === "CONNECTED" ? "border-success" : "border-danger"}`}>
            <div className="card-body p-4">
              <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <FaSignal className={redis.status === "CONNECTED" ? "text-success" : "text-danger"} size={20} />
                    <h5 className={`mb-0 ${redis.status === "CONNECTED" ? "text-success" : "text-danger"}`}>
                      Redis Connection
                    </h5>
                  </div>
                  <div className="ms-1">
                    <div className="h4 mb-1">{redis.status}</div>
                    <div className="text-muted">
                      {redis.status === "CONNECTED" ? "Redis is operating normally" : (redis.message || "Redis connection failed")}
                    </div>
                    {redis.ping && (
                      <span className="badge bg-light text-dark mt-2">
                        <strong>Ping:</strong> {redis.ping}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-muted text-md-end">
                  <div className="small">System Timestamp</div>
                  <div className="fw-semibold">{formatDateTime(timestamp)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Cache Health */}
      <div className="row mb-4 g-3">
        {socialCacheCards.map((cacheCard) => {
          const cfg = getHealthConfig(cacheCard.healthStatus);
          const Icon = cacheCard.icon;

          return (
            <div className="col-12 col-md-6 col-xl-4" key={cacheCard.id}>
              <div className="card shadow-sm border-0 h-100" style={{ minHeight: 220 }}>
                <div className="card-body p-4 d-flex flex-column">
                  <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                    <div className="d-flex align-items-center gap-3">
                      <div className={`rounded-circle ${cfg.bg} bg-opacity-10 d-inline-flex align-items-center justify-content-center`} style={{ width: 52, height: 52 }}>
                        <Icon className={`text-${cfg.color}`} size={22} />
                      </div>
                      <div>
                        <div className="fw-bold">{cacheCard.label}</div>
                        <div className="small text-muted">{cacheCard.description}</div>
                      </div>
                    </div>
                    {getHealthBadge(cacheCard.healthStatus)}
                  </div>

                  <div className="small text-muted mb-2">
                    <strong>Detected cache key:</strong> {cacheCard.cacheName}
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-4">
                      <div className="rounded-3 bg-light p-2 text-center h-100">
                        <div className="small text-muted">Hits</div>
                        <div className="fw-bold text-success">{cacheCard.hits.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="rounded-3 bg-light p-2 text-center h-100">
                        <div className="small text-muted">Misses</div>
                        <div className="fw-bold text-danger">{cacheCard.misses.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="rounded-3 bg-light p-2 text-center h-100">
                        <div className="small text-muted">Hit Rate</div>
                        <div className="fw-bold">{cacheCard.hitRate}%</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <div className="progress mb-3" style={{ height: 8 }}>
                      <div
                        className={`progress-bar ${cfg.bg}`}
                        style={{ width: `${cacheCard.hitRate}%` }}
                        role="progressbar"
                        aria-valuenow={cacheCard.hitRate}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      />
                    </div>
                    <div className="d-flex justify-content-between gap-3 small text-muted">
                      <span>{cacheCard.active ? "Active" : "Not active"}</span>
                      <span>Updated: {formatDateTime(cacheCard.lastUpdate)}</span>
                    </div>
                    {cacheCard.id === "mixedfeed" && cacheCard.cacheName !== "Not detected" ? (
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm mt-3 w-100"
                        onClick={() => clearCache(cacheCard.cacheName)}
                        disabled={toggleLoading}
                      >
                        <FaTrash className="me-1" />
                        Clear Mixed Feed Cache
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="row mb-4 g-3">
        <div className="col-xl-3 col-md-6">
          <div className="card text-white bg-primary h-100 shadow-sm border-0">
            <div className="card-body text-center p-4">
              <FaMemory size={40} className="mb-3 opacity-75" />
              <h2 className="display-6 mb-1">{system.totalCaches}</h2>
              <div className="opacity-75">Total Caches</div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card text-white bg-success h-100 shadow-sm border-0">
            <div className="card-body text-center p-4">
              <FaCheckCircle size={40} className="mb-3 opacity-75" />
              <h2 className="display-6 mb-1">{system.totalHits.toLocaleString()}</h2>
              <div className="opacity-75">Total Hits</div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card text-white bg-warning h-100 shadow-sm border-0">
            <div className="card-body text-center p-4">
              <FaExclamationTriangle size={40} className="mb-3 opacity-75" />
              <h2 className="display-6 mb-1">{system.totalMisses.toLocaleString()}</h2>
              <div className="opacity-75">Total Misses</div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card text-white bg-info h-100 shadow-sm border-0">
            <div className="card-body text-center p-4">
              <FaPercentage size={40} className="mb-3 opacity-75" />
              <h2 className="display-6 mb-1">{system.overallHitRate}%</h2>
              <div className="opacity-75">Overall Hit Rate</div>
            </div>
          </div>
        </div>
      </div>

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
                <button className="btn btn-outline-danger btn-lg px-4 py-3" onClick={clearMixedFeedCache}>
                  <FaTrash className="me-2" />
                  Clear Mixed Feed Cache
                </button>
                <button className="btn btn-warning btn-lg px-4 py-3" onClick={resetStats}>
                  <FaRedo className="me-2" />
                  Reset Statistics
                </button>
                <button className="btn btn-success btn-lg px-4 py-3" onClick={generateActivity}>
                  <FaPlay className="me-2" />
                  Generate Activity
                </button>
                <button className="btn btn-outline-primary btn-lg px-4 py-3" onClick={loadCacheDashboard}>
                  <FaSync className="me-2" />
                  Refresh Cache Stats
                </button>
              </div>
              <div className="text-muted small mt-3 text-center">
                Tip: If you suspect bad cache data, disable caching first, then clear caches, then enable caching again.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cache Details */}
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
                <table className="table table-hover mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Cache Name</th>
                      <th>Health</th>
                      <th>Hits</th>
                      <th>Misses</th>
                      <th style={{ width: 220 }}>Hit Rate</th>
                      <th>Last Access</th>
                      <th>Last Update</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {Object.entries(caches).length === 0 && (
                      <tr>
                        <td colSpan="8" className="text-center py-5 text-muted">
                          No cache entries were returned by the dashboard endpoint.
                        </td>
                      </tr>
                    )}

                    {Object.entries(caches).map(([cacheName, cache]) => {
                      const cfg = getHealthConfig(cache.healthStatus);
                      const hitRate = Math.min(Number(cache.hitRate || 0), 100);

                      return (
                        <tr key={cacheName}>
                          <td className="ps-4">
                            <div className="fw-bold">{cacheName}</div>
                            <div className="small text-muted">
                              {cache.active ? "🟢 Active" : "🔴 Inactive"}
                            </div>
                          </td>

                          <td>{getHealthBadge(cache.healthStatus)}</td>

                          <td className="fw-semibold text-success">
                            {Number(cache.hits || 0).toLocaleString()}
                          </td>

                          <td className="fw-semibold text-danger">
                            {Number(cache.misses || 0).toLocaleString()}
                          </td>

                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div className="progress flex-grow-1" style={{ height: 10 }}>
                                <div
                                  className={`progress-bar ${cfg.bg}`}
                                  style={{ width: `${hitRate}%` }}
                                  role="progressbar"
                                  aria-valuenow={hitRate}
                                  aria-valuemin="0"
                                  aria-valuemax="100"
                                />
                              </div>
                              <div className="fw-bold" style={{ width: 55 }}>
                                {hitRate}%
                              </div>
                            </div>
                          </td>

                          <td className="text-muted small">
                            <FaClock className="me-1" />
                            {formatDateTime(cache.lastAccess)}
                          </td>

                          <td className="text-muted small">
                            <FaSync className="me-1" />
                            {formatDateTime(cache.lastUpdate)}
                          </td>

                          <td className="text-center">
                            <button
                              className="btn btn-outline-danger btn-sm px-3"
                              onClick={() => clearCache(cacheName)}
                              disabled={toggleLoading}
                              title={`Clear ${cacheName} cache`}
                            >
                              <FaTrash className="me-1" />
                              Clear
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>

                </table>
              </div>
            </div>

            <div className="card-footer bg-white text-muted small text-center">
              <strong>Last system update:</strong> {formatDateTime(timestamp)}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CacheController;
