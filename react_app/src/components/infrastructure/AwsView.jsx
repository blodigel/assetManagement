import React, { useState, useEffect } from "react";
import { Plus, Search, Cloud } from "lucide-react";
import { infrastructureService, customerService } from "../../api/services";
import CreateAwsModal from "./CreateAwsModal";

const AwsView = () => {
  const [infrastructure, setInfrastructure] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [infraResponse, customersResponse] = await Promise.all([
          infrastructureService.getAllLocations(),
          customerService.getAllCustomers(),
        ]);
        
        // Filter only AWS infrastructure
        const awsInfra = infraResponse.data.filter(infra => infra.type === 'aws');
        setInfrastructure(awsInfra);
        setCustomers(customersResponse.data);
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
      const response = await infrastructureService.createLocation({
        ...newInfrastructure,
        type: 'aws'
      });
      setInfrastructure([...infrastructure, response.data]);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating infrastructure:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this AWS infrastructure?")) {
      try {
        await infrastructureService.deleteLocation(id);
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
          <Cloud className="w-6 h-6" />
          AWS Infrastructure
        </h2>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search AWS infrastructure..."
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
            Add AWS Infrastructure
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
                Region
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                VPC ID
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
                    .includes(searchTerm.toLowerCase())
              )
              .map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getCustomerName(item.customer_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.config.region}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.config.vpc_id}
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
          No AWS infrastructure found
        </div>
      )}

      <CreateAwsModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreate}
        customers={customers}
      />
    </div>
  );
};

export default AwsView;