import React, { useState, useEffect } from "react";
import { Plus, Search, Server, Cloud, Database, Monitor } from "lucide-react";
import { infrastructureService, siteService, customerService } from "../api/services";
import CreateInfrastructureModal from "./Modals/CreateInfrastructureModal";

const InfrastructureView = () => {
  const [infrastructure, setInfrastructure] = useState([]);
  const [sites, setSites] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vmsById, setVmsById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [infraResponse, sitesResponse, customersResponse] = await Promise.all([
          infrastructureService.getAllInfrastructure(),
          siteService.getAllSites(),
          customerService.getAllCustomers(),
        ]);
        setInfrastructure(infraResponse.data);
        setSites(sitesResponse.data);
        setCustomers(customersResponse.data);

        // Fetch VMs for each infrastructure
        const vmPromises = infraResponse.data.map(infra =>
          infrastructureService.getVMsByInfrastructure(infra.id)
        );
        const vmResponses = await Promise.all(vmPromises);
        const vmsMap = {};
        infraResponse.data.forEach((infra, index) => {
          vmsMap[infra.id] = vmResponses[index].data;
        });
        setVmsById(vmsMap);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreate = async (newInfrastructure) => {
    try {
      const response = await infrastructureService.createInfrastructure(newInfrastructure);
      setInfrastructure([...infrastructure, response.data]);
      setVmsById({ ...vmsById, [response.data.id]: [] });
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating infrastructure:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this infrastructure? Any VMs hosted here will need to be migrated first.")) {
      try {
        await infrastructureService.deleteInfrastructure(id);
        setInfrastructure(infrastructure.filter((item) => item.id !== id));
        const newVmsById = { ...vmsById };
        delete newVmsById[id];
        setVmsById(newVmsById);
      } catch (error) {
        console.error("Error deleting infrastructure:", error);
      }
    }
  };

  const getSiteName = (siteId) => {
    const site = sites.find((s) => s.id === siteId);
    return site ? site.name : "Unknown Site";
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? customer.name : "Unknown Customer";
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'host':
        return <Monitor className="w-5 h-5" />;
      case 'datacenter':
        return <Database className="w-5 h-5" />;
      case 'cloud':
        return <Cloud className="w-5 h-5" />;
      default:
        return <Server className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type) => {
    const types = infrastructureService.getInfrastructureTypes();
    const typeObj = types.find(t => t.id === type);
    return typeObj ? typeObj.name : type;
  };

  const getCloudProviderName = (providerId) => {
    const providers = infrastructureService.getCloudProviders();
    const provider = providers.find(p => p.id === providerId);
    return provider ? provider.name : providerId;
  };

  const renderCapacity = (details) => {
    if (!details?.capacity) return "-";
    const { cpu_cores, memory_gb, storage_gb } = details.capacity;
    return `${cpu_cores} CPU, ${memory_gb}GB RAM, ${storage_gb}GB Storage`;
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );

  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Server className="w-6 h-6" />
          VM Hosting Locations
        </h2>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search infrastructure..."
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
            Add Location
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Capacity/Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hosted VMs
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {infrastructure
              .filter(
                (item) =>
                  item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  getCustomerName(item.customer_id)
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
              )
              .map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getTypeIcon(item.type)}
                      <span className="ml-2">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getTypeLabel(item.type)}
                    {item.type === 'cloud' && (
                      <span className="ml-2 text-sm text-gray-500">
                        ({getCloudProviderName(item.cloud_provider)})
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getCustomerName(item.customer_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.type === 'cloud'
                      ? item.details?.location || '-'
                      : getSiteName(item.site_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.type === 'host'
                      ? renderCapacity(item.details)
                      : item.details?.specifications || '-'}
                  </td>
                  <td className="px-6 py-4">
                    {vmsById[item.id]?.length > 0 ? (
                      <div className="text-sm">
                        {vmsById[item.id].map(vm => (
                          <div key={vm.id} className="mb-1">
                            {vm.name}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500">No VMs</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-900"
                      disabled={vmsById[item.id]?.length > 0}
                      title={vmsById[item.id]?.length > 0 ? "Cannot delete while hosting VMs" : ""}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {infrastructure.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          No infrastructure found
        </div>
      )}

      <CreateInfrastructureModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreate}
        sites={sites}
        customers={customers}
      />
    </div>
  );
};

export default InfrastructureView;