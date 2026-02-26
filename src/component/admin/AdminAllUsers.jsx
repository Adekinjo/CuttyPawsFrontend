import { useEffect, useState } from 'react';
import ApiService from '../../service/AuthService';
import '../../style/AdminAllUsers.css';

const UserList = () => {
  const [users, setUsers] = useState([]); // State to store the list of users
  const [loading, setLoading] = useState(true); // State to handle loading state
  const [error, setError] = useState(null); // State to handle errors
  const [selectedUser, setSelectedUser] = useState(null); // State to track the selected user for details

  // Fetch users when the component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await ApiService.getAllUsers();
        setUsers(data); // Update the state with the fetched users
      } catch (err) {
        setError(err.message); // Set error state if something goes wrong
      } finally {
        setLoading(false); // Set loading to false after the request completes
      }
    };

    fetchUsers();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Function to handle "View Details" button click
  const handleViewDetails = (user) => {
    setSelectedUser(user); // Set the selected user to display details
  };

  // Function to close the details modal
  const handleCloseDetails = () => {
    setSelectedUser(null); // Clear the selected user
  };

  // Display loading state
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Display error state
  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  // Display the list of users
  return (
    <div className="user-list-container">
      <h1>User List</h1>
      <div className="user-table-wrap">
        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone Number</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(users) && users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id}>
                  <td data-label="ID">{user.id}</td>
                  <td data-label="Name">{user.name}</td>
                  <td data-label="Email">{user.email}</td>
                  <td data-label="Phone Number">{user.phoneNumber}</td>
                  <td data-label="Role">{user.role}</td>
                  <td data-label="Actions">
                    <button onClick={() => handleViewDetails(user)}>View Details</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-users">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for displaying full user details */}
      {selectedUser && (
        <div className="modal-overlay">
          <div className="modal user-details-modal">
            <h2>User Details</h2>
            <p><strong>ID:</strong> {selectedUser.id}</p>
            <p><strong>Name:</strong> {selectedUser.name}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Phone Number:</strong> {selectedUser.phoneNumber}</p>
            <p><strong>Role:</strong> {selectedUser.role}</p>
            <p><strong>Created At:</strong> {new Date(selectedUser.createdAt).toLocaleString()}</p>

            {/* Display Address */}
            <h3>Address</h3>
            {selectedUser.address ? (
              <div>
                <p><strong>Street:</strong> {selectedUser.address.street}</p>
                <p><strong>City:</strong> {selectedUser.address.city}</p>
                <p><strong>State:</strong> {selectedUser.address.state}</p>
                <p><strong>Country:</strong> {selectedUser.address.country}</p>
                <p><strong>Zip Code:</strong> {selectedUser.address.zipcode}</p>
              </div>
            ) : (
              <p>No address available.</p>
            )}

            {/* Display Order Items */}
            <h3>Order Items</h3>
            {selectedUser.orderItemList && selectedUser.orderItemList.length > 0 ? (
              <ul>
                {selectedUser.orderItemList.map((orderItem) => (
                  <li key={orderItem.id}>
                    <div>
                      <strong>Product Name:</strong> {orderItem.product.name}
                    </div>
                    <div>
                      <strong>Description:</strong> {orderItem.product.description}
                    </div>
                    <div>
                      <strong>Quantity:</strong> {orderItem.quantity}
                    </div>
                    <div>
                      <strong>Price:</strong> {orderItem.price.toFixed(2)}
                    </div>
                    <div>
                      <strong>Status:</strong> {orderItem.status}
                    </div>
                    <div>
                      <strong>Ordered At:</strong> {new Date(orderItem.createdAt).toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No order items available.</p>
            )}

            {/* Display Payments */}
            <h3>Payments</h3>
            {selectedUser.payments && selectedUser.payments.length > 0 ? (
              <ul>
                {selectedUser.payments.map((payment) => (
                  <li key={payment.id}>
                    <div>
                      <strong>Amount:</strong> {payment.amount.toFixed(2)}
                    </div>
                    <div>
                      <strong>Date:</strong> {new Date(payment.paymentDate).toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No payments available.</p>
            )}

            <button onClick={handleCloseDetails}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
