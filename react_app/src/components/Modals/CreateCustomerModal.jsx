import React, { useState } from "react";
import { X } from "lucide-react";
import { customerService } from "../../api/services";

const CreateCustomerModal = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: "",
    contact_email: "",
    contact_phone: "",
    address: {
      street_address: "",
      city: "",
      postal_code: "",
      country: "",
    },
  });

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Clean up empty address fields
      const submitData = {
        name: formData.name,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
      };

      // Only include address if at least one field is filled
      const hasAddressData = Object.values(formData.address).some(
        (value) => value.trim() !== ""
      );
      if (hasAddressData) {
        submitData.address = formData.address;
      }

      const response = await customerService.createCustomer(submitData);
      onCreate(response.data);
      onClose();
      setFormData({
        name: "",
        contact_email: "",
        contact_phone: "",
        address: {
          street_address: "",
          city: "",
          postal_code: "",
          country: "",
        },
      });
      setError("");
    } catch (error) {
      console.error("Error creating customer:", error);
      setError(error.message || "Failed to create customer");
    }
  };

  const handleAddressChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create New Customer</h2>
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
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.contact_email}
              onChange={(e) =>
                setFormData({ ...formData, contact_email: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone *
            </label>
            <input
              type="tel"
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.contact_phone}
              onChange={(e) =>
                setFormData({ ...formData, contact_phone: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address (Optional)
            </label>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Street Address"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.address.street_address}
                onChange={(e) => handleAddressChange("street_address", e.target.value)}
              />
              <input
                type="text"
                placeholder="City"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.address.city}
                onChange={(e) => handleAddressChange("city", e.target.value)}
              />
              <input
                type="text"
                placeholder="Postal Code"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.address.postal_code}
                onChange={(e) =>
                  handleAddressChange("postal_code", e.target.value)
                }
              />
              <input
                type="text"
                placeholder="Country"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.address.country}
                onChange={(e) => handleAddressChange("country", e.target.value)}
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
              Create Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCustomerModal;