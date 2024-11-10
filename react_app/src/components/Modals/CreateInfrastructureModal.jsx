import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { infrastructureService } from "../../api/services";

const CreateInfrastructureModal = ({ isOpen, onClose, onCreate, sites, customers }) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    customer_id: "",
    site_id: "",
    cloud_provider: "",
    details: {
      location: "",
      capacity: {
        cpu_cores: "",
        memory_gb: "",
        storage_gb: "",
      },
      specifications: "",
      notes: "",
    },
  });

  const [filteredSites, setFilteredSites] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (formData.customer_id) {
      const customerSites = sites.filter(site => site.customer_id === formData.customer_id);
      setFilteredSites(customerSites);
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
      const submitData = { ...formData };
      if (formData.type !== 'cloud') {
        delete submitData.cloud_provider;
      }
      const response = await infrastructureService.createInfrastructure(submitData);
      onCreate(response.data);
      onClose();
      setFormData({
        name: "",
        type: "",
        customer_id: "",
        site_id: "",
        cloud_provider: "",
        details: {
          location: "",
          capacity: {
            cpu_cores: "",
            memory_gb: "",
            storage_gb: "",
          },
          specifications: "",
          notes: "",
        },
      });
      setError("");
    } catch (error) {
      console.error("Error creating infrastructure:", error);
      setError(error.message || "Failed to create infrastructure");
    }
  };

  const renderTypeSpecificFields = () => {
    switch (formData.type) {
      case 'host':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPU Cores *
              </label>
              <input
                type="number"
                required
                min="1"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.details.capacity.cpu_cores}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    details: {
                      ...formData.details,
                      capacity: {
                        ...formData.details.capacity,
                        cpu_cores: e.target.value,
                      },
                    },
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Memory (GB) *
              </label>
              <input
                type="number"
                required
                min="1"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.details.capacity.memory_gb}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    details: {
                      ...formData.details,
                      capacity: {
                        ...formData.details.capacity,
                        memory_gb: e.target.value,
                      },
                    },
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Storage (GB) *
              </label>
              <input
                type="number"
                required
                min="1"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.details.capacity.storage_gb}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    details: {
                      ...formData.details,
                      capacity: {
                        ...formData.details.capacity,
                        storage_gb: e.target.value,
                      },
                    },
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specifications
              </label>
              <textarea
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.details.specifications}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    details: {
                      ...formData.details,
                      specifications: e.target.value,
                    },
                  })
                }
                rows={3}
                placeholder="CPU model, memory type, etc."
              />
            </div>
          </>
        );
      case 'cloud':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cloud Provider *
              </label>
              <select
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.cloud_provider}
                onChange={(e) =>
                  setFormData({ ...formData, cloud_provider: e.target.value })
                }
              >
                <option value="">Select provider</option>
                {infrastructureService.getCloudProviders().map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Region/Location
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.details.location}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    details: { ...formData.details, location: e.target.value },
                  })
                }
                placeholder="e.g., us-east-1"
              />
            </div>
          </>
        );
      case 'datacenter':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location *
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.details.location}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  details: { ...formData.details, location: e.target.value },
                })
              }
              placeholder="e.g., Building A, Floor 3"
            />
          </div>
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add VM Hosting Location</h2>
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
              placeholder="e.g., Production Host 1"
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
              Type *
            </label>
            <select
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
            >
              <option value="">Select type</option>
              {infrastructureService.getInfrastructureTypes().map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {formData.type !== 'cloud' && (
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
          )}

          {renderTypeSpecificFields()}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.details.notes}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  details: { ...formData.details, notes: e.target.value },
                })
              }
              rows={3}
              placeholder="Additional notes..."
            />
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

export default CreateInfrastructureModal;