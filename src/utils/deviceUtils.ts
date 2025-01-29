export const generateDeviceId = () => {
  const storedId = localStorage.getItem('deviceId');
  if (storedId) return storedId;
  
  const newId = 'device_' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem('deviceId', newId);
  return newId;
};

export const getIPAddress = async () => {
  try {
    // In a real application, you might want to use a service to get the actual IP
    // For now, we'll return a mock IP
    return '127.0.0.1';
  } catch (error) {
    console.error('Failed to get IP address:', error);
    return 'unknown';
  }
};