import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Shield, 
  Bell, 
  Settings, 
  Key, 
  Calendar,
  Activity,
  Save,
  Edit,
  Eye,
  EyeOff
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function Profile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch user profile data
  const { data: userProfile, isLoading } = useQuery({
    queryKey: ['/api/user/profile'],
    onSuccess: (data) => {
      setFormData(prev => ({
        ...prev,
        name: data.name || '',
        email: data.email || ''
      }));
    }
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data) => apiRequest('PUT', '/api/user/profile', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data) => apiRequest('PUT', '/api/user/password', data),
    onSuccess: () => {
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      toast({
        title: "Password changed",
        description: "Your password has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    },
  });

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    const { name, email } = formData;
    updateProfileMutation.mutate({ name, email });
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = formData;
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl ocean-gradient">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-ocean-blue to-seafoam bg-clip-text text-transparent">
                  Profile Settings
                </h1>
                <p className="text-lg text-gray-700 dark:text-gray-300 mt-1">
                  Manage your account settings and preferences
                </p>
              </div>
            </div>
          </div>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant="outline"
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-ocean-blue hover:text-white transition-all duration-300"
          >
            <Edit className="h-4 w-4" />
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <Card className="cool-card floating-card">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                    <AvatarImage src={userProfile?.avatar} />
                    <AvatarFallback className="text-3xl bg-gradient-to-br from-ocean-blue to-seafoam text-white">
                      {getInitials(userProfile?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">{userProfile?.name || 'User'}</CardTitle>
              <CardDescription className="text-base text-gray-600 dark:text-gray-300">{userProfile?.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-ocean-blue/10 to-seafoam/10 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-300">Member since</span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-coral/10 to-sand/10 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-300">Last login</span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {userProfile?.lastLogin ? new Date(userProfile.lastLogin).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-500/10 to-green-600/10 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-300">Account status</span>
                <Badge className="bg-green-500 text-white hover:bg-green-600">Active</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card className="cool-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <User className="h-5 w-5 text-ocean-blue" />
                Personal Information
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Update your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="Enter your full name"
                      className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="Enter your email"
                      className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                    />
                  </div>
                </div>
                {isEditing && (
                  <Button 
                    type="submit" 
                    disabled={updateProfileMutation.isPending}
                    className="ocean-gradient text-white hover:shadow-lg hover:shadow-ocean-blue/25 transition-all duration-300"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="cool-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Shield className="h-5 w-5 text-coral" />
                Security Settings
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Change your password and manage security preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword" className="text-gray-700 dark:text-gray-300">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.currentPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Enter current password"
                      className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="newPassword" className="text-gray-700 dark:text-gray-300">New Password</Label>
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Enter new password"
                      className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirm new password"
                      className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  disabled={changePasswordMutation.isPending}
                  className="coral-gradient text-white hover:shadow-lg hover:shadow-coral/25 transition-all duration-300"
                >
                  <Key className="mr-2 h-4 w-4" />
                  Change Password
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card className="cool-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Bell className="h-5 w-5 text-seafoam" />
                Notification Preferences
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Configure how you receive alerts and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-gray-800 dark:text-gray-200">Email Notifications</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Receive alerts via email
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-gray-800 dark:text-gray-200">Critical Alerts</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Immediate notifications for critical sensor readings
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-gray-800 dark:text-gray-200">Weekly Reports</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Receive weekly summary reports
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </div>
  );
} 