import React, { useState, useEffect } from "react";
import { Network, Shield, Search, Plus } from "lucide-react";
import { assetService, siteService, customerService } from "../../api/services";
import CreateNetworkDeviceModal from "../Modals/CreateNetworkDeviceModal";

const NetworkDevicesView = ({ deviceType }) => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sites, setSites] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Log the deviceType being requested
        console.log("Fetching devices of type:", deviceType);

        // Make the API calls
        const [devicesResponse, sitesResponse, customersResponse] = await Promise.all([
          assetService.getAssetsByType(deviceType),
          siteService.getAllSites(),
          customerService.getAllCustomers(),
        ]);

        console.log("API response:", devicesResponse.data);
        setDevices(devicesResponse.data);
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
  }, [deviceType]);

  // For debugging - log whenever devices change
  useEffect(() => {
    console.log("Current devices:", devices);
  }, [devices]);

  const getIcon = () => {
    return deviceType === "switch" ? (
      <Network className="w-6 h-6" />
    ) : (
      <Shield className="w-6 h-6" />
    );
  };

  const getTitle = () => {
    return deviceType === "switch" ? "Network Switches" : "Firewalls";
  };

  const handleCreate = async (newDevice) => {
    try {
      const response = await assetService.createAsset(newDevice);
      setDevices([...devices, response.data]);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating device:", error);
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
          {getIcon()}
          {getTitle()}
        </h2>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${deviceType}es...`}
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
            Add {deviceType === "switch" ? "Switch" : "Firewall"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hostname
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IP Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Model
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Site
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {devices
              .filter(
                (device) =>
                  device.hostname
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  device.ip_address.includes(searchTerm)
              )
              .map((device) => (
                <tr key={device.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {device.hostname}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {device.ip_address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {device.specs.manufacturer} {device.specs.model}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getCustomerName(device.customer_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getSiteName(device.site_id)}
                  </td>
                  <td className="px-6 py-4">{device.notes}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {devices.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          No {deviceType}es found
        </div>
      )}

      <CreateNetworkDeviceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreate}
        sites={sites}
        customers={customers}
        deviceType={deviceType}
      />
    </div>
  );
};

export default NetworkDevicesView;