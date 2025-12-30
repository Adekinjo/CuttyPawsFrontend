import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Container, Button, Spinner, Alert } from "react-bootstrap";
import { FaArrowLeft, FaHeart } from "react-icons/fa";
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
        } catch (err) {
            setError("Failed to delete post");
        }
    };

    const handleEdit = (postId) => {
        navigate(`/edit-post/${postId}`);
    };

    if (loading) {
        return (
            <div className="bg-dark min-vh-100 d-flex justify-content-center align-items-center">
                <div className="text-center text-white">
                    <Spinner animation="border" variant="light" size="lg" />
                    <p className="mt-3 mb-0">Loading post...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-dark min-vh-100 d-flex justify-content-center align-items-center">
                <div className="text-center text-white">
                    <div className="mb-4">
                        <FaHeart className="text-muted" size={48} />
                    </div>
                    <h4 className="mb-3">Post Not Available</h4>
                    <p className="text-muted mb-4">{error}</p>
                    <div className="d-flex gap-3 justify-content-center">
                        <Button variant="outline-light" onClick={() => navigate(-1)}>
                            <FaArrowLeft className="me-2" />
                            Go Back
                        </Button>
                        <Button variant="primary" onClick={() => window.location.reload()}>
                            Try Again
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="bg-dark min-vh-100 d-flex justify-content-center align-items-center">
                <div className="text-center text-white">
                    <div className="mb-4">
                        <FaHeart className="text-muted" size={48} />
                    </div>
                    <h4 className="mb-3">Post Not Found</h4>
                    <p className="text-muted mb-4">The post you're looking for doesn't exist or has been removed.</p>
                    <div className="d-flex gap-3 justify-content-center">
                        <Button variant="outline-light" onClick={() => navigate(-1)}>
                            <FaArrowLeft className="me-2" />
                            Go Back
                        </Button>
                        <Button variant="primary" onClick={() => navigate('/')}>
                            Go Home
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-dark min-vh-100">
            <Container className="py-4">
                <div className="d-flex align-items-center mb-4">
                    <Button 
                        variant="outline-light" 
                        className="border-0 rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: '40px', height: '40px' }}
                        onClick={() => navigate(-1)}
                    >
                        <FaArrowLeft />
                    </Button>
                    <div className="ms-3">
                        <h5 className="text-white mb-0">Post</h5>
                        <small className="text-muted">
                            {post.ownerName || "Unknown User"}
                        </small>
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
                .bg-dark {
                    background-color: #000000 !important;
                }
                
                .post-detail-container {
                    max-width: 600px;
                    margin: 0 auto;
                }

                .highlight-comment {
                    background-color: #262626 !important;
                    border-left: 3px solid #0095f6;
                    transition: all 0.3s ease;
                }
            `}</style>
        </div>
    );
};

export default PostDetailPage;