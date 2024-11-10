import React, { useState } from "react";
import { X } from "lucide-react";
import apiClient from "../../api/client";

const CreateSiteModal = ({ isOpen, onClose, onCreate, customers }) => {
  const [formData, setFormData] = useState({
    name: "",
    customer_id: "",
    address: {
      street_address: "",
      city: "",
      postal_code: "",
      country: "",
    },
  });

  const [error, setError] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const handleCustomerChange = (e) => {
    const customerId = e.target.value;
    const customer = customers.find(c => c.id === customerId);
    setSelectedCustomer(customer);
    setFormData({ ...formData, customer_id: customerId });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post('/sites', formData);
      onCreate(response.data);
      onClose();
      setFormData({
        name: "",
        customer_id: "",
        address: {
          street_address: "",
          city: "",
          postal_code: "",
          country: "",
        },
      });
      setSelectedCustomer(null);
      setError("");
    } catch (error) {
      console.error("Error creating site:", error);
      setError(error.message || "Failed to create site");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create New Site</h2>
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
              Customer *
            </label>
            <select
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.customer_id}
              onChange={handleCustomerChange}
            >
              <option value="">Select a customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Site Name *
            </label>
            {selectedCustomer && (
              <div className="text-sm text-gray-500 mb-2">
                Will be created as: {selectedCustomer.name} - {formData.name || '[Site Name]'}
              </div>
            )}
            <input
              type="text"
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter site name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Street Address"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.address.street_address}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: {
                      ...formData.address,
                      street_address: e.target.value,
                    },
                  })
                }
              />
              <input
                type="text"
                placeholder="City"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.address.city}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, city: e.target.value },
                  })
                }
              />
              <input
                type="text"
                placeholder="Postal Code"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.address.postal_code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: {
                      ...formData.address,
                      postal_code: e.target.value,
                    },
                  })
                }
              />
              <input
                type="text"
                placeholder="Country"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.address.country}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, country: e.target.value },
                  })
                }
              />
            </div>
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
              Create Site
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSiteModal;