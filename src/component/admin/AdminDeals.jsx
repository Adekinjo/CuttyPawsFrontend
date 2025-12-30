import { useEffect, useState } from 'react';
import ApiService from '../../service/ApiService';
import '../../style/AdminDeal.css';

const AdminDeal = () => {
  const [deals, setDeals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    productId: '',
    startDate: '',
    endDate: '',
    discountPercentage: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchActiveDeals();
  }, []);

  const fetchActiveDeals = async () => {
    setLoading(true);
    try {
      const response = await ApiService.getActiveDeals();
      setDeals(response.dealList || []);
    } catch (err) {
      setError('Failed to fetch deals');
    }
    setLoading(false);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const dealDto = {
      product: { id: formData.productId },
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      discountPercentage: parseFloat(formData.discountPercentage),
    };

    try {
      if (selectedDeal) {
        await ApiService.updateDeal(selectedDeal.id, dealDto);
      } else {
        await ApiService.createDeal(dealDto);
      }
      setShowModal(false);
      fetchActiveDeals();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (dealId) => {
    if (window.confirm('Are you sure you want to delete this deal?')) {
      try {
        await ApiService.deleteDeal(dealId);
        fetchActiveDeals();
      } catch (err) {
        setError('Failed to delete deal');
      }
    }
  };

  const handleToggleStatus = async (dealId, currentStatus) => {
    try {
      await ApiService.toggleDealStatus(dealId, !currentStatus);
      fetchActiveDeals();
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const openEditModal = (deal) => {
    setSelectedDeal(deal);
    setFormData({
      productId: deal.product.id,
      startDate: deal.startDate.slice(0, 16),
      endDate: deal.endDate.slice(0, 16),
      discountPercentage: deal.discountPercentage,
    });
    setShowModal(true);
  };

  const filteredDeals = deals.filter(deal =>
    deal.product.id.toString().includes(searchTerm) ||
    deal.product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="deal-manager">
      <div className="header">
        <h1>Deal Management</h1>
        <div className="controls">
          <input
            type="text"
            placeholder="Search by Product ID or Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            className="btn-add" 
            onClick={() => {
              setSelectedDeal(null);
              setFormData({
                productId: '',
                startDate: '',
                endDate: '',
                discountPercentage: '',
              });
              setShowModal(true);
            }}
          >
            Add New Deal
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading deals...</div>
      ) : (
        <div className="deal-grid">
          {filteredDeals.map(deal => (
            <div key={deal.id} className="deal-card">
              <div className="card-header">
                <h3>{deal.product.name}</h3>
                <span className={`status ${deal.active ? 'active' : 'inactive'}`}>
                  {deal.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <img 
                src={deal.product.thumbnailImageUrl} 
                alt={deal.product.name} 
                className="product-image"
              />
              <div className="deal-details">
                <p className="discount">{deal.discountPercentage}% OFF</p>
                <p>Start: {new Date(deal.startDate).toLocaleDateString()}</p>
                <p>End: {new Date(deal.endDate).toLocaleDateString()}</p>
              </div>
              <div className="card-actions">
                <button 
                  className="btn-edit"
                  onClick={() => openEditModal(deal)}
                >
                  Edit
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(deal.id)}
                >
                  Delete
                </button>
                <button
                  className={`btn-status ${deal.active ? 'active' : 'inactive'}`}
                  onClick={() => handleToggleStatus(deal.id, deal.active)}
                >
                  {deal.active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowModal(false)}>&times;</span>
            <h2>{selectedDeal ? 'Edit Deal' : 'Create New Deal'}</h2>
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label>Product ID:</label>
                <input
                  type="number"
                  value={formData.productId}
                  onChange={(e) => setFormData({...formData, productId: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Start Date:</label>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Date:</label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Discount Percentage:</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max="100"
                  value={formData.discountPercentage}
                  onChange={(e) => setFormData({...formData, discountPercentage: e.target.value})}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit">
                  {selectedDeal ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDeal;