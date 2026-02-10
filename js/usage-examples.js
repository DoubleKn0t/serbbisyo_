// ============================================
// USAGE EXAMPLES FOR SERBBISYO FEATURES
// ============================================

// ============================================
// 1. BOOKING CREATION (Client Side)
// ============================================

async function createBooking(formData) {
  // Clear any previous form errors
  errorHandler.clearFormErrors();

  // Validate booking form
  const validation = errorHandler.validateForm(formData, {
    title: { required: true, minLength: 10, maxLength: 100 },
    description: { required: true, minLength: 20, maxLength: 500 },
    category: { required: true },
    budget: { required: true },
    location: { required: true }
  });

  if (!validation.isValid) {
    errorHandler.displayFormErrors(validation.errors);
    errorHandler.showWarning('Please fix the errors in the form');
    return;
  }

  // Make API request with error handling
  const result = await errorHandler.apiRequest('/api/bookings/create', {
    method: 'POST',
    body: JSON.stringify(formData)
  });

  if (result.success) {
    errorHandler.showSuccess('Booking posted successfully! Providers can now apply.');
    setTimeout(() => {
      window.location.href = '/client/bookings.html';
    }, 1500);
  }
  // Error already handled by errorHandler.apiRequest
}

// Example usage in HTML form
/*
<form id="bookingForm" onsubmit="handleBookingSubmit(event)">
  <input type="text" name="title" placeholder="Job Title" required>
  <textarea name="description" placeholder="Describe the service you need" required></textarea>
  <select name="category" required>
    <option value="">Select Category</option>
    <option value="electrical">Electrical</option>
    <option value="plumbing">Plumbing</option>
  </select>
  <input type="number" name="budget" placeholder="Budget (₱)" required>
  <input type="text" name="location" placeholder="Location" required>
  <button type="submit">Post Booking</button>
</form>

<script>
function handleBookingSubmit(e) {
  e.preventDefault();
  const formData = {
    title: e.target.title.value,
    description: e.target.description.value,
    category: e.target.category.value,
    budget: e.target.budget.value,
    location: e.target.location.value
  };
  createBooking(formData);
}
</script>
*/

// ============================================
// 2. PROVIDER APPLICATION TO BOOKING
// ============================================

async function applyToBooking(bookingId, proposal) {
  // Validate proposal
  const validation = errorHandler.validateForm({ proposal }, {
    proposal: { required: true, minLength: 50, maxLength: 1000 }
  });

  if (!validation.isValid) {
    errorHandler.showWarning('Please write a detailed proposal (at least 50 characters)');
    return;
  }

  const result = await errorHandler.apiRequest(`/api/bookings/${bookingId}/apply`, {
    method: 'POST',
    body: JSON.stringify({ proposal })
  });

  if (result.success) {
    errorHandler.showSuccess('Application submitted! The client will review your proposal.');
    setTimeout(() => {
      window.location.href = '/provider/opportunities.html';
    }, 2000);
  }
}

// Example: Check if provider already applied
async function checkApplicationStatus(bookingId) {
  const result = await errorHandler.apiRequest(`/api/bookings/${bookingId}/application-status`);
  
  if (result.success && result.data.hasApplied) {
    errorHandler.handleError('BOOKING_ALREADY_APPLIED');
    return false;
  }
  return true;
}

// ============================================
// 3. MESSAGING BETWEEN CLIENT AND PROVIDER
// ============================================

async function sendMessage(recipientId, message) {
  // Validate message
  if (!message || message.trim() === '') {
    return errorHandler.handleError('MESSAGE_EMPTY');
  }

  if (message.length > 2000) {
    return errorHandler.handleError('MESSAGE_TOO_LONG');
  }

  const result = await errorHandler.apiRequest('/api/messages/send', {
    method: 'POST',
    body: JSON.stringify({
      recipientId,
      message: message.trim(),
      timestamp: new Date().toISOString()
    })
  });

  if (result.success) {
    errorHandler.showSuccess('Message sent');
    // Clear message input
    document.querySelector('#messageInput').value = '';
    // Refresh message list
    loadMessages(recipientId);
  }
}

async function loadMessages(userId) {
  const result = await errorHandler.apiRequest(`/api/messages/${userId}`);
  
  if (result.success) {
    displayMessages(result.data.messages);
  }
}

// Real-time message checking
function startMessagePolling(userId) {
  setInterval(async () => {
    if (navigator.onLine) {
      const result = await errorHandler.apiRequest(`/api/messages/${userId}/new`);
      if (result.success && result.data.hasNew) {
        loadMessages(userId);
      }
    }
  }, 5000); // Check every 5 seconds
}

// Example HTML for messaging
/*
<div class="message-container">
  <div id="messageList"></div>
  <div class="message-input">
    <input type="text" id="messageInput" placeholder="Type a message..." maxlength="2000">
    <button onclick="sendMessage(currentUserId, document.querySelector('#messageInput').value)">
      Send
    </button>
  </div>
</div>
*/

// ============================================
// 4. CLIENT VIEWING PROVIDER APPLICATIONS
// ============================================

async function loadBookingApplications(bookingId) {
  const result = await errorHandler.apiRequest(`/api/bookings/${bookingId}/applications`);
  
  if (result.success) {
    displayApplications(result.data.applications);
  }
}

async function acceptApplication(bookingId, providerId) {
  const confirmed = confirm('Are you sure you want to accept this provider?');
  if (!confirmed) return;

  const result = await errorHandler.apiRequest(`/api/bookings/${bookingId}/accept`, {
    method: 'POST',
    body: JSON.stringify({ providerId })
  });

  if (result.success) {
    errorHandler.showSuccess('Provider accepted! You can now message them directly.');
    // Update booking status
    setTimeout(() => location.reload(), 1500);
  }
}

async function rejectApplication(bookingId, providerId) {
  const result = await errorHandler.apiRequest(`/api/bookings/${bookingId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ providerId })
  });

  if (result.success) {
    errorHandler.showInfo('Application rejected');
    loadBookingApplications(bookingId);
  }
}

// ============================================
// 5. PROFILE UPDATES WITH ERROR HANDLING
// ============================================

async function updateProfile(formData) {
  errorHandler.clearFormErrors();

  const validation = errorHandler.validateForm(formData, {
    name: { required: true, minLength: 2, maxLength: 50 },
    email: { required: true, email: true },
    phone: { required: true, phone: true },
    bio: { maxLength: 500 }
  });

  if (!validation.isValid) {
    errorHandler.displayFormErrors(validation.errors);
    return;
  }

  const result = await errorHandler.apiRequest('/api/profile/update', {
    method: 'PUT',
    body: JSON.stringify(formData)
  });

  if (result.success) {
    errorHandler.showSuccess('Profile updated successfully');
  }
}

// ============================================
// 6. FILE UPLOAD WITH VALIDATION
// ============================================

async function uploadProfilePhoto(file) {
  // Validate file size (5MB limit)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return errorHandler.handleError('FILE_TOO_LARGE');
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (!allowedTypes.includes(file.type)) {
    return errorHandler.handleError('FILE_INVALID_TYPE');
  }

  const formData = new FormData();
  formData.append('photo', file);

  try {
    const response = await fetch('/api/profile/upload-photo', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    errorHandler.showSuccess('Photo uploaded successfully');
    return { success: true, data };

  } catch (error) {
    return errorHandler.handleError('UNKNOWN_ERROR', 'Failed to upload photo');
  }
}

// ============================================
// 7. BOOKING STATUS UPDATES
// ============================================

async function updateBookingStatus(bookingId, status) {
  const validStatuses = ['open', 'in_progress', 'completed', 'cancelled'];
  
  if (!validStatuses.includes(status)) {
    return errorHandler.handleError('BOOKING_INVALID_STATUS');
  }

  const result = await errorHandler.apiRequest(`/api/bookings/${bookingId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });

  if (result.success) {
    const messages = {
      'in_progress': 'Booking marked as in progress',
      'completed': 'Booking marked as completed',
      'cancelled': 'Booking cancelled'
    };
    errorHandler.showSuccess(messages[status] || 'Status updated');
  }
}

// ============================================
// 8. SEARCH/FILTER BOOKINGS (PROVIDER SIDE)
// ============================================

async function searchBookings(filters) {
  const queryParams = new URLSearchParams(filters).toString();
  const result = await errorHandler.apiRequest(`/api/bookings/search?${queryParams}`);
  
  if (result.success) {
    displayBookings(result.data.bookings);
    if (result.data.bookings.length === 0) {
      errorHandler.showInfo('No bookings found matching your criteria');
    }
  }
}

// ============================================
// 9. RATING AND REVIEW SYSTEM
// ============================================

async function submitReview(bookingId, rating, comment) {
  const validation = errorHandler.validateForm({ comment }, {
    comment: { required: true, minLength: 10, maxLength: 500 }
  });

  if (!validation.isValid) {
    errorHandler.showWarning('Please write a review (at least 10 characters)');
    return;
  }

  if (rating < 1 || rating > 5) {
    errorHandler.showWarning('Please select a rating between 1 and 5 stars');
    return;
  }

  const result = await errorHandler.apiRequest('/api/reviews/submit', {
    method: 'POST',
    body: JSON.stringify({ bookingId, rating, comment })
  });

  if (result.success) {
    errorHandler.showSuccess('Review submitted successfully');
  }
}

// ============================================
// 10. INITIALIZATION ON PAGE LOAD
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  // Check authentication on every page
  const userType = localStorage.getItem('userType');
  if (!userType) {
    errorHandler.handleError('AUTH_REQUIRED');
    return;
  }

  // Monitor online/offline status
  window.addEventListener('online', () => {
    errorHandler.showSuccess('Connection restored');
  });

  window.addEventListener('offline', () => {
    errorHandler.showWarning('You are offline. Some features may not work.');
  });

  // Auto-clear form errors when user starts typing
  document.querySelectorAll('input, textarea, select').forEach(field => {
    field.addEventListener('input', function() {
      this.classList.remove('input-error');
      const errorMsg = this.parentElement.querySelector('.field-error');
      if (errorMsg) errorMsg.remove();
    });
  });

  console.log('✅ Page initialized with error handling');
});

// ============================================
// 11. HELPER FUNCTIONS FOR DISPLAY
// ============================================

function displayMessages(messages) {
  const container = document.getElementById('messageList');
  if (!container) return;

  container.innerHTML = messages.map(msg => `
    <div class="message ${msg.isMine ? 'message-mine' : 'message-theirs'}">
      <div class="message-content">${escapeHtml(msg.content)}</div>
      <div class="message-time">${formatTime(msg.timestamp)}</div>
    </div>
  `).join('');

  // Scroll to bottom
  container.scrollTop = container.scrollHeight;
}

function displayBookings(bookings) {
  const container = document.getElementById('bookingsList');
  if (!container) return;

  if (bookings.length === 0) {
    container.innerHTML = '<p class="empty-state">No bookings available</p>';
    return;
  }

  container.innerHTML = bookings.map(booking => `
    <div class="booking-card" onclick="viewBooking('${booking.id}')">
      <h3>${escapeHtml(booking.title)}</h3>
      <p>${escapeHtml(booking.description)}</p>
      <div class="booking-meta">
        <span>Budget: ₱${booking.budget}</span>
        <span>Location: ${escapeHtml(booking.location)}</span>
      </div>
    </div>
  `).join('');
}

function displayApplications(applications) {
  const container = document.getElementById('applicationsList');
  if (!container) return;

  container.innerHTML = applications.map(app => `
    <div class="application-card">
      <div class="provider-info">
        <h4>${escapeHtml(app.providerName)}</h4>
        <div class="rating">⭐ ${app.rating || 'New'}</div>
      </div>
      <p class="proposal">${escapeHtml(app.proposal)}</p>
      <div class="application-actions">
        <button onclick="acceptApplication('${app.bookingId}', '${app.providerId}')">
          Accept
        </button>
        <button onclick="rejectApplication('${app.bookingId}', '${app.providerId}')">
          Reject
        </button>
        <button onclick="messageProvider('${app.providerId}')">
          Message
        </button>
      </div>
    </div>
  `).join('');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return date.toLocaleDateString();
}

// ============================================
// EXPORT FOR USE IN OTHER FILES
// ============================================

window.SerbBisyoAPI = {
  createBooking,
  applyToBooking,
  sendMessage,
  loadMessages,
  updateProfile,
  uploadProfilePhoto,
  updateBookingStatus,
  searchBookings,
  submitReview,
  acceptApplication,
  rejectApplication
};

console.log('✅ SerbBisyo API utilities loaded');
