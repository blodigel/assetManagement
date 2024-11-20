import apiClient from './client';

export const assetService = {
  getAllAssets: () => apiClient.get('/assets'),
  getAssetsByType: (type) => apiClient.get(`/assets?asset_type=${type}`),
  createAsset: (asset) => apiClient.post('/assets', asset),
  updateAsset: (id, asset) => apiClient.put(`/assets/${id}`, asset),
  deleteAsset: (id) => apiClient.delete(`/assets/${id}`),
};

export const customerService = {
  getAllCustomers: () => apiClient.get('/customers'),
  createCustomer: (customer) => apiClient.post('/customers', customer),
  updateCustomer: (id, customer) => apiClient.put(`/customers/${id}`, customer),
  deleteCustomer: (id) => apiClient.delete(`/customers/${id}`),
};

export const siteService = {
  getAllSites: () => apiClient.get('/sites'),
  getSitesByCustomer: (customerId) => apiClient.get(`/sites?customer_id=${customerId}`),
  createSite: (site) => apiClient.post('/sites', site),
  updateSite: (id, site) => apiClient.put(`/sites/${id}`, site),
  deleteSite: (id) => apiClient.delete(`/sites/${id}`),
};

export const infrastructureService = {
  getAllInfrastructure: () => apiClient.get('/infrastructure'),
  getInfrastructureByCustomer: (customerId) => apiClient.get(`/infrastructure?customer_id=${customerId}`),
  getInfrastructureBySite: (siteId) => apiClient.get(`/infrastructure?site_id=${siteId}`),
  createInfrastructure: (infrastructure) => apiClient.post('/infrastructure', infrastructure),
  updateInfrastructure: (id, infrastructure) => apiClient.put(`/infrastructure/${id}`, infrastructure),
  deleteInfrastructure: (id) => apiClient.delete(`/infrastructure/${id}`),
  getInfrastructureTypes: () => [
    { id: 'host', name: 'Physical Host', description: 'Physical server hosting VMs' },
    { id: 'datacenter', name: 'Data Center', description: 'On-premise data center' },
    { id: 'cloud', name: 'Cloud Provider', description: 'Cloud service provider (AWS, Azure, etc.)' },
  ],
  getCloudProviders: () => [
    { id: 'aws', name: 'Amazon Web Services' },
    { id: 'azure', name: 'Microsoft Azure' },
    { id: 'gcp', name: 'Google Cloud Platform' },
    { id: 'other', name: 'Other Cloud Provider' },
  ],
  getVMsByInfrastructure: (infrastructureId) => apiClient.get(`/infrastructure/${infrastructureId}/vms`),
};