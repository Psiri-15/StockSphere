export const generateSKU = (categoryName = 'GEN', productName = '') => {
  const prefix = (categoryName.substring(0, 3) || 'GEN').toUpperCase();
  const namePart = (productName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3) || 'ITM').toUpperCase();
  const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
  const timestamp = Date.now().toString().slice(-4);
  return `${prefix}-${namePart}-${randomHex}${timestamp}`;
};
