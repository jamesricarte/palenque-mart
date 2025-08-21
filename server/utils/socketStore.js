let sockets = [];
const users = new Map();
const deliveryPartners = new Map(); // Add this line to track delivery partners
const sellers = new Map(); // Add this line to store connected sellers
const trackingMap = new Map();

module.exports = {
  sockets,
  users,
  deliveryPartners,
  sellers,
  trackingMap,
};
