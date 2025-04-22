import React from 'react';

function ContactList({ contacts, onContactClick, selectedId }) {
  return (
    <div className="contact-list">
      <h2>Contacts List</h2>
        <ul>
          {contacts.map(contact => (
            <li key={contact.id} className={contact.id === selectedId ? 'selected' : ''} onClick={() => onContactClick(contact)}>
              {contact.firstName} {contact.lastName}
            </li>
          ))}
        </ul>
    </div>
  );
}

export default ContactList;