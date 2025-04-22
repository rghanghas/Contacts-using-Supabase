import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import ContactList from './ContactList';
import ContactDetails from './ContactDetails';
import ContactForm from './ContactForm';
import LoginForm from './LoginForm';
import './App.css';

// Initialize Supabase client - replace with your actual project URL and anon key
const supabaseUrl = 'your-url';
const supabaseKey = 'your-key';
const supabase = createClient(supabaseUrl, supabaseKey);

function App() {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  useEffect(() => {
    // Check for active session on component mount
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Fetch user data from our public.users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (userError) {
          console.error('Error fetching user data:', userError);
          return;
        }
        
        setCurrentUser({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          password: userData.password
        });
      }
    };
    
    checkSession();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Fetch user data from our public.users table
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (userError) {
            console.error('Error fetching user data:', userError);
            return;
          }
          
          setCurrentUser({
            id: userData.id,
            name: userData.name,
            email: userData.email,
            password: userData.password
          });
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          setContacts([]);
          setSelectedContact(null);
        }
      }
    );
    
    // Clean up subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []);
  
  useEffect(() => {
    if (currentUser) {
      fetchContacts();
    }
  }, [currentUser]);
  
  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Convert from Supabase format to component format
      const formattedContacts = (data || []).map(contact => ({
        id: contact.id,
        firstName: contact.first_name,
        lastName: contact.last_name,
        email: contact.email,
        phone: contact.phone
      }));
      
      setContacts(formattedContacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };
  
  const handleContactClick = (contact) => {
    setSelectedContact(contact);
    setShowForm(false);
    setEditMode(false);
  };

  const handleAddNew = () => {
    setShowForm(true);
    setSelectedContact(null);
    setEditMode(false);
  }

  const handleEditClick = () => {
    setShowForm(true);
    setEditMode(true);
  }
  
  const handleAddContact = async (newContact) => {
    try {
      // Map contact properties to match our Supabase schema
      const contactData = {
        first_name: newContact.firstName,
        last_name: newContact.lastName,
        email: newContact.email,
        phone: newContact.phone,
        user_id: currentUser.id
      };

      const { data, error } = await supabase
        .from('contacts')
        .insert([contactData])
        .select();
      
      if (error) throw error;
      
      await fetchContacts();
      setShowForm(false);
    } catch (error) {
      console.error('Error adding contact:', error);
    }
  };

  const handleUpdateContact = async (updatedContact) => {
    try {
      // Map contact properties to match our Supabase schema
      const contactData = {
        first_name: updatedContact.firstName,
        last_name: updatedContact.lastName,
        email: updatedContact.email,
        phone: updatedContact.phone,
      };

      const { error } = await supabase
        .from('contacts')
        .update(contactData)
        .eq('id', updatedContact.id);
        
      if (error) throw error;
      
      await fetchContacts();
      setSelectedContact(updatedContact);
      setShowForm(false);
      setEditMode(false);
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  };

  const handleDeleteContact = async (id) => {
    if(window.confirm('Are you sure you want to delete this contact?')) {
      try {
        const { error } = await supabase
          .from('contacts')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        await fetchContacts();
        setSelectedContact(null);
      } catch (error) {
        console.error('Error deleting contact:', error);
      }
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // Auth state change listener will handle clearing the UI
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  if (!currentUser) {
    return <LoginForm supabase={supabase} />;
  }

  return (
    <div className="app">
      <header>
        <h1>Contacts</h1>
        <div className="header-right">
          <div className="user-info">
            <span>Welcome, {currentUser.name}</span>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </div>
          <button className="add-button" onClick={handleAddNew}>
            Add Contact
          </button>
        </div>
      </header>
      
      <div className="content">
        <ContactList 
          contacts={contacts} 
          onContactClick={handleContactClick} 
          selectedId={selectedContact?.id} 
        />
        
        <div className="details-container">
          {showForm ? ( 
            <ContactForm 
              onSubmit={editMode ? handleUpdateContact : handleAddContact} 
              initialData={editMode ? selectedContact : null}
              formTitle={editMode ? "Edit Contact" : "Add New Contact"} 
            /> 
          ) : selectedContact ? ( 
            <ContactDetails 
              contact={selectedContact} 
              onEdit={handleEditClick} 
              onDelete={() => handleDeleteContact(selectedContact.id)} 
            /> 
          ) : (
            <div className="placeholder">
              <p>Select or Add Contact</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;