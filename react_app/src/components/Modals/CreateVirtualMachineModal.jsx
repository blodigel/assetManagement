import React, { useState } from "react";
import { X } from "lucide-react";

const CreateVirtualMachineModal = ({
  isOpen,
  onClose,
  customers,
  infrastructures,
  onCreate,
}) => {
  const [newVm, setNewVm] = useState({
    hostname: "",
    ip_address: "",
    asset_type: "vm",
    customer_id: customers[0]?.id || "",
    notes: "",
    specs: {
      cpu_cores: 1,
      ram_gb: 1,
      os: "",
      os_version: "",
      infrastructure_location_id: infrastructures[0]?.id || "",
    },
  });

  const filteredInfrastructures = infrastructures.filter(
    (infra) => infra.customer_id === newVm.customer_id
  );

  const handleCustomerChange = (customerId) => {
    setNewVm({
      ...newVm,
      customer_id: customerId,
      specs: {
        ...newVm.specs,
        infrastructure_location_id: "", // Reset infrastructure selection
      },
    });
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onCreate(newVm);
      onClose();
    } catch (error) {
      console.error("Error creating VM:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create New Virtual Machine</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Basic Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Hostname
              </label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                value={newVm.hostname}
                onChange={(e) =>
                  setNewVm({ ...newVm, hostname: e.target.value })
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
                value={newVm.ip_address}
                onChange={(e) =>
                  setNewVm({ ...newVm, ip_address: e.target.value })
                }
              />
            </div>
          </div>

          {/* Specs */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-3">Specifications</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  CPU Cores
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  value={newVm.specs.cpu_cores}
                  onChange={(e) =>
                    setNewVm({
                      ...newVm,
                      specs: {
                        ...newVm.specs,
                        cpu_cores: parseInt(e.target.value),
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  RAM (GB)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  value={newVm.specs.ram_gb}
                  onChange={(e) =>
                    setNewVm({
                      ...newVm,
                      specs: {
                        ...newVm.specs,
                        ram_gb: parseInt(e.target.value),
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Operating System
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  value={newVm.specs.os}
                  onChange={(e) =>
                    setNewVm({
                      ...newVm,
                      specs: { ...newVm.specs, os: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  OS Version
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  value={newVm.specs.os_version}
                  onChange={(e) =>
                    setNewVm({
                      ...newVm,
                      specs: { ...newVm.specs, os_version: e.target.value },
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Customer and Infrastructure */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Customer
              </label>
              <select
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                value={newVm.customer_id}
                onChange={(e) => handleCustomerChange(e.target.value)}
              >
                <option value="">Select Customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Infrastructure Location
              </label>
              <select
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                value={newVm.specs.infrastructure_location_id}
                onChange={(e) =>
                  setNewVm({
                    ...newVm,
                    specs: {
                      ...newVm.specs,
                      infrastructure_location_id: e.target.value,
                    },
                  })
                }
                disabled={!newVm.customer_id} // Disable if no customer selected
              >
                <option value="">
                  {!newVm.customer_id
                    ? "Select a customer first"
                    : "Select Location"}
                </option>
                {filteredInfrastructures.map((infra) => (
                  <option key={infra.id} value={infra.id}>
                    {infra.name}
                  </option>
                ))}
              </select>
              {newVm.customer_id && filteredInfrastructures.length === 0 && (
                <p className="mt-1 text-sm text-red-500">
                  No infrastructure locations available for this customer
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              rows="3"
              value={newVm.notes}
              onChange={(e) => setNewVm({ ...newVm, notes: e.target.value })}
            />
          </div>

          {/* Buttons */}
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
              Create VM
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateVirtualMachineModal;
