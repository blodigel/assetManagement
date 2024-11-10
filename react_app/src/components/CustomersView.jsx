import React, { useState, useEffect } from "react";
import { Plus, Search, Building2 } from "lucide-react";
import { customerService } from "../api/services";
import CreateCustomerModal from "./Modals/CreateCustomerModal";
import CustomerModal from "./Modals/CustomerModal";

const CustomersView = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const response = await customerService.getAllCustomers();
        setCustomers(response.data);
      } catch (err) {
        console.error("Error fetching customers:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleCreate = async (newCustomer) => {
    try {
      const response = await customerService.createCustomer(newCustomer);
      setCustomers([...customers, response.data]);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating customer:", error);
    }
  };

  const handleUpdate = async (updatedCustomer) => {
    try {
      await customerService.updateCustomer(updatedCustomer.id, updatedCustomer);
      setCustomers(
        customers.map((customer) =>
          customer.id === updatedCustomer.id ? updatedCustomer : customer
        )
      );
      setShowModal(false);
      setSelectedCustomer(null);
    } catch (error) {
      console.error("Error updating customer:", error);
    }
  };

  const handleDelete = async (customerId) => {
    try {
      await customerService.deleteCustomer(customerId);
      setCustomers(customers.filter((customer) => customer.id !== customerId));
      setShowModal(false);
      setSelectedCustomer(null);
    } catch (error) {
      console.error("Error deleting customer:", error);
    }
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
          <Building2 className="w-6 h-6" />
          Customers
        </h2>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
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
            Add Customer
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
                Contact Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Address
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers
              .filter(
                (customer) =>
                  customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  customer.contact_email
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  customer.contact_phone.includes(searchTerm)
              )
              .map((customer) => (
                <tr
                  key={customer.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setSelectedCustomer(customer);
                    setShowModal(true);
                  }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {customer.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {customer.contact_email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {customer.contact_phone}
                  </td>
                  <td className="px-6 py-4">
                    {customer.address && (
                      <>
                        {customer.address.street_address}, {customer.address.city}
                        <br />
                        {customer.address.postal_code}, {customer.address.country}
                      </>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {customers.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">No customers found</div>
      )}

      <CreateCustomerModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreate}
      />

      {selectedCustomer && (
        <CustomerModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedCustomer(null);
          }}
          customer={selectedCustomer}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default CustomersView;