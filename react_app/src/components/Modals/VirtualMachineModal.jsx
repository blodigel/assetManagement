import React, { useState } from "react";
import { X } from "lucide-react";

const VirtualMachineModal = ({
  isOpen,
  onClose,
  vm,
  customers,
  infrastructures,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedVm, setEditedVm] = useState(vm);

  if (!isOpen) return null;

  const handleUpdate = async () => {
    try {
      await onUpdate(editedVm);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating VM:", error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this VM?")) {
      try {
        await onDelete(vm.id);
        onClose();
      } catch (error) {
        console.error("Error deleting VM:", error);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {isEditing ? "Edit Virtual Machine" : "Virtual Machine Details"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Basic Info Section */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Hostname
              </label>
              {isEditing ? (
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  value={editedVm.hostname}
                  onChange={(e) =>
                    setEditedVm({ ...editedVm, hostname: e.target.value })
                  }
                />
              ) : (
                <p className="mt-1">{vm.hostname}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                IP Address
              </label>
              {isEditing ? (
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  value={editedVm.ip_address}
                  onChange={(e) =>
                    setEditedVm({ ...editedVm, ip_address: e.target.value })
                  }
                />
              ) : (
                <p className="mt-1">{vm.ip_address}</p>
              )}
            </div>
          </div>

          {/* Specs Section */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-3">Specifications</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  CPU Cores
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    value={editedVm.specs.cpu_cores}
                    onChange={(e) =>
                      setEditedVm({
                        ...editedVm,
                        specs: {
                          ...editedVm.specs,
                          cpu_cores: parseInt(e.target.value),
                        },
                      })
                    }
                  />
                ) : (
                  <p className="mt-1">{vm.specs.cpu_cores}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  RAM (GB)
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    value={editedVm.specs.ram_gb}
                    onChange={(e) =>
                      setEditedVm({
                        ...editedVm,
                        specs: {
                          ...editedVm.specs,
                          ram_gb: parseInt(e.target.value),
                        },
                      })
                    }
                  />
                ) : (
                  <p className="mt-1">{vm.specs.ram_gb}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Operating System
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    value={editedVm.specs.os}
                    onChange={(e) =>
                      setEditedVm({
                        ...editedVm,
                        specs: { ...editedVm.specs, os: e.target.value },
                      })
                    }
                  />
                ) : (
                  <p className="mt-1">{vm.specs.os}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  OS Version
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    value={editedVm.specs.os_version}
                    onChange={(e) =>
                      setEditedVm({
                        ...editedVm,
                        specs: {
                          ...editedVm.specs,
                          os_version: e.target.value,
                        },
                      })
                    }
                  />
                ) : (
                  <p className="mt-1">{vm.specs.os_version}</p>
                )}
              </div>
            </div>
          </div>

          {/* Location and Customer Section */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Customer
              </label>
              {isEditing ? (
                <select
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  value={editedVm.customer_id}
                  onChange={(e) =>
                    setEditedVm({ ...editedVm, customer_id: e.target.value })
                  }
                >
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="mt-1">
                  {customers.find((c) => c.id === vm.customer_id)?.name ||
                    "Unknown Customer"}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Infrastructure Location
              </label>
              {isEditing ? (
                <select
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  value={editedVm.specs.infrastructure_location_id}
                  onChange={(e) =>
                    setEditedVm({
                      ...editedVm,
                      specs: {
                        ...editedVm.specs,
                        infrastructure_location_id: e.target.value,
                      },
                    })
                  }
                >
                  {infrastructures.map((infra) => (
                    <option key={infra.id} value={infra.id}>
                      {infra.name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="mt-1">
                  {infrastructures.find(
                    (i) => i.id === vm.specs.infrastructure_location_id
                  )?.name || "Unknown Location"}
                </p>
              )}
            </div>
          </div>

          {/* Notes Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            {isEditing ? (
              <textarea
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                rows="3"
                value={editedVm.notes || ""}
                onChange={(e) =>
                  setEditedVm({ ...editedVm, notes: e.target.value })
                }
              />
            ) : (
              <p className="mt-1">{vm.notes || "No notes"}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50"
                >
                  Delete
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Edit
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualMachineModal;
