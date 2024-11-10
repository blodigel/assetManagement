import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const CreateOnPremiseModal = ({ isOpen, onClose, onCreate, customers, sites }) => {
  const [formData, setFormData] = useState({
    name: "",
    customer_id: "",
    site_id: "",
    description: "",
    config: {
      location: "",
    },
    is_active: true,
  });

  const [filteredSites, setFilteredSites] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (formData.customer_id) {
      const customerSites = sites.filter(site => site.customer_id === formData.customer_id);
      setFilteredSites(customerSites);
      // Clear site selection if current site doesn't belong to new customer
      if (!customerSites.find(site => site.id === formData.site_id)) {
        setFormData(prev => ({ ...prev, site_id: "" }));
      }
    } else {
      setFilteredSites([]);
      setFormData(prev => ({ ...prev, site_id: "" }));
    }
  }, [formData.customer_id, sites]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.site_id) {
        setError("Site is required for on-premise infrastructure");
        return;
      }
      await onCreate(formData);
      setFormData({
        name: "",
        customer_id: "",
        site_id: "",
        description: "",
        config: {
          location: "",
        },
        is_active: true,
      });
      setError("");
    } catch (error) {
      console.error("Error creating on-premise infrastructure:", error);
      setError(error.message || "Failed to create on-premise infrastructure");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add On-Premise Infrastructure</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Server Room A"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer *
            </label>
            <select
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.customer_id}
              onChange={(e) =>
                setFormData({ ...formData, customer_id: e.target.value })
              }
            >
              <option value="">Select customer</option>
              {customers?.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Site *
            </label>
            <select
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.site_id}
              onChange={(e) =>
                setFormData({ ...formData, site_id: e.target.value })
              }
              disabled={!formData.customer_id}
            >
              <option value="">Select site</option>
              {filteredSites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
            {!formData.customer_id && (
              <p className="mt-1 text-sm text-gray-500">Select a customer first</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location *
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.config.location}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  config: {
                    ...formData.config,
                    location: e.target.value,
                  },
                })
              }
              placeholder="e.g., Building A, Floor 3, Room 302"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={2}
              placeholder="Brief description of this on-premise infrastructure"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              className="h-4 w-4 text-blue-600 rounded border-gray-300"
              checked={formData.is_active}
              onChange={(e) =>
                setFormData({ ...formData, is_active: e.target.checked })
              }
            />
            <label
              htmlFor="is_active"
              className="ml-2 block text-sm text-gray-700"
            >
              Active
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOnPremiseModal;