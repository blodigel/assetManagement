import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const SiteModal = ({ isOpen, onClose, site, customers, onUpdate, onDelete }) => {
  // Extract the site name part (after the " - ")
  const getSiteName = (fullName) => {
    const parts = fullName.split(" - ");
    return parts.length > 1 ? parts[1] : fullName;
  };

  const [formData, setFormData] = useState({
    name: getSiteName(site?.name || ""),
    customer_id: site?.customer_id || "",
    address: {
      street_address: site?.address?.street_address || "",
      city: site?.address?.city || "",
      postal_code: site?.address?.postal_code || "",
      country: site?.address?.country || "",
    },
    is_primary: site?.is_primary || false,
  });

  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    if (formData.customer_id) {
      const customer = customers.find(c => c.id === formData.customer_id);
      setSelectedCustomer(customer);
    }
  }, [formData.customer_id, customers]);

  const handleCustomerChange = (e) => {
    const customerId = e.target.value;
    const customer = customers.find(c => c.id === customerId);
    setSelectedCustomer(customer);
    setFormData({ ...formData, customer_id: customerId });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onUpdate({ id: site.id, ...formData });
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this site?")) {
      await onDelete(site.id);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit Site</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Customer
              </label>
              <select
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                value={formData.customer_id}
                onChange={handleCustomerChange}
              >
                <option value="">Select a customer</option>
                {customers?.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Site Name
              </label>
              {selectedCustomer && (
                <div className="text-sm text-gray-500 mb-2">
                  Will be saved as: {selectedCustomer.name} - {formData.name}
                </div>
              )}
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Street Address
              </label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                value={formData.address.city}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, city: e.target.value },
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Postal Code
              </label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                value={formData.address.postal_code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, postal_code: e.target.value },
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Country
              </label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                value={formData.address.country}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, country: e.target.value },
                  })
                }
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_primary"
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
                checked={formData.is_primary}
                onChange={(e) =>
                  setFormData({ ...formData, is_primary: e.target.checked })
                }
              />
              <label
                htmlFor="is_primary"
                className="ml-2 block text-sm text-gray-700"
              >
                Primary Site
              </label>
            </div>

            <div className="flex justify-between gap-3 mt-6">
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600"
              >
                Delete
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SiteModal;