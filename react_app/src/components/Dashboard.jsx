import React, { useState, useEffect } from "react";
import {
  Users,
  MapPin,
  Server,
  Network,
  Shield,
  Building2,
  ArrowRight,
} from "lucide-react";
import {
  customerService,
  siteService,
  assetService,
} from "../api/services";

const StatCard = ({ icon: Icon, title, value, onClick, color }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-lg p-6 shadow hover:shadow-md transition-shadow cursor-pointer"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-2xl font-bold mt-2">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
    <div className="flex items-center mt-4 text-sm text-gray-600 hover:text-gray-800">
      <span>View details</span>
      <ArrowRight className="w-4 h-4 ml-2" />
    </div>
  </div>
);

const RecentActivityCard = ({ title, items }) => (
  <div className="bg-white rounded-lg p-6 shadow">
    <h3 className="font-semibold mb-4">{title}</h3>
    <div className="space-y-4">
      {items.map((item, index) => (
        <div
          key={index}
          className="flex items-center justify-between py-2 border-b last:border-0"
        >
          <div className="flex items-center">
            <div
              className={`p-2 rounded-full mr-3 ${
                item.type === "vm"
                  ? "bg-purple-100"
                  : item.type === "network"
                  ? "bg-blue-100"
                  : "bg-green-100"
              }`}
            >
              {item.type === "vm" ? (
                <Server className="w-4 h-4 text-purple-600" />
              ) : item.type === "network" ? (
                <Network className="w-4 h-4 text-blue-600" />
              ) : (
                <MapPin className="w-4 h-4 text-green-600" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-xs text-gray-500">{item.description}</p>
            </div>
          </div>
          <span className="text-xs text-gray-500">{item.time}</span>
        </div>
      ))}
    </div>
  </div>
);

const Dashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    customers: 0,
    sites: 0,
    vms: 0,
    switches: 0,
    firewalls: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [customers, sites, vms, switches, firewalls] = await Promise.all([
          customerService.getAllCustomers(),
          siteService.getAllSites(),
          assetService.getAssetsByType("vm"),
          assetService.getAssetsByType("switch"),
          assetService.getAssetsByType("firewall"),
        ]);

        setStats({
          customers: customers.data.length,
          sites: sites.data.length,
          vms: vms.data.length,
          switches: switches.data.length,
          firewalls: firewalls.data.length,
        });
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );

  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={Users}
          title="Total Customers"
          value={stats.customers}
          onClick={() => onNavigate('customers')}
          color="bg-blue-500"
        />
        <StatCard
          icon={MapPin}
          title="Total Sites"
          value={stats.sites}
          onClick={() => onNavigate('sites')}
          color="bg-green-500"
        />
        <StatCard
          icon={Server}
          title="Virtual Machines"
          value={stats.vms}
          onClick={() => onNavigate('vms')}
          color="bg-purple-500"
        />
        <StatCard
          icon={Network}
          title="Network Switches"
          value={stats.switches}
          onClick={() => onNavigate('switches')}
          color="bg-indigo-500"
        />
        <StatCard
          icon={Shield}
          title="Firewalls"
          value={stats.firewalls}
          onClick={() => onNavigate('firewalls')}
          color="bg-red-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivityCard
          title="Recent Assets"
          items={[
            {
              type: "vm",
              name: "Web Server",
              description: "New virtual machine added",
              time: "2 hours ago",
            },
            {
              type: "network",
              name: "Core Switch",
              description: "Configuration updated",
              time: "5 hours ago",
            },
            {
              type: "site",
              name: "London Office",
              description: "New site added",
              time: "1 day ago",
            },
          ]}
        />

        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => onNavigate('customers')}
                className="flex items-center p-3 rounded-lg border hover:bg-gray-50"
              >
                <Building2 className="w-5 h-5 mr-2 text-blue-500" />
                <span>Add Customer</span>
              </button>
              <button
                onClick={() => onNavigate('sites')}
                className="flex items-center p-3 rounded-lg border hover:bg-gray-50"
              >
                <MapPin className="w-5 h-5 mr-2 text-green-500" />
                <span>Add Site</span>
              </button>
              <button
                onClick={() => onNavigate('vms')}
                className="flex items-center p-3 rounded-lg border hover:bg-gray-50"
              >
                <Server className="w-5 h-5 mr-2 text-purple-500" />
                <span>Add VM</span>
              </button>
              <button
                onClick={() => onNavigate('switches')}
                className="flex items-center p-3 rounded-lg border hover:bg-gray-50"
              >
                <Network className="w-5 h-5 mr-2 text-indigo-500" />
                <span>Add Network Device</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="font-semibold mb-4">Asset Distribution</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Virtual Machines</span>
                <div className="flex items-center">
                  <div className="w-32 h-2 bg-gray-200 rounded-full mr-2">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{
                        width: `${(stats.vms /
                          (stats.vms + stats.switches + stats.firewalls)) *
                          100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm">{stats.vms}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Network Switches</span>
                <div className="flex items-center">
                  <div className="w-32 h-2 bg-gray-200 rounded-full mr-2">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{
                        width: `${(stats.switches /
                          (stats.vms + stats.switches + stats.firewalls)) *
                          100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm">{stats.switches}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Firewalls</span>
                <div className="flex items-center">
                  <div className="w-32 h-2 bg-gray-200 rounded-full mr-2">
                    <div
                      className="h-full bg-red-500 rounded-full"
                      style={{
                        width: `${(stats.firewalls /
                          (stats.vms + stats.switches + stats.firewalls)) *
                          100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm">{stats.firewalls}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;