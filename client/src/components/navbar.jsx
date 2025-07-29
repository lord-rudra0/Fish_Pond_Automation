import { Link, useLocation } from "wouter";
import { authService } from "../lib/auth";
import { Bell, Fish, ChevronDown, User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

export default function Navbar() {
  const [location] = useLocation();
  const user = authService.getUser();

  const { data: unacknowledgedAlerts = [] } = useQuery({
    queryKey: ['/api/alerts/unacknowledged'],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const handleLogout = () => {
    authService.logout();
    window.location.reload();
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", href: "#dashboard" },
    { path: "/sensors", label: "Sensors", href: "#sensors" },
    { path: "/thresholds", label: "Thresholds", href: "#thresholds" },
    { path: "/history", label: "History", href: "#history" },
  ];

  return (
    <nav className="bg-card dark:bg-card shadow-lg border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <Link href="/dashboard">
                <h1 className="text-2xl font-bold text-primary flex items-center cursor-pointer">
                  <Fish className="mr-2" size={24} />
                  AquaWatch
                </h1>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <Link key={item.path} href={item.path}>
                    <span className={`px-3 py-2 text-sm font-medium cursor-pointer transition-colors ${
                      location === item.path || location === '/' && item.path === '/dashboard'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-gray-600 dark:text-gray-300 hover:text-primary'
                    }`}>
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <Button variant="ghost" size="sm" className="p-2 text-gray-500 hover:text-primary relative">
                <Bell size={18} />
                {unacknowledgedAlerts.length > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
                  >
                    {unacknowledgedAlerts.length}
                  </Badge>
                )}
              </Button>
            </div>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-primary">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User size={16} className="text-primary" />
                  </div>
                  <span className="text-sm font-medium hidden sm:block">{user?.name || 'User'}</span>
                  <ChevronDown size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/thresholds">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
