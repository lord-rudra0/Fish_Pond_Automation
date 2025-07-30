import { Link, useLocation } from "wouter";
import { authService } from "../lib/auth";
import { Bell, Fish, ChevronDown, User, Settings, LogOut, Menu, X, Sun, Moon, FileText, HelpCircle, MessageCircle, Download, Plus, Database, RefreshCw, HardDrive } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAutoRefresh } from "@/hooks/use-auto-refresh";
import { useTheme } from "@/hooks/use-theme";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { saveAs } from "file-saver";

export default function Navbar() {
  const [location] = useLocation();
  const user = authService.getUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { refreshInterval } = useAutoRefresh();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: unacknowledgedAlerts = [] } = useQuery({
    queryKey: ['/api/alerts/unacknowledged'],
    refetchInterval: refreshInterval, // Use user-configured interval
  });

  // Fetch sensor data for export
  const { data: sensorReadings = [] } = useQuery({
    queryKey: ['/api/sensor-data'],
    queryParams: { limit: 1000 }, // Get more data for export
  });

  const handleLogout = () => {
    authService.logout();
    window.location.reload();
  };

  // Convert data to CSV
  const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';
    
    const headers = ['Timestamp', 'pH', 'Water Level (cm)', 'Temperature (°C)', 'NH3 (ppm)', 'Turbidity (NTU)'];
    const csvContent = [
      headers.join(','),
      ...data.map(reading => [
        new Date(reading.timestamp).toLocaleString(),
        reading.ph?.toFixed(2) || '',
        reading.waterLevel?.toFixed(2) || '',
        reading.temperature?.toFixed(2) || '',
        reading.nh3?.toFixed(2) || '',
        reading.turbidity?.toFixed(2) || ''
      ].join(','))
    ].join('\n');
    
    return csvContent;
  };

  // Handle export CSV
  const handleExportCSV = () => {
    console.log('Export CSV clicked');
    const csv = convertToCSV(sensorReadings);
    if (!csv) {
      toast({
        title: "No data to export",
        description: "There are no sensor readings available for export.",
        variant: "destructive",
      });
      return;
    }
    
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `sensor_readings_${Date.now()}.csv`);
    
    toast({
      title: "Export successful",
      description: `Exported ${sensorReadings.length} sensor readings to CSV.`,
    });
  };

  // Handle add test data
  const handleAddTestData = async () => {
    console.log('Add test data clicked');
    try {
      await apiRequest('POST', '/api/sensor-data/dummy');
      queryClient.invalidateQueries({ queryKey: ['/api/sensor-data'] });
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      
      toast({
        title: "Test data added",
        description: "New sensor reading has been generated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to add test data",
        variant: "destructive",
      });
    }
  };

  // Handle refresh data
  const handleRefreshData = () => {
    console.log('Refresh data clicked');
    queryClient.invalidateQueries({ queryKey: ['/api/sensor-data'] });
    queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
    
    toast({
      title: "Data refreshed",
      description: "Sensor readings have been updated.",
    });
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", href: "#dashboard" },
    { path: "/sensors", label: "Sensors", href: "#sensors" },
    { path: "/thresholds", label: "Thresholds", href: "#thresholds" },
    { path: "/history", label: "History", href: "#history" },
  ];

  return (
    <nav className="bg-white/95 dark:bg-gray-900/95 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 backdrop-blur-xl shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/dashboard">
              <div className="flex items-center space-x-3 lg:space-x-4 group cursor-pointer">
                <div className="p-2 lg:p-3 rounded-xl lg:rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <Fish className="text-white lg:w-7 lg:h-7" size={24} />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    AquaWatch
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1 hidden sm:block">Pond Monitoring System</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <div className={`relative px-3 lg:px-6 py-2 lg:py-3 text-sm font-medium cursor-pointer transition-all duration-300 rounded-lg lg:rounded-xl group ${
                  location === item.path || location === '/' && item.path === '/dashboard'
                    ? 'text-white bg-gradient-to-r from-blue-600 to-cyan-500 shadow-lg'
                    : 'text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                }`}>
                  <span className="relative z-10">{item.label}</span>
                  {location === item.path || location === '/' && item.path === '/dashboard' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg lg:rounded-xl animate-pulse opacity-20"></div>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 lg:space-x-3">
            {/* Notifications */}
            <div className="relative">
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2 lg:p-3 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 relative transition-all duration-300 rounded-lg lg:rounded-xl group"
              >
                <Bell size={18} className="lg:w-5 lg:h-5 group-hover:scale-110 transition-transform duration-300" />
                {unacknowledgedAlerts.length > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 lg:-top-2 lg:-right-2 h-5 w-5 lg:h-7 lg:w-7 p-0 text-xs flex items-center justify-center animate-pulse shadow-lg"
                  >
                    {unacknowledgedAlerts.length}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2 lg:p-3 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 rounded-lg lg:rounded-xl group"
            >
              {theme === 'dark' ? (
                <Sun size={18} className="lg:w-5 lg:h-5 group-hover:scale-110 transition-transform duration-300" />
              ) : (
                <Moon size={18} className="lg:w-5 lg:h-5 group-hover:scale-110 transition-transform duration-300" />
              )}
            </Button>

            {/* Data Management Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="p-2 lg:p-3 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 rounded-lg lg:rounded-xl group"
                  title="Data Management"
                >
                  <HardDrive size={18} className="lg:w-5 lg:h-5 group-hover:scale-110 transition-transform duration-300" />
                  <span className="ml-1 text-xs hidden sm:inline">Data</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 lg:w-64 mt-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 shadow-xl z-50">
                <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Data Management</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Export, import & test data</p>
                </div>
                <DropdownMenuItem onClick={handleRefreshData} className="py-3 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                  <RefreshCw className="mr-3 h-4 w-4 text-blue-500" />
                  <div>
                    <span className="font-medium">Refresh Data</span>
                    <p className="text-xs text-gray-600 dark:text-gray-300">Update sensor readings</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportCSV} className="py-3 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Download className="mr-3 h-4 w-4 text-green-500" />
                  <div>
                    <span className="font-medium">Export CSV</span>
                    <p className="text-xs text-gray-600 dark:text-gray-300">Download sensor data</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleAddTestData} className="py-3 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Plus className="mr-3 h-4 w-4 text-orange-500" />
                  <div>
                    <span className="font-medium">Add Test Data</span>
                    <p className="text-xs text-gray-600 dark:text-gray-300">Generate sample readings</p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Divider */}
            <div className="h-6 lg:h-8 w-px bg-gray-300 dark:bg-gray-600 mx-1 lg:mx-2 hidden sm:block"></div>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center space-x-2 lg:space-x-3 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 rounded-lg lg:rounded-xl px-2 lg:px-4 py-2 group"
                >
                  <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <User size={16} className="lg:w-[18px] lg:h-[18px] text-white" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-xs lg:text-sm font-semibold hidden sm:block">{user?.name || 'User'}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 hidden lg:block">Administrator</span>
                  </div>
                  <ChevronDown size={14} className="lg:w-4 lg:h-4 group-hover:rotate-180 transition-transform duration-300" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 lg:w-64 mt-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 shadow-xl z-50">
                <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">{user?.email || 'user@example.com'}</p>
                </div>
                <DropdownMenuItem asChild className="py-3 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Link href="/profile" className="flex items-center">
                    <User className="mr-3 h-4 w-4 text-ocean-blue" />
                    <div>
                      <span className="font-medium">Profile</span>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Manage your account</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="py-3 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Link href="/thresholds" className="flex items-center">
                    <Settings className="mr-3 h-4 w-4 text-seafoam" />
                    <div>
                      <span className="font-medium">Settings</span>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Configure system</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="py-3 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Link href="/alerts-history" className="flex items-center">
                    <Bell className="mr-3 h-4 w-4 text-yellow-500" />
                    <div>
                      <span className="font-medium">Alerts History</span>
                      <p className="text-xs text-gray-600 dark:text-gray-300">All notifications</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="py-3 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Link href="/documentation" className="flex items-center">
                    <FileText className="mr-3 h-4 w-4 text-blue-500" />
                    <div>
                      <span className="font-medium">Documentation</span>
                      <p className="text-xs text-gray-600 dark:text-gray-300">User guides & manuals</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="py-3 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Link href="/help" className="flex items-center">
                    <HelpCircle className="mr-3 h-4 w-4 text-green-500" />
                    <div>
                      <span className="font-medium">Help Center</span>
                      <p className="text-xs text-gray-600 dark:text-gray-300">FAQs & support</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="py-3 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Link href="/contact" className="flex items-center">
                    <MessageCircle className="mr-3 h-4 w-4 text-purple-500" />
                    <div>
                      <span className="font-medium">Contact Us</span>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Get in touch</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-600" />
                <DropdownMenuItem onClick={handleLogout} className="py-3 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <LogOut className="mr-3 h-4 w-4" />
                  <div>
                    <span className="font-medium">Log out</span>
                    <p className="text-xs text-gray-600 dark:text-gray-300">Sign out of your account</p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 rounded-lg"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
            <div className="px-4 py-4 space-y-3">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <div 
                    className={`px-4 py-3 text-sm font-medium cursor-pointer transition-all duration-300 rounded-lg ${
                      location === item.path || location === '/' && item.path === '/dashboard'
                        ? 'text-white bg-gradient-to-r from-blue-600 to-cyan-500 shadow-lg'
                        : 'text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </div>
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 px-4 py-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center">
                    <User size={18} className="text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user?.name || 'User'}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Administrator</span>
                  </div>
                </div>
                <div className="px-4 space-y-2">
                  <Link href="/profile">
                    <div className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-300">
                      <User className="mr-3 h-4 w-4" />
                      <span>Profile</span>
                    </div>
                  </Link>
                  <Link href="/thresholds">
                    <div className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-300">
                      <Settings className="mr-3 h-4 w-4" />
                      <span>Settings</span>
                    </div>
                  </Link>
                  <Link href="/alerts-history">
                    <div className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-300">
                      <Bell className="mr-3 h-4 w-4 text-yellow-500" />
                      <span>Alerts History</span>
                    </div>
                  </Link>
                  <Link href="/documentation">
                    <div className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-300">
                      <FileText className="mr-3 h-4 w-4" />
                      <span>Documentation</span>
                    </div>
                  </Link>
                  <Link href="/help">
                    <div className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-300">
                      <HelpCircle className="mr-3 h-4 w-4" />
                      <span>Help Center</span>
                    </div>
                  </Link>
                  <Link href="/contact">
                    <div className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-300">
                      <MessageCircle className="mr-3 h-4 w-4" />
                      <span>Contact Us</span>
                    </div>
                  </Link>
                  
                  {/* Data Management Section */}
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Data Management
                    </div>
                    <div 
                      className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-300 cursor-pointer"
                      onClick={() => {
                        handleRefreshData();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <RefreshCw className="mr-3 h-4 w-4 text-blue-500" />
                      <span>Refresh Data</span>
                    </div>
                    <div 
                      className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-300 cursor-pointer"
                      onClick={() => {
                        handleExportCSV();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <Download className="mr-3 h-4 w-4 text-green-500" />
                      <span>Export CSV</span>
                    </div>
                    <div 
                      className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-all duration-300 cursor-pointer"
                      onClick={() => {
                        handleAddTestData();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <Plus className="mr-3 h-4 w-4 text-orange-500" />
                      <span>Add Test Data</span>
                    </div>
                  </div>
                  
                  <div 
                    className="flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-300 cursor-pointer"
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    <span>Log out</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
