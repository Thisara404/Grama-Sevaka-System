const API_URL = 'http://localhost:5000/api';

export const AppointmentService = {
  // Get all appointments
  getAppointments: async (token) => {
    const response = await fetch(`${API_URL}/appointments`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch appointments');
    }
    
    return response.json();
  },
  
  // Get available time slots for a specific date
  getAvailableSlots: async (date) => {
    const response = await fetch(`${API_URL}/appointments/slots?date=${date}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch available slots');
    }
    
    return response.json();
  },
  
  // Get all departments
  getDepartments: async () => {
    const response = await fetch(`${API_URL}/appointments/departments`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch departments');
    }
    
    return response.json();
  },
  
  // Get all service types
  getServiceTypes: async () => {
    const response = await fetch(`${API_URL}/appointments/services`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch service types');
    }
    
    return response.json();
  },
  
  // Create a new appointment
  createAppointment: async (appointmentData, token) => {
    const response = await fetch(`${API_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(appointmentData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create appointment');
    }
    
    return response.json();
  },
  
  // Cancel an appointment
  cancelAppointment: async (id, token) => {
    const response = await fetch(`${API_URL}/appointments/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to cancel appointment');
    }
    
    return response.json();
  },
  
  // Get appointment by ID
  getAppointmentById: async (id, token) => {
    const response = await fetch(`${API_URL}/appointments/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch appointment details');
    }
    
    return response.json();
  },
  
  // Update appointment status (GS Officer only)
  updateAppointmentStatus: async (id, statusData, token) => {
    const response = await fetch(`${API_URL}/appointments/${id}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(statusData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update appointment status');
    }
    
    return response.json();
  }
};