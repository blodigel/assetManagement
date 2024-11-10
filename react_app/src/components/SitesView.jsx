import React, { useState, useEffect } from "react";
import { Plus, Search, MapPin } from "lucide-react";
import { siteService, customerService } from "../api/services";
import apiClient from "../api/client";
import CreateSiteModal from "./Modals/CreateSiteModal";
import SiteModal from "./Modals/SiteModal";

const SitesView = () => {
  const [sites, setSites] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sitesResponse, customersResponse] = await Promise.all([
          siteService.getAllSites(),
          customerService.getAllCustomers(),
        ]);
        setSites(sitesResponse.data);
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

  const handleCreate = async (newSite) => {
    try {
      const response = await apiClient.post('/sites', newSite);
      setSites([...sites, response.data]);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating site:", error);
    }
  };

  const handleUpdate = async (updatedSite) => {
    try {
      await apiClient.put(`/sites/${updatedSite.id}`, updatedSite);
      setSites(
        sites.map((site) =>
          site.id === updatedSite.id ? updatedSite : site
        )
      );
      setShowModal(false);
      setSelectedSite(null);
    } catch (error) {
      console.error("Error updating site:", error);
    }
  };

  const handleDelete = async (siteId) => {
    try {
      await apiClient.delete(`/sites/${siteId}`);
      setSites(sites.filter((site) => site.id !== siteId));
      setShowModal(false);
      setSelectedSite(null);
    } catch (error) {
      console.error("Error deleting site:", error);
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
          <MapPin className="w-6 h-6" />
          Sites
        </h2>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search sites..."
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
            Add Site
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
                Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Primary
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sites
              .filter(
                (site) =>
                  site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  getCustomerName(site.customer_id)
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
              )
              .map((site) => (
                <tr
                  key={site.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setSelectedSite(site);
                    setShowModal(true);
                  }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">{site.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getCustomerName(site.customer_id)}
                  </td>
                  <td className="px-6 py-4">
                    {site.address && (
                      <>
                        {site.address.street_address}, {site.address.city}
                        <br />
                        {site.address.postal_code}, {site.address.country}
                      </>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {site.is_primary ? "Yes" : "No"}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {sites.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">No sites found</div>
      )}

      <CreateSiteModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreate}
        customers={customers}
      />

      {selectedSite && (
        <SiteModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedSite(null);
          }}
          site={selectedSite}
          customers={customers}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default SitesView;