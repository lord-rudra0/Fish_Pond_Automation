import { useState } from "react";
import { Link, useLocation } from "wouter";
import { authService } from "../lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Fish, Loader2, Waves, Droplets, Thermometer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await authService.login(formData.email, formData.password);
      toast({
        title: "Welcome back!",
        description: "You have been successfully logged in.",
      });
      // Force a page reload to update authentication state
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Bubbles */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-400/20 dark:bg-blue-500/20 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-cyan-400/20 dark:bg-cyan-500/20 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
        <div className="absolute bottom-32 left-20 w-12 h-12 bg-teal-400/20 dark:bg-teal-500/20 rounded-full animate-bounce" style={{ animationDelay: '2s', animationDuration: '3.5s' }}></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-indigo-400/20 dark:bg-indigo-500/20 rounded-full animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '4.5s' }}></div>
        
        {/* Wave Animation */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-blue-600/10 dark:from-blue-500/10 to-transparent animate-pulse"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo with Animation */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center mb-4 group">
            <div className="relative">
              <Fish className="text-blue-600 dark:text-blue-400 mr-3 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12" size={40} />
              <div className="absolute -inset-2 bg-blue-500/20 dark:bg-blue-400/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 dark:from-blue-400 dark:via-cyan-400 dark:to-teal-400 bg-clip-text text-transparent animate-pulse">
              AquaWatch
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">Fish Pond Automation System</p>
          
          {/* Feature Icons */}
          <div className="flex justify-center space-x-6 mt-6">
            <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
              <Waves className="h-5 w-5 animate-pulse" />
              <span className="text-sm font-medium">Smart Monitoring</span>
            </div>
            <div className="flex items-center space-x-2 text-cyan-600 dark:text-cyan-400">
              <Droplets className="h-5 w-5 animate-pulse" style={{ animationDelay: '0.5s' }} />
              <span className="text-sm font-medium">Water Quality</span>
            </div>
            <div className="flex items-center space-x-2 text-teal-600 dark:text-teal-400">
              <Thermometer className="h-5 w-5 animate-pulse" style={{ animationDelay: '1s' }} />
              <span className="text-sm font-medium">Temperature</span>
            </div>
          </div>
        </div>

        {/* Login Card with Glass Effect */}
        <Card className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 shadow-2xl border border-white/20 dark:border-gray-700/50 transform transition-all duration-500 hover:scale-105 hover:shadow-3xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300 text-lg">
              Sign in to access your pond monitoring dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive" className="border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20 animate-shake">
                <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-200 font-medium">Email Address</Label>
                <div className="relative group">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all duration-300 group-hover:border-blue-400 dark:group-hover:border-blue-300"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 transition-all duration-300 pointer-events-none"></div>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-200 font-medium">Password</Label>
                <div className="relative group">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all duration-300 group-hover:border-blue-400 dark:group-hover:border-blue-300"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 transition-all duration-300 pointer-events-none"></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="rememberMe"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, rememberMe: checked }))
                    }
                    disabled={isLoading}
                    className="border-2 border-gray-300 dark:border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <Label htmlFor="rememberMe" className="text-gray-700 dark:text-gray-200 font-medium cursor-pointer">Remember me</Label>
                </div>
                <Button 
                  variant="link" 
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-300 p-0"
                >
                  Forgot password?
                </Button>
              </div>

              <Button 
                type="submit" 
                className="w-full py-3 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In to Dashboard"
                )}
              </Button>
            </form>

            <div className="text-center pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-300">
                Don't have an account?{" "}
                <Link href="/signup">
                  <span className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold cursor-pointer transition-colors duration-300 underline decoration-2 underline-offset-4 hover:decoration-blue-500">
                    Create Account
                  </span>
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  );
}
