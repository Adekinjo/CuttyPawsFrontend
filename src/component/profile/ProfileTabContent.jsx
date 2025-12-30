import { Card, Button, Row, Col, Image, Badge, Spinner, Tab } from "react-bootstrap";
import { FaImages, FaPaw, FaBoxOpen, FaHeart, FaEdit, FaTrash, FaUser } from "react-icons/fa";
import ProfilePostCard from "./ProfilePostCard";

const ProfileTabContent = ({ 
  activeTab, 
  userInfo, 
  pets, 
  wishlist, 
  orders, 
  posts, 
  postsLoading,
  onEditPet,
  onDeletePet,
  onAddPet,
  onCreatePost,
  onDeletePost,
  onLikeUpdate,
  onAddressClick 
}) => {

  // Profile Tab Content
  const renderProfileTab = () => (
    <Card className="shadow-sm border-0">
      <Card.Body className="p-4">
        <h5 className="fw-bold mb-4">Profile Information</h5>
        <Row className="g-3">
          <Col md={6}>
            <div className="border rounded p-3">
              <strong>Full Name</strong>
              <p className="mb-0 text-muted">{userInfo.name}</p>
            </div>
          </Col>
          <Col md={6}>
            <div className="border rounded p-3">
              <strong>Email</strong>
              <p className="mb-0 text-muted">{userInfo.email}</p>
            </div>
          </Col>
          {userInfo.phoneNumber && (
            <Col md={6}>
              <div className="border rounded p-3">
                <strong>Phone Number</strong>
                <p className="mb-0 text-muted">{userInfo.phoneNumber}</p>
              </div>
            </Col>
          )}
          <Col md={6}>
            <div className="border rounded p-3">
              <strong>Member Since</strong>
              <p className="mb-0 text-muted">
                {userInfo.regDate ? new Date(userInfo.regDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </Col>
          {userInfo.address ? (
            <Col xs={12}>
              <div className="border rounded p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Address</strong>
                    <p className="mb-0 text-muted">
                      {userInfo.address.street}, {userInfo.address.city}, {userInfo.address.state} {userInfo.address.zipcode}
                    </p>
                  </div>
                  <Button variant="outline-primary" size="sm" onClick={onAddressClick}>
                    <FaEdit className="me-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </Col>
          ) : (
            <Col xs={12}>
              <div className="border rounded p-3 text-center">
                <p className="text-muted mb-2">No address added yet</p>
                <Button variant="primary" size="sm" onClick={onAddressClick}>
                  Add Address
                </Button>
              </div>
            </Col>
          )}
        </Row>
      </Card.Body>
    </Card>
  );

  // Pets Tab Content
  const renderPetsTab = () => (
    <Card className="shadow-sm border-0">
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold mb-0">My Pets ({pets.length})</h5>
          <Button variant="primary" size="sm" onClick={onAddPet}>
            <FaPaw className="me-1" />
            Add Pet
          </Button>
        </div>
        
        {pets.length === 0 ? (
          <div className="text-center py-5">
            <FaPaw className="text-muted mb-3" style={{ fontSize: "3rem" }} />
            <h5 className="text-muted">No pets yet</h5>
            <p className="text-muted">Add your first pet to get started!</p>
            <Button variant="primary" onClick={onAddPet}>
              Add Your First Pet
            </Button>
          </div>
        ) : (
          <Row className="g-3">
            {pets.map((pet) => (
              <Col key={pet.id} sm={6} md={4} lg={3}>
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body className="text-center">
                    <Image
                      src={pet.imageUrls && pet.imageUrls.length > 0 ? pet.imageUrls[0] : "/default-pet.png"}
                      alt={pet.name}
                      fluid
                      style={{ 
                        width: "100%", 
                        height: "200px", 
                        objectFit: "cover",
                        borderRadius: "8px"
                      }}
                      className="mb-3"
                    />
                    <h6 className="fw-bold">{pet.name}</h6>
                    <p className="text-muted small mb-2">{pet.breed}</p>
                    <p className="text-muted small mb-3">{pet.age} years old</p>
                    <div className="d-flex gap-2 justify-content-center">
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => onEditPet(pet.id)}
                      >
                        <FaEdit />
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => onDeletePet(pet.id)}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card.Body>
    </Card>
  );

  // Orders Tab Content
  const renderOrdersTab = () => (
    <Card className="shadow-sm border-0">
      <Card.Body className="p-4">
        <h5 className="fw-bold mb-4">My Orders ({orders.length})</h5>
        
        {orders.length === 0 ? (
          <div className="text-center py-5">
            <FaBoxOpen className="text-muted mb-3" style={{ fontSize: "3rem" }} />
            <h5 className="text-muted">No orders yet</h5>
            <p className="text-muted">Your orders will appear here once you make a purchase.</p>
          </div>
        ) : (
          <div className="list-group list-group-flush">
            {orders.map((order) => (
              <div key={order.id} className="list-group-item border-0 px-0">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="fw-bold mb-1">Order #{order.id}</h6>
                    <small className="text-muted">
                      {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'Date not available'}
                    </small>
                  </div>
                  <Badge bg={order.status === 'DELIVERED' ? 'success' : 'warning'}>
                    {order.status || 'PENDING'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card.Body>
    </Card>
  );

  // Wishlist Tab Content
  const renderWishlistTab = () => (
    <Card className="shadow-sm border-0">
      <Card.Body className="p-4">
        <h5 className="fw-bold mb-4">My Wishlist ({wishlist.length})</h5>
        
        {wishlist.length === 0 ? (
          <div className="text-center py-5">
            <FaHeart className="text-muted mb-3" style={{ fontSize: "3rem" }} />
            <h5 className="text-muted">Wishlist is empty</h5>
            <p className="text-muted">Start adding items to your wishlist!</p>
          </div>
        ) : (
          <Row className="g-3">
            {wishlist.map((item) => (
              <Col key={item.id} sm={6} md={4} lg={3}>
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body className="text-center">
                    <Image
                      src={item.imageUrl || "/default-product.png"}
                      alt={item.name}
                      fluid
                      style={{ 
                        width: "100%", 
                        height: "150px", 
                        objectFit: "cover",
                        borderRadius: "8px"
                      }}
                      className="mb-3"
                    />
                    <h6 className="fw-bold">{item.name}</h6>
                    <p className="text-primary fw-bold mb-2">${item.price}</p>
                    <Button variant="primary" size="sm">
                      Add to Cart
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card.Body>
    </Card>
  );

  // Posts Tab Content
  const renderPostsTab = () => (
    <Card className="shadow-sm border-0">
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold mb-0">My Posts ({posts.length})</h5>
          <Button variant="primary" size="sm" onClick={onCreatePost}>
            <FaImages className="me-1" />
            Create Post
          </Button>
        </div>
        
        {postsLoading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-5">
            <FaImages className="text-muted mb-3" style={{ fontSize: "3rem" }} />
            <h5 className="text-muted">No posts yet</h5>
            <p className="text-muted">Share your first post with the community!</p>
            <Button variant="primary" onClick={onCreatePost}>
              Create Your First Post
            </Button>
          </div>
        ) : (
          <div className="posts-feed">
            {posts.map((post) => (
              <ProfilePostCard
                key={post.id}
                post={post}
                currentUser={userInfo}
                onDelete={onDeletePost}
                onLikeUpdate={onLikeUpdate}
              />
            ))}
          </div>
        )}
      </Card.Body>
    </Card>
  );

  return (
    <Tab.Content>
      {activeTab === "posts" && renderPostsTab()}
      {activeTab === "profile" && renderProfileTab()}
      {activeTab === "pets" && renderPetsTab()}
      {activeTab === "orders" && renderOrdersTab()}
      {activeTab === "wishlist" && renderWishlistTab()}
    </Tab.Content>
  );
};

export default ProfileTabContent;