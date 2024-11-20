import React, { useState, useEffect } from "react";
import { Plus, Search, Home } from "lucide-react";
import { infrastructureService, customerService, siteService } from "../../api/services";
import CreateOnPremiseModal from "./CreateOnPremiseModal";

const OnPremiseView = () => {
  const [infrastructure, setInfrastructure] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [infraResponse, customersResponse, sitesResponse] = await Promise.all([
          infrastructureService.getAllInfrastructure(),
          customerService.getAllCustomers(),
          siteService.getAllSites(),
        ]);
        
        // Filter only On-Premise infrastructure
        const onPremiseInfra = infraResponse.data.filter(infra => infra.type === 'on_premise');
        setInfrastructure(onPremiseInfra);
        setCustomers(customersResponse.data);
        setSites(sitesResponse.data);
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
      const response = await infrastructureService.createInfrastructure({
        ...newInfrastructure,
        type: 'on_premise'
      });
      setInfrastructure([...infrastructure, response.data]);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating infrastructure:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this on-premise infrastructure?")) {
      try {
        await infrastructureService.deleteInfrastructure(id);
        setInfrastructure(infrastructure.filter((item) => item.id !== id));
      } catch (error) {
        console.error("Error deleting infrastructure:", error);
      }
    }
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? customer.name : "Unknown Customer";
  };

  const getSiteName = (siteId) => {
    const site = sites.find((s) => s.id === siteId);
    return site ? site.name : "Unknown Site";
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
          <Home className="w-6 h-6" />
          On-Premise Infrastructure
        </h2>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search on-premise infrastructure..."
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
            Add On-Premise Infrastructure
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
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Site
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
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
                    .includes(searchTerm.toLowerCase()) ||
                  getSiteName(item.site_id)
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
              )
              .map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getCustomerName(item.customer_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getSiteName(item.site_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.config.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-900"
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
          No on-premise infrastructure found
        </div>
      )}

      <CreateOnPremiseModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreate}
        customers={customers}
        sites={sites}
      />
    </div>
  );
};

export default OnPremiseView;