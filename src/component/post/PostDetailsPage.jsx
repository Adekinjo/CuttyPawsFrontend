import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Container, Button, Spinner, Alert, Image } from "react-bootstrap";
import { FaArrowLeft, FaHeart } from "react-icons/fa";
import { PawPrint } from "lucide-react";
import PostCard from "../post/PostCard";
import PostService from "../../service/PostService";
import ApiService from "../../service/AuthService";

const PostDetailPage = () => {
    const { postId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const user = ApiService.getCurrentUser();
        setCurrentUser(user);
    }, []);

    useEffect(() => {
        const fetchPost = async () => {
            if (!postId) {
                setError("Post ID is required");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");
                const response = await PostService.getPostById(postId);
                
                if (response.status === 200 && response.post) {
                    setPost(response.post);
                } else {
                    setError(response.message || "Post not found");
                }
            } catch (err) {
                setError(err.message || "Failed to load post. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        if (postId) {
            fetchPost();
        }
    }, [postId]);

    useEffect(() => {
        if (!loading && post) {
            const commentId = searchParams.get('comment');
            if (commentId) {
                setTimeout(() => {
                    const commentElement = document.getElementById(`comment-${commentId}`);
                    if (commentElement) {
                        commentElement.scrollIntoView({ behavior: 'smooth' });
                        commentElement.classList.add('highlight-comment');
                    }
                }, 500);
            }
        }
    }, [loading, post, searchParams]);

    const handleDelete = async (deletedPostId) => {
        try {
            await PostService.deletePost(deletedPostId);
            navigate(-1);
        } catch {
            setError("Failed to delete post");
        }
    };

    const handleEdit = (postId) => {
        navigate(`/edit-post/${postId}`);
    };

    if (loading) {
        return (
            <div className="post-detail-page min-vh-100 d-flex justify-content-center align-items-center">
                <div className="text-center">
                    <Spinner animation="border" variant="warning" size="lg" />
                    <p className="mt-3 mb-0">Loading post...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="post-detail-page min-vh-100 d-flex justify-content-center align-items-center">
                <div className="text-center">
                    <div className="mb-4">
                        <FaHeart className="text-muted" size={48} />
                    </div>
                    <h4 className="mb-3">Post Not Available</h4>
                    <p className="text-muted mb-4">{error}</p>
                    <div className="d-flex gap-3 justify-content-center">
                        <Button variant="outline-secondary" onClick={() => navigate(-1)}>
                            <FaArrowLeft className="me-2" />
                            Go Back
                        </Button>
                        <Button className="post-detail-primary" onClick={() => window.location.reload()}>
                            Try Again
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="post-detail-page min-vh-100 d-flex justify-content-center align-items-center">
                <div className="text-center">
                    <div className="mb-4">
                        <FaHeart className="text-muted" size={48} />
                    </div>
                    <h4 className="mb-3">Post Not Found</h4>
                    <p className="text-muted mb-4">The post you're looking for doesn't exist or has been removed.</p>
                    <div className="d-flex gap-3 justify-content-center">
                        <Button variant="outline-secondary" onClick={() => navigate(-1)}>
                            <FaArrowLeft className="me-2" />
                            Go Back
                        </Button>
                        <Button className="post-detail-primary" onClick={() => navigate('/')}>
                            Go Home
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="post-detail-page min-vh-100">
            <Container fluid className="py-4 px-0 px-md-3">
                <div className="d-flex align-items-center mb-4">
                    <Button 
                        variant="outline-secondary" 
                        className="border-0 rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: '40px', height: '40px' }}
                        onClick={() => navigate(-1)}
                    >
                        <FaArrowLeft />
                    </Button>
                    <div className="ms-3">
                        <div className="d-flex align-items-center gap-2">
                            {post.ownerProfileImage ? (
                              <Image
                                src={post.ownerProfileImage}
                                alt={post.ownerName || "Post owner"}
                                roundedCircle
                                style={{ width: "34px", height: "34px", objectFit: "cover" }}
                              />
                            ) : (
                              <div
                                className="d-inline-flex align-items-center justify-content-center rounded-circle"
                                style={{
                                  width: "34px",
                                  height: "34px",
                                  background: "linear-gradient(135deg, #ff7b54, #ffa559)",
                                  color: "#fff"
                                }}
                                aria-label="Default profile picture"
                              >
                                <PawPrint size={16} strokeWidth={2.2} />
                              </div>
                            )}
                            <div>
                              <h5 className="mb-0">Post</h5>
                              <small className="text-muted">
                                  {post.ownerName || "Unknown User"}
                              </small>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="post-detail-container">
                    <PostCard
                        post={post}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                        currentUser={currentUser}
                        isOwner={post.ownerId === currentUser?.id}
                    />
                </div>
            </Container>

            <style>{`
                .post-detail-page {
                    background:
                      radial-gradient(1200px 700px at 0% -8%, #ffe7d6 0%, transparent 50%),
                      radial-gradient(900px 550px at 100% 0%, #dff4ff 0%, transparent 52%),
                      linear-gradient(165deg, #f6f1ec 0%, #fffaf4 45%, #fffefe 100%);
                }
                
                .post-detail-container {
                    max-width: 600px;
                    margin: 0 auto;
                    width: 100%;
                    padding: 0 0.25rem;
                }

                @media (max-width: 768px) {
                  .post-detail-container {
                    max-width: 100%;
                    padding: 0;
                  }
                }

                .post-detail-primary {
                    background: linear-gradient(135deg, #ff8b5e 0%, #ff6d3f 100%);
                    border: none !important;
                    color: #ffffff !important;
                }

                .post-detail-primary:hover {
                    filter: brightness(0.97);
                }

                .highlight-comment {
                    background-color: rgba(255, 139, 94, 0.14) !important;
                    border-left: 3px solid #ff7b54;
                    transition: all 0.3s ease;
                }
            `}</style>
        </div>
    );
};

export default PostDetailPage;
