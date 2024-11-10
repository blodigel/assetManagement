import React, { useState, useEffect } from "react";
import { Server, Search, Plus } from "lucide-react";
import {
  assetService,
  customerService,
  infrastructureService,
} from "../../api/services";
import VirtualMachineModal from "../Modals/VirtualMachineModal";
import CreateVirtualMachineModal from "../Modals/CreateVirtualMachineModal";

const VirtualMachinesView = () => {
  const [vms, setVms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [infrastructures, setInfrastructures] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedVm, setSelectedVm] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const fetchVMs = async () => {
      try {
        setLoading(true);
        const [vmsResponse, infrastructuresResponse, customerResponse] =
          await Promise.all([
            assetService.getAssetsByType("vm"),
            infrastructureService.getAllLocations(),
            customerService.getAllCustomers(),
          ]);
        setVms(vmsResponse.data);
        setInfrastructures(infrastructuresResponse.data);
        setCustomers(customerResponse.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVMs();
  }, []);

  const handleUpdate = async (updatedVm) => {
    try {
      await assetService.updateAsset(updatedVm.id, updatedVm);
      setVms(vms.map((vm) => (vm.id === updatedVm.id ? updatedVm : vm)));
      setShowModal(false);
    } catch (error) {
      console.error("Error updating VM:", error);
    }
  };

  const handleDelete = async (vmId) => {
    try {
      await assetService.deleteAsset(vmId);
      setVms(vms.filter((vm) => vm.id !== vmId));
      setShowModal(false);
    } catch (error) {
      console.error("Error deleting VM:", error);
    }
  };

  const getCustomerName = (customerID) => {
    const customer = customers.find((customer) => customer.id === customerID);
    return customer ? customer.name : "Unknown Customer";
  };

  const getInfrastructureName = (infraId) => {
    const infrastructure = infrastructures.find(
      (infra) => infra.id === infraId
    );
    return infrastructure ? infrastructure.name : "Unknown Location";
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Server className="w-6 h-6" />
          Virtual Machines
        </h2>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search VMs..."
              className="pl-10 pr-4 py-2 border rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add VM
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Hostname
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                IP Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Specs
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {vms
              .filter((vm) => {
                const searchLower = searchTerm.toLowerCase();
                return (
                  vm.hostname.toLowerCase().includes(searchLower) ||
                  vm.ip_address.includes(searchLower) ||
                  vm.specs.os.toLowerCase().includes(searchLower) ||
                  vm.specs.os_version.toLowerCase().includes(searchLower) ||
                  getCustomerName(vm.customer_id)
                    .toLowerCase()
                    .includes(searchLower) ||
                  getInfrastructureName(vm.specs.infrastructure_location_id)
                    .toLowerCase()
                    .includes(searchLower) ||
                  (vm.notes && vm.notes.toLowerCase().includes(searchLower)) // Add null check for notes
                );
              })
              .map((vm) => (
                <tr
                  key={vm.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setSelectedVm(vm); // Set the selected VM here
                    setShowModal(true);
                  }}
                >
                  <td className="px-6 py-4">{vm.hostname}</td>
                  <td className="px-6 py-4">{vm.ip_address}</td>
                  <td className="px-6 py-4">
                    {getCustomerName(vm.customer_id)}
                  </td>
                  <td className="px-6 py-4">
                    {vm.specs.cpu_cores} CPU / {vm.specs.ram_gb}GB RAM
                    <br />
                    <span className="text-sm text-gray-500">
                      {vm.specs.os} {vm.specs.os_version}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {getInfrastructureName(vm.specs.infrastructure_location_id)}
                  </td>
                  <td className="px-6 py-4">{vm.notes}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {selectedVm && (
        <VirtualMachineModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedVm(null);
          }}
          vm={selectedVm}
          customers={customers}
          infrastructures={infrastructures}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
      <CreateVirtualMachineModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        customers={customers}
        infrastructures={infrastructures}
        onCreate={async (newVm) => {
          try {
            const response = await assetService.createAsset(newVm);
            setVms([...vms, response.data]);
            setShowCreateModal(false);
          } catch (error) {
            console.error("Error creating VM:", error);
          }
        }}
      />
    </div>
  );
};

export default VirtualMachinesView;
