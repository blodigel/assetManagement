import React, { useState } from 'react';
import {
  Server,
  Network,
  Shield,
  Users,
  Menu,
  X,
  ChevronDown,
  Building2,
  LayoutDashboard,
  Cloud,
  Database,
  Home
} from 'lucide-react';

import VirtualMachinesView from './components/assets/VirtualMachinesView';
import NetworkDevicesView from './components/assets/NetworkDevicesView';
import CustomersView from './components/CustomersView';
import SitesView from './components/SitesView';
import Dashboard from './components/Dashboard';
import AzureView from './components/infrastructure/AzureView';
import AwsView from './components/infrastructure/AwsView';
import DatacenterView from './components/infrastructure/DatacenterView';
import OnPremiseView from './components/infrastructure/OnPremiseView';

const App = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [assetMenuOpen, setAssetMenuOpen] = useState(true);
  const [infrastructureMenuOpen, setInfrastructureMenuOpen] = useState(true);

  // Navigation items configuration
  const assetTypes = [
    { 
      id: 'vms', 
      label: 'Virtual Machines', 
      icon: <Server className="w-4 h-4" />,
      component: <VirtualMachinesView />
    },
    { 
      id: 'switches', 
      label: 'Switches', 
      icon: <Network className="w-4 h-4" />,
      component: <NetworkDevicesView deviceType="switch" />
    },
    { 
      id: 'firewalls', 
      label: 'Firewalls', 
      icon: <Shield className="w-4 h-4" />,
      component: <NetworkDevicesView deviceType="firewall" />
    }
  ];

  const infrastructureTypes = [
    {
      id: 'azure',
      label: 'Azure',
      icon: <Cloud className="w-4 h-4" />,
    },
    {
      id: 'aws',
      label: 'AWS',
      icon: <Cloud className="w-4 h-4" />,
    },
    {
      id: 'datacenter',
      label: 'Datacenter',
      icon: <Database className="w-4 h-4" />,
    },
    {
      id: 'on_premise',
      label: 'On-Premise',
      icon: <Home className="w-4 h-4" />,
    }
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentView} />;
      case 'vms':
        return <VirtualMachinesView />;
      case 'switches':
        return <NetworkDevicesView deviceType="switch" />;
      case 'firewalls':
        return <NetworkDevicesView deviceType="firewall" />;
      case 'customers':
        return <CustomersView />;
      case 'sites':
        return <SitesView />;
      case 'azure':
        return <AzureView />;
      case 'aws':
        return <AwsView />;
      case 'datacenter':
        return <DatacenterView />;
      case 'on_premise':
        return <OnPremiseView />;
      default:
        return <Dashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-lg transition-all duration-300`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <h1 className={`font-bold ${sidebarOpen ? 'text-xl' : 'hidden'}`}>
              Asset Manager
            </h1>
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Sidebar Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {/* Dashboard */}
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 ${
                  currentView === 'dashboard' ? 'bg-blue-50 text-blue-600' : ''
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                {sidebarOpen && <span>Dashboard</span>}
              </button>

              {/* Infrastructure Section */}
              <div>
                <button
                  onClick={() => setInfrastructureMenuOpen(!infrastructureMenuOpen)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-100`}
                >
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5" />
                    {sidebarOpen && <span>Infrastructure</span>}
                  </div>
                  {sidebarOpen && (
                    <ChevronDown 
                      className={`w-4 h-4 transition-transform ${
                        infrastructureMenuOpen ? 'rotate-180' : ''
                      }`} 
                    />
                  )}
                </button>
                
                {sidebarOpen && infrastructureMenuOpen && (
                  <div className="ml-4 mt-2 space-y-1">
                    {infrastructureTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setCurrentView(type.id)}
                        className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 ${
                          currentView === type.id ? 'bg-blue-50 text-blue-600' : ''
                        }`}
                      >
                        {type.icon}
                        <span>{type.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Assets Section */}
              <div>
                <button
                  onClick={() => setAssetMenuOpen(!assetMenuOpen)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-100`}
                >
                  <div className="flex items-center gap-3">
                    <Server className="w-5 h-5" />
                    {sidebarOpen && <span>Assets</span>}
                  </div>
                  {sidebarOpen && (
                    <ChevronDown 
                      className={`w-4 h-4 transition-transform ${
                        assetMenuOpen ? 'rotate-180' : ''
                      }`} 
                    />
                  )}
                </button>
                
                {sidebarOpen && assetMenuOpen && (
                  <div className="ml-4 mt-2 space-y-1">
                    {assetTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setCurrentView(type.id)}
                        className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 ${
                          currentView === type.id ? 'bg-blue-50 text-blue-600' : ''
                        }`}
                      >
                        {type.icon}
                        <span>{type.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Customers Section */}
              <button
                onClick={() => setCurrentView('customers')}
                className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 ${
                  currentView === 'customers' ? 'bg-blue-50 text-blue-600' : ''
                }`}
              >
                <Users className="w-5 h-5" />
                {sidebarOpen && <span>Customers</span>}
              </button>

              {/* Sites Section */}
              <button
                onClick={() => setCurrentView('sites')}
                className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 ${
                  currentView === 'sites' ? 'bg-blue-50 text-blue-600' : ''
                }`}
              >
                <Building2 className="w-5 h-5" />
                {sidebarOpen && <span>Sites</span>}
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default App;