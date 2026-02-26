
// src/pages/profile/ProfilePage.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./profile.css";

import AuthService from "../../service/AuthService";
import PetService from "../../service/PetService";
import PostService from "../../service/PostService";
import WishlistService from "../../service/WishlistService";
import OrderService from "../../service/OrderService";
import FollowService from "../../service/FollowService";

import {
  FaArrowLeft,
  FaCog,
  FaEdit,
  FaCamera,
  FaMapMarkerAlt,
  FaCalendar,
  FaTh,
  FaPaw,
  FaBookmark,
  FaHeart,
  FaComment,
  FaImages,
  FaPlay
} from "react-icons/fa";
import { PawPrint } from "lucide-react";

import { formatJoined, formatLocation, toHandle } from "./uiHelper";

export default function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const qsTab = useMemo(() => new URLSearchParams(location.search).get("tab"), [location.search]);

  const [userInfo, setUserInfo] = useState(null);
  const [pets, setPets] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [orders, setOrders] = useState([]);
  const [posts, setPosts] = useState([]);

  const [activeTab, setActiveTab] = useState(qsTab || "posts");
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [followStats, setFollowStats] = useState({
    followersCount: 0,
    followingCount: 0,
    postsCount: 0
  });

  // Cover/Profile image upload (optional hooks)
  const [showProfilePicModal, setShowProfilePicModal] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [showCoverPicModal, setShowCoverPicModal] = useState(false);
  const [coverPicture, setCoverPicture] = useState(null);
  const [coverPicturePreview, setCoverPicturePreview] = useState(null);

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // sync tab from URL when user navigates settings row -> /profile?tab=wishlist
    if (qsTab) setActiveTab(qsTab);
  }, [qsTab]);

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (coverPicturePreview) URL.revokeObjectURL(coverPicturePreview);
      if (profilePicturePreview) URL.revokeObjectURL(profilePicturePreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  async function loadAll() {
    try {
      setLoading(true);
      setError("");

      const userResponse = await AuthService.getLoggedInInfo();
      const u = userResponse?.user;
      setUserInfo(u || null);

      setPets(userResponse?.petList || []);
      setWishlist(userResponse?.wishlist || []);
      setOrders(userResponse?.orderItemList || []);

      // posts separately (for better perceived perf)
      fetchMyPosts();

      fetchMyPets();

      if (u?.id) {
        try {
          const stats = await FollowService.getFollowStats(u.id);
          const followStatsData =
            stats?.followStats ||
            (stats?.status === 200 ? stats?.followStats : null);
          if (followStatsData) {
            setFollowStats({
              followersCount: followStatsData.followersCount || 0,
              followingCount: followStatsData.followingCount || 0,
              postsCount: 0
            });
          }
        } catch {
          // non-blocking
        }
      }
    } catch (e) {
      console.error(e);
      setError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchMyPosts() {
    try {
      setPostsLoading(true);
      const res = await PostService.getMyPosts();
      const list = res?.postList || res?.data || res || [];
      const transformed = Array.isArray(list)
        ? list.map((p) => ({
            id: p.id,
            image: p.imageUrls?.[0] || null,
            media: Array.isArray(p.media)
              ? p.media
                  .map((m) => ({
                    type: (m?.type || m?.mediaType || "").toUpperCase(),
                    url: m?.url || m?.mediaUrl || null,
                    thumbnailUrl: m?.thumbnailUrl || null
                  }))
                  .filter((m) => m.url)
              : [],
            likes: p.likeCount || 0,
            comments: p.totalComments || 0
          }))
        : [];
      setPosts(transformed);
      setFollowStats((prev) => ({ ...prev, postsCount: transformed.length }));
    } catch (e) {
      console.error(e);
      setPosts([]);
    } finally {
      setPostsLoading(false);
    }
  }

  async function fetchMyPets() {
  try {
    const res = await PetService.getMyPets();
    // Adjust based on your backend shape:
    const list = res?.petList || res?.pets || res?.data || res || [];
    setPets(Array.isArray(list) ? list : []);
  } catch (e) {
    console.error("Failed to load pets:", e);
    setPets([]);
  }
}


  function handleLogout() {
    if (!window.confirm("Are you sure you want to log out?")) return;
    AuthService.logout();
    navigate("/login");
  }

  function openSettings() {
    // You can route to a standalone settings page:
    navigate("/settings", { state: { from: "/profile" } });
  }

  function handleFollowersClick() {
    if (!userInfo?.id) return;
    navigate(`/customer-profile/${userInfo.id}/followers`);
  }

  function handleFollowingClick() {
    if (!userInfo?.id) return;
    navigate(`/customer-profile/${userInfo.id}/following`);
  }
  function onPickCoverFile(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    setError("Please select an image file.");
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    setError("Image size should be less than 5MB.");
    return;
  }

  setCoverPicture(file);
  setCoverPicturePreview(URL.createObjectURL(file));
  setError("");
}

  async function uploadCoverPic() {
    if (!coverPicture) return setError("Please select an image first.");

    try {
      setUploading(true);
      setError("");

      const fd = new FormData();
      fd.append("file", coverPicture);

      // ✅ correct API for cover
      await AuthService.updateCoverPicture(fd);

      setSuccess("Cover photo updated.");
      setShowCoverPicModal(false);
      setCoverPicture(null);
      setCoverPicturePreview(null);

      loadAll();
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || "Failed to update cover picture.");
    } finally {
      setUploading(false);
    }
  }


  function onPickProfileFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB.");
      return;
    }
    setProfilePicture(file);
    setProfilePicturePreview(URL.createObjectURL(file));
  }

  async function uploadProfilePic() {
    if (!profilePicture) return setError("Please select an image first.");
    try {
      setUploading(true);
      setError("");
      const fd = new FormData();
      fd.append("file", profilePicture);
      await AuthService.updateUserProfilePicture(fd);
      setSuccess("Profile picture updated.");
      setShowProfilePicModal(false);
      setProfilePicture(null);
      setProfilePicturePreview(null);
      loadAll();
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || "Failed to update profile picture.");
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <div className="cp-page d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border" role="status" style={{ color: "#FF7B54" }} />
          <div className="text-muted mt-3">Loading profile…</div>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="cp-page d-flex align-items-center justify-content-center">
        <div className="text-center">
          <h4 className="fw-bold mb-2">Unable to load profile</h4>
          <button className="btn btn-primary cp-primary-btn" onClick={loadAll}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const handle = toHandle(userInfo?.name);
  const joinedText = formatJoined(userInfo?.regDate);
  const locationText = formatLocation(userInfo?.address);

  return (
    <div className="cp-page">
      {/* Top bar */}
      <div className="cp-topbar sticky-top">
        <div className="container py-3 d-flex align-items-center justify-content-between" style={{ maxWidth: 980 }}>
          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-outline-secondary cp-icon-btn" onClick={() => navigate(-1)}>
              <FaArrowLeft />
            </button>
            <div>
              <div className="fw-bold">@{handle}</div>
              <div className="text-muted small">{posts.length} posts</div>
            </div>
          </div>

          <button className="btn btn-outline-secondary cp-icon-btn" onClick={openSettings}>
            <FaCog />
          </button>
        </div>
      </div>

      <div className="container py-4" style={{ maxWidth: 980 }}>
        {/* Alerts */}
        {success ? (
          <div className="alert alert-success alert-dismissible fade show rounded-3" role="alert">
            {success}
            <button type="button" className="btn-close" onClick={() => setSuccess("")} />
          </div>
        ) : null}
        {error ? (
          <div className="alert alert-danger alert-dismissible fade show rounded-3" role="alert">
            {error}
            <button type="button" className="btn-close" onClick={() => setError("")} />
          </div>
        ) : null}

        {/* Cover */}
          <div className="cp-cover mb-4">
            {userInfo?.coverImageUrl ? (
              <img src={userInfo.coverImageUrl} alt="Cover" />
            ) : null}

            <button
              type="button"
              className="btn cp-edit-cover d-flex align-items-center gap-2"
              onClick={() => {
                setShowCoverPicModal(true);
                setError("");
                setSuccess("");
              }}
            >
              <FaEdit />
              <span className="d-none d-md-inline fw-semibold">Edit Cover</span>
            </button>
          </div>
          {showCoverPicModal && (
          <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 rounded-4">
                <div className="modal-header border-0">
                  <h5 className="modal-title fw-bold">Update Cover Photo</h5>
                  <button className="btn-close" onClick={() => setShowCoverPicModal(false)} />
                </div>

                <div className="modal-body p-4">
                  {/* Cover preview (keeps cover proportions like social apps) */}
                  <div className="mb-3 rounded-4 overflow-hidden" style={{ height: 180, background: "#f3f4f6" }}>
                    <img
                      src={
                        coverPicturePreview ||
                        userInfo?.coverImageUrl ||
                        "https://via.placeholder.com/1200x500"
                      }
                      alt="Cover preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>

                  <label className="form-label fw-bold">Choose image</label>
                  <input
                    className="form-control rounded-3"
                    type="file"
                    accept="image/*"
                    onChange={onPickCoverFile}
                  />
                  <div className="text-muted small mt-2">
                    Recommended: wide image (e.g., 1500×600). Max size: 5MB.
                  </div>

                  {/* Error inside modal (optional) */}
                  {error ? (
                    <div className="alert alert-danger py-2 rounded-3 mt-3 mb-0">
                      <small>{error}</small>
                    </div>
                  ) : null}

                  <div className="d-flex gap-2 mt-3">
                    <button
                      className="btn btn-primary flex-grow-1 rounded-3"
                      style={{ backgroundColor: "#FF7B54", borderColor: "#FF7B54" }}
                      disabled={!coverPicture || uploading}
                      onClick={uploadCoverPic}
                    >
                      {uploading ? "Uploading…" : "Upload Cover"}
                    </button>
                    <button
                      className="btn btn-outline-secondary rounded-3"
                      onClick={() => setShowCoverPicModal(false)}
                      disabled={uploading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}



        {/* Avatar + actions */}
        <div className="cp-avatar-wrap">
          <div className="d-flex align-items-end gap-3">
            <div className="cp-avatar" onClick={() => setShowProfilePicModal(true)}>
              {userInfo?.profileImageUrl ? (
                <img
                  src={userInfo.profileImageUrl}
                  alt="Avatar"
                />
              ) : (
                <div className="cp-avatar-default" aria-label="Default profile picture">
                  <PawPrint size={36} strokeWidth={2.2} />
                </div>
              )}
              <div className="cp-avatar-camera">
                <FaCamera size={14} />
              </div>
            </div>

            {/* Mobile-like stats beside avatar (matches your mockup vibe) */}
            <div className="cp-stats-row">
              <div className="cp-stat">
                <div className="num">{followStats.postsCount || posts.length}</div>
                <div className="label">Posts</div>
              </div>
              <div className="cp-stat" role="button" tabIndex={0} onClick={handleFollowersClick}>
                <div className="num">{followStats.followersCount}</div>
                <div className="label">Followers</div>
              </div>
              <div className="cp-stat" role="button" tabIndex={0} onClick={handleFollowingClick}>
                <div className="num">{followStats.followingCount}</div>
                <div className="label">Following</div>
              </div>
            </div>
          </div>
        </div>

        {/* Name + bio + meta */}
        <div className="mt-4 pb-3 border-bottom" style={{ borderColor: "#e5e7eb" }}>
          <h2 className="fw-bold mb-2">{userInfo?.name}</h2>

          {userInfo?.bio ? <div className="cp-bio mb-3">{userInfo.bio}</div> : null}

          <div className="cp-meta">
            {locationText ? (
              <span className="d-flex align-items-center gap-2">
                <FaMapMarkerAlt /> {locationText}
              </span>
            ) : null}
            <span className="d-flex align-items-center gap-2">
              <FaCalendar /> {joinedText}
            </span>
          </div>
        </div>

        {/* Tabs (icon row like mockup) */}
        <div className="cp-tabs">
          <button className={`cp-tab ${activeTab === "posts" ? "active" : ""}`} onClick={() => setActiveTab("posts")}>
            <FaTh /> Posts
          </button>
          <button className={`cp-tab ${activeTab === "pets" ? "active" : ""}`} onClick={() => setActiveTab("pets")}>
            <FaPaw /> Pets
          </button>
          <button className={`cp-tab ${activeTab === "saved" ? "active" : ""}`} onClick={() => setActiveTab("saved")}>
            <FaBookmark /> Saved
          </button>
        </div>

        {/* Content */}
        {activeTab === "posts" && (
          <>
            {postsLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border" role="status" style={{ color: "#FF7B54" }} />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-5">
                <div className="text-muted mb-2">No posts yet</div>
                <button className="btn btn-primary cp-primary-btn" onClick={() => navigate("/create-post")}>
                  Create your first post
                </button>
              </div>
            ) : (
              <div className="cp-grid">
                {posts.map((p) => (
                  <div
                    key={p.id}
                    className="cp-grid-card"
                    role="button"
                    tabIndex={0}
                    aria-label="Open post details"
                    onClick={() => navigate(`/post/${p.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate(`/post/${p.id}`);
                      }
                    }}
                  >
                    {(() => {
                      const firstMedia = p.media?.[0];
                      const isVideo = firstMedia?.type === "VIDEO";
                      const videoUrl = isVideo ? firstMedia?.url : null;
                      const videoPoster = isVideo ? firstMedia?.thumbnailUrl : null;
                      const imageUrl = !isVideo ? (firstMedia?.url || p.image) : p.image;

                      if (isVideo && videoUrl) {
                        return (
                          <>
                            <video
                              src={videoUrl}
                              poster={videoPoster || undefined}
                              className="cp-grid-video"
                              muted
                              playsInline
                              preload="metadata"
                            />
                            <div className="cp-grid-video-badge">
                              <FaPlay size={12} />
                            </div>
                          </>
                        );
                      }

                      if (imageUrl) {
                        return <img src={imageUrl} alt="post" />;
                      }

                      return (
                        <div className="cp-grid-fallback w-100 h-100 d-flex align-items-center justify-content-center">
                          <FaImages className="text-muted" size={22} />
                        </div>
                      );
                    })()}
                    <div className="cp-grid-overlay">
                      <div className="cp-grid-metric">
                        <FaHeart /> {p.likes}
                      </div>
                      <div className="cp-grid-metric">
                        <FaComment /> {p.comments}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "pets" && (
          <div className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">My Pets</h5>
              <button className="btn btn-primary cp-primary-btn" onClick={() => navigate("/add-pet")}>
                Add Pet
              </button>
            </div>

            {pets.length === 0 ? (
              <div className="text-center py-5 text-muted">No pets yet. Add your first pet.</div>
            ) : (
              <div className="row g-3">
                {pets.map((pet) => (
                  <div key={pet.id} className="col-12 col-md-6">
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                      <div className="card-body d-flex gap-3">
                        <img
                          src={pet.imageUrls?.[0] || "https://via.placeholder.com/120"}
                          alt={pet.name}
                          style={{ width: 84, height: 84, borderRadius: 16, objectFit: "cover" }}
                        />
                        <div className="flex-grow-1">
                          <div className="fw-bold">{pet.name}</div>
                          <div className="text-muted small">{pet.breed}</div>
                          <div className="text-muted small mt-1">{pet.age || ""} {pet.gender ? `• ${pet.gender}` : ""}</div>

                          <div className="d-flex gap-2 mt-3">
                            <button className="btn btn-outline-secondary rounded-pill px-3" onClick={() => navigate(`/pet/${pet.id}`)}>
                              View
                            </button>
                            <button className="btn btn-primary rounded-pill px-3" style={{ backgroundColor: "#FF7B54", borderColor: "#FF7B54" }} onClick={() => navigate(`/edit-pet/${pet.id}`)}>
                              Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "saved" && (
          <div className="py-4">
            <h5 className="fw-bold mb-3">Saved</h5>
            <div className="text-muted">
              If you want this tab to show saved posts + saved products, tell me which endpoints you want here.
            </div>
          </div>
        )}
      </div>

      {/* Profile Picture Modal */}
      {showProfilePicModal && (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">Update Profile Picture</h5>
                <button className="btn-close" onClick={() => setShowProfilePicModal(false)} />
              </div>
              <div className="modal-body p-4">
                <div className="text-center mb-3">
                  {profilePicturePreview || userInfo?.profileImageUrl ? (
                    <img
                      src={profilePicturePreview || userInfo?.profileImageUrl}
                      alt="preview"
                      className="img-fluid rounded-4"
                      style={{ maxHeight: 260, objectFit: "cover" }}
                    />
                  ) : (
                    <div className="cp-profile-preview-fallback rounded-4 mx-auto">
                      <PawPrint size={44} strokeWidth={2.2} />
                    </div>
                  )}
                </div>

                <label className="form-label fw-bold">Choose image</label>
                <input className="form-control rounded-3" type="file" accept="image/*" onChange={onPickProfileFile} />

                <div className="d-flex gap-2 mt-3">
                  <button
                    className="btn btn-primary flex-grow-1 rounded-3"
                    style={{ backgroundColor: "#FF7B54", borderColor: "#FF7B54" }}
                    disabled={!profilePicture || uploading}
                    onClick={uploadProfilePic}
                  >
                    {uploading ? "Uploading…" : "Upload"}
                  </button>
                  <button className="btn btn-outline-secondary rounded-3" onClick={() => setShowProfilePicModal(false)}>
                    Cancel
                  </button>
                </div>

                <div className="d-flex justify-content-between mt-3">
                  <button className="btn btn-link text-danger p-0" onClick={handleLogout}>
                    Logout
                  </button>
                  <button className="btn btn-link text-muted p-0" onClick={() => navigate("/settings")}>
                    Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
