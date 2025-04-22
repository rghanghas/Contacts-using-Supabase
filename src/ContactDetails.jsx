import React from 'react';

function ContactDetails({ contact, onEdit, onDelete }) {
  return (
    <div className="contact-details">
      <h2>Contact Details</h2>
      <div className="detail-item">
        <label>First Name:</label>
        <span>{contact.firstName}</span>
      </div>
      <div className="detail-item">
        <label>Last Name:</label>
        <span>{contact.lastName}</span>
      </div>
      <div className="detail-item">
        <label>Email:</label>
        <span>{contact.email}</span>
      </div>
      <div className="detail-item">
        <label>Phone:</label>
        <span>{contact.phone}</span>
      </div>
      <div className="action-buttons">
        <button className="edit-button" onClick={onEdit}>Edit</button>
        <button className="delete-button" onClick={onDelete}>Delete</button>
      </div>
    </div>
  );
}

export default ContactDetails;