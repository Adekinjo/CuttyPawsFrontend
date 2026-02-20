// src/pages/user/EditProfilePage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../../service/AuthService";
import {
  FaArrowLeft,
  FaCamera,
  FaSave,
  FaTimesCircle,
  FaUser,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

export default function EditProfilePage() {
  const navigate = useNavigate();

  // loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // page messages
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    companyName: "",
    businessRegistrationNumber: "",
  });

  // images
  const [profilePreview, setProfilePreview] = useState("");
  const [coverPreview, setCoverPreview] = useState("");

  // keep selected files optional (we upload immediately on choose)
  const [profileFile, setProfileFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  const isCompany = useMemo(() => AuthService.isCompany(), []);

  useEffect(() => {
    // Ensure interceptors exist (safe to call multiple times if you prefer)
    // AuthService.initializeApp();

    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadUser() {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const res = await AuthService.getLoggedInInfo();

      // Your backend usually responds with UserResponse { user: {...} }
      const user = res?.user || res?.data || res || {};

      setForm({
        name: user?.name || "",
        email: user?.email || "",
        phoneNumber: user?.phoneNumber || "",
        companyName: user?.companyName || "",
        businessRegistrationNumber: user?.businessRegistrationNumber || "",
      });

      setProfilePreview(user?.profileImageUrl || "");
      setCoverPreview(user?.coverImageUrl || user?.coverPhotoUrl || "");

      // Also store in localStorage user (optional)
      // localStorage.setItem("user", JSON.stringify(user));
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || "Failed to load your profile.");
    } finally {
      setLoading(false);
    }
  }

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSuccess("");
    setError("");
  }

  function validate() {
    const name = form.name?.trim();
    const phone = form.phoneNumber?.trim();

    if (!name) return "Name is required.";

    // simple phone validation (optional)
    if (phone && phone.length < 7) return "Phone number looks too short.";

    return "";
  }

  async function onSave(e) {
    e.preventDefault();
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // Only send fields your backend updates safely (name + phoneNumber)
      const payload = {
        name: form.name?.trim(),
        phoneNumber: form.phoneNumber?.trim(),
      };

      // If you want to also save company fields (you currently don't update these in service),
      // you must add support in backend updateUserProfile() first.
      // If your backend already supports it later, uncomment:
      // if (isCompany) {
      //   payload.companyName = form.companyName?.trim();
      //   payload.businessRegistrationNumber = form.businessRegistrationNumber?.trim();
      // }

      const res = await AuthService.updateUserProfile(payload);

      // Update previews/user cache from response if returned
      const updatedUser = res?.user || res?.data?.user || res?.data || null;
      if (updatedUser) {
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      setSuccess(res?.message || "Profile updated successfully.");
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  async function uploadProfileImage(file) {
    if (!file) return;

    try {
      setUploadingProfile(true);
      setError("");
      setSuccess("");

      const fd = new FormData();
      // backend expects MultipartFile parameter name. If your controller uses @RequestParam("file"),
      // name must be "file". We'll use "file".
      fd.append("file", file);

      const res = await AuthService.updateUserProfilePicture(fd);

      // Backend might return user with updated profileImageUrl
      const updatedUser = res?.user || res?.data?.user || res?.data || null;
      if (updatedUser?.profileImageUrl) setProfilePreview(updatedUser.profileImageUrl);

      setSuccess(res?.message || "Profile image updated.");
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || "Failed to upload profile image.");
    } finally {
      setUploadingProfile(false);
    }
  }

  async function uploadCoverImage(file) {
    if (!file) return;

    try {
      setUploadingCover(true);
      setError("");
      setSuccess("");

      const fd = new FormData();
      fd.append("file", file);

      const res = await AuthService.updateCoverPicture(fd);

      const updatedUser = res?.user || res?.data?.user || res?.data || null;
      // You currently set profileImageUrl in updateCoverImage() by mistake in backend.
      // If you fix backend to set coverImageUrl, this will work:
      if (updatedUser?.coverImageUrl) setCoverPreview(updatedUser.coverImageUrl);

      setSuccess(res?.message || "Cover image updated.");
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || "Failed to upload cover image.");
    } finally {
      setUploadingCover(false);
    }
  }

  function handleProfileFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setProfileFile(file);
    setProfilePreview(URL.createObjectURL(file)); // instant preview
    uploadProfileImage(file);
  }

  function handleCoverFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    uploadCoverImage(file);
  }

  return (
    <div className="min-vh-100" style={{ backgroundColor: "#FEF9F6" }}>
      {/* Header */}
      <div className="sticky-top bg-white border-bottom shadow-sm" style={{ zIndex: 1000 }}>
        <div className="container py-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="btn btn-outline-secondary rounded-circle p-2"
                style={{ width: "40px", height: "40px" }}
                type="button"
              >
                <FaArrowLeft className="fs-5" />
              </button>
              <div>
                <h1 className="fs-5 fw-bold mb-0">Edit Profile</h1>
                <small className="text-muted">Update your account information</small>
              </div>
            </div>

            <button
              className="btn btn-primary px-3 py-2 rounded-pill d-flex align-items-center gap-2"
              style={{ backgroundColor: "#FF7B54", borderColor: "#FF7B54" }}
              onClick={onSave}
              disabled={saving || loading}
              type="button"
            >
              <FaSave />
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>

      <div className="container py-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border mb-3" role="status" style={{ color: "#FF7B54" }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">Loading your profile...</p>
          </div>
        ) : (
          <>
            {/* Messages */}
            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2">
                <FaTimesCircle />
                <span>{error}</span>
              </div>
            )}
            {success && <div className="alert alert-success">{success}</div>}

            {/* Cover + Profile */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
              <div className="position-relative" style={{ height: 200, background: "#f3f4f6" }}>
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Cover"
                    className="w-100 h-100 object-fit-cover"
                  />
                ) : (
                  <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                    No cover photo
                  </div>
                )}

                <label
                  className="btn btn-light shadow-sm position-absolute end-0 bottom-0 m-3 d-flex align-items-center gap-2"
                  style={{ borderRadius: 999 }}
                >
                  <FaCamera />
                  {uploadingCover ? "Uploading..." : "Change cover"}
                  <input
                    type="file"
                    accept="image/*"
                    className="d-none"
                    onChange={handleCoverFileChange}
                    disabled={uploadingCover}
                  />
                </label>
              </div>

              <div className="card-body p-4">
                <div className="d-flex align-items-end gap-3" style={{ marginTop: -60 }}>
                  <div className="position-relative" style={{ width: 120, height: 120 }}>
                    <div
                      className="rounded-circle border border-4 border-white shadow-sm overflow-hidden"
                      style={{ width: 120, height: 120, background: "#fff" }}
                    >
                      {profilePreview ? (
                        <img
                          src={profilePreview}
                          alt="Profile"
                          className="w-100 h-100 object-fit-cover"
                        />
                      ) : (
                        <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                          <FaUser style={{ fontSize: 34 }} />
                        </div>
                      )}
                    </div>

                    <label
                      className="btn btn-primary position-absolute bottom-0 end-0 rounded-circle d-flex align-items-center justify-content-center shadow"
                      style={{ width: 38, height: 38, backgroundColor: "#FF7B54", borderColor: "#FF7B54" }}
                      title="Change profile photo"
                    >
                      <FaCamera />
                      <input
                        type="file"
                        accept="image/*"
                        className="d-none"
                        onChange={handleProfileFileChange}
                        disabled={uploadingProfile}
                      />
                    </label>
                  </div>

                  <div className="flex-grow-1 pb-2">
                    <div className="fw-bold fs-5">{form.name || "Your name"}</div>
                    <div className="text-muted small">{form.email || "your@email.com"}</div>
                    {(uploadingProfile || uploadingCover) && (
                      <div className="text-muted small mt-1">
                        Uploading image...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={onSave}>
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4">
                  <div className="row g-3">
                    {/* Name */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Full Name</label>
                      <div className="input-group">
                        <span className="input-group-text bg-transparent">
                          <FaUser className="text-muted" />
                        </span>
                        <input
                          name="name"
                          value={form.name}
                          onChange={onChange}
                          className="form-control"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                    </div>

                    {/* Email (readonly) */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Email</label>
                      <div className="input-group">
                        <span className="input-group-text bg-transparent">
                          <FaEnvelope className="text-muted" />
                        </span>
                        <input
                          name="email"
                          value={form.email}
                          onChange={onChange}
                          className="form-control"
                          placeholder="Email"
                          disabled
                        />
                      </div>
                      <small className="text-muted">Email cannot be changed.</small>
                    </div>

                    {/* Phone */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Phone Number</label>
                      <div className="input-group">
                        <span className="input-group-text bg-transparent">
                          <FaPhone className="text-muted" />
                        </span>
                        <input
                          name="phoneNumber"
                          value={form.phoneNumber}
                          onChange={onChange}
                          className="form-control"
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>

                    {/* Company fields (UI only) */}
                    {isCompany && (
                      <>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Company Name</label>
                          <input
                            name="companyName"
                            value={form.companyName}
                            onChange={onChange}
                            className="form-control"
                            placeholder="Company name"
                          />
                          <small className="text-muted">
                            Note: Your backend currently does not update this field in updateUserProfile().
                          </small>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Business Registration Number</label>
                          <input
                            name="businessRegistrationNumber"
                            value={form.businessRegistrationNumber}
                            onChange={onChange}
                            className="form-control"
                            placeholder="Registration number"
                          />
                          <small className="text-muted">
                            Note: Your backend currently does not update this field in updateUserProfile().
                          </small>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="d-flex flex-wrap gap-2 justify-content-end mt-4">
                    <button
                      type="button"
                      className="btn btn-outline-secondary px-4 rounded-pill"
                      onClick={() => navigate(-1)}
                      disabled={saving}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="btn btn-primary px-4 rounded-pill d-flex align-items-center gap-2"
                      style={{ backgroundColor: "#FF7B54", borderColor: "#FF7B54" }}
                      disabled={saving}
                    >
                      <FaSave />
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
