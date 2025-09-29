export const formatPhoneNumber = (phone) => {
  // Remove any non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // If starts with 0, replace with 254
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.substring(1);
  }
  
  // If doesn't start with 254, add it
  if (!cleaned.startsWith('254')) {
    cleaned = '254' + cleaned;
  }
  
  return cleaned;
};

export const generateTimestamp = () => {
  return new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
};

export const generatePassword = (shortcode, passkey, timestamp) => {
  const concatenated = shortcode + passkey + timestamp;
  return btoa(concatenated);
};
