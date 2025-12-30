import { Nav, Card } from "react-bootstrap";
import { FaUser, FaImages, FaPaw, FaBoxOpen, FaHeart } from "react-icons/fa";

const ProfileTabsNavigation = ({ activeTab, onTabChange }) => {
  return (
    <Card className="shadow-sm border-0 mb-4">
      <Card.Body className="p-0">
        <Nav 
          variant="pills" 
          className="nav-justified flex-nowrap"
          activeKey={activeTab}
          onSelect={onTabChange}
        >
          <Nav.Item className="flex-fill">
            <Nav.Link eventKey="posts" className="text-center py-3 border-0">
              <FaImages className="mb-1 d-block mx-auto" />
              <small>Posts</small>
            </Nav.Link>
          </Nav.Item>
          <Nav.Item className="flex-fill">
            <Nav.Link eventKey="profile" className="text-center py-3 border-0">
              <FaUser className="mb-1 d-block mx-auto" />
              <small>Profile</small>
            </Nav.Link>
          </Nav.Item>
          <Nav.Item className="flex-fill">
            <Nav.Link eventKey="pets" className="text-center py-3 border-0">
              <FaPaw className="mb-1 d-block mx-auto" />
              <small>Pets</small>
            </Nav.Link>
          </Nav.Item>
          <Nav.Item className="flex-fill">
            <Nav.Link eventKey="orders" className="text-center py-3 border-0">
              <FaBoxOpen className="mb-1 d-block mx-auto" />
              <small>Orders</small>
            </Nav.Link>
          </Nav.Item>
          <Nav.Item className="flex-fill">
            <Nav.Link eventKey="wishlist" className="text-center py-3 border-0">
              <FaHeart className="mb-1 d-block mx-auto" />
              <small>Wishlist</small>
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </Card.Body>
    </Card>
  );
};

export default ProfileTabsNavigation;