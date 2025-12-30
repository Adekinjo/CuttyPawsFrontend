import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap'; // Assuming you're using React Bootstrap

const SessionExpired = ({ show, onHide }) => {
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    onHide(); 
    navigate('/login'); 
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Session Expired</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Your session has expired. Please log in again to continue.
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleLoginRedirect}>
          Go to Login
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SessionExpired;