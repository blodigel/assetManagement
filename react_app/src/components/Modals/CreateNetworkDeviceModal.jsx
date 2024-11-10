import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const CreateNetworkDeviceModal = ({
  isOpen,
  onClose,
  onCreate,
  sites,
  customers,
  deviceType,
}) => {
  const [formData, setFormData] = useState({
    hostname: "",
    ip_address: "",
    customer_id: "",
    site_id: "",
    asset_type: deviceType,
    specs: {
      manufacturer: "",
      model: "",
    },
    notes: "",
  });

  const [filteredSites, setFilteredSites] = useState([]);

  // Update filtered sites when customer changes
  useEffect(() => {
    if (formData.customer_id) {
      const customerSites = sites.filter(
        (site) => site.customer_id === formData.customer_id
      );
      setFilteredSites(customerSites);
      // Reset site selection when customer changes
      setFormData((prev) => ({
        ...prev,
        site_id: "",
      }));
    } else {
      setFilteredSites([]);
    }
  }, [formData.customer_id, sites]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onCreate(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            Add New {deviceType === "switch" ? "Switch" : "Firewall"}
          </h2>
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
                Hostname
              </label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                value={formData.hostname}
                onChange={(e) =>
                  setFormData({ ...formData, hostname: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                IP Address
              </label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                value={formData.ip_address}
                onChange={(e) =>
                  setFormData({ ...formData, ip_address: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Manufacturer
              </label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                value={formData.specs.manufacturer}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    specs: { ...formData.specs, manufacturer: e.target.value },
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Model
              </label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                value={formData.specs.model}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    specs: { ...formData.specs, model: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Customer
              </label>
              <select
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                value={formData.customer_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    customer_id: e.target.value,
                  })
                }
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
                Site
              </label>
              <select
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                value={formData.site_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    site_id: e.target.value,
                  })
                }
                disabled={!formData.customer_id}
              >
                <option value="">
                  {formData.customer_id
                    ? "Select a site"
                    : "Please select a customer first"}
                </option>
                {filteredSites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                rows="3"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
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
                Create
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNetworkDeviceModal;
