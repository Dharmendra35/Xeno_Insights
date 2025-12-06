const axios = require('axios');

const createShopifyClient = (shopifyDomain, accessToken) => {
  const baseURL = `https://${shopifyDomain}/admin/api/2024-01`;
  
  const client = axios.create({
    baseURL,
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json'
    }
  });

  return {
    async getCustomers(limit = 250) {
      const response = await client.get(`/customers.json?limit=${limit}`);
      return response.data.customers || [];
    },

    async getOrders(limit = 250, status = 'any') {
      const response = await client.get(`/orders.json?limit=${limit}&status=${status}`);
      return response.data.orders || [];
    },

    async getProducts(limit = 250) {
      const response = await client.get(`/products.json?limit=${limit}`);
      return response.data.products || [];
    },

    async getOrder(orderId) {
      const response = await client.get(`/orders/${orderId}.json`);
      return response.data.order;
    },

    async getCustomer(customerId) {
      const response = await client.get(`/customers/${customerId}.json`);
      return response.data.customer;
    }
  };
};

module.exports = { createShopifyClient };
