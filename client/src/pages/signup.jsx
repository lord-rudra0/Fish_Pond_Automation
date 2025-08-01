import { useState } from "react";
import { Link, useLocation } from "wouter";
import { authService } from "../lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Fish, Loader2, Shield, UserCheck, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Signup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false
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

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    try {
      await authService.register(formData.name, formData.email, formData.password);
      toast({
        title: "Account created successfully!",
        description: "Welcome to AquaWatch! You can now sign in.",
      });
      setLocation("/login");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900 flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-purple-400/20 dark:bg-purple-500/20 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-pink-400/20 dark:bg-pink-500/20 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
        <div className="absolute bottom-32 left-20 w-12 h-12 bg-rose-400/20 dark:bg-rose-500/20 rounded-full animate-bounce" style={{ animationDelay: '2s', animationDuration: '3.5s' }}></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-indigo-400/20 dark:bg-indigo-500/20 rounded-full animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '4.5s' }}></div>
        
        {/* Sparkle Effects */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400/60 dark:bg-yellow-300/60 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-yellow-400/60 dark:bg-yellow-300/60 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-1.5 h-1.5 bg-yellow-400/60 dark:bg-yellow-300/60 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
        
        {/* Wave Animation */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-purple-600/10 dark:from-purple-500/10 to-transparent animate-pulse"></div>
      </div>

      <div className="w-full max-w-lg relative z-12">
        {/* Logo with Animation */}
        <div className="text-center mb-6 animate-fade-in">
          <div className="flex items-center justify-center mb-4 group">
            <div className="relative">
              <Fish className="text-purple-600 dark:text-purple-400 mr-3 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12" size={40} />
              <div className="absolute -inset-2 bg-purple-500/20 dark:bg-purple-400/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 dark:from-purple-400 dark:via-pink-400 dark:to-rose-400 bg-clip-text text-transparent animate-pulse">
              AquaWatch
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">Join the Future of Pond Monitoring</p>
          
          {/* Feature Icons */}
          <div className="flex justify-center space-x-6 mt-4">
            <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400">
              <Shield className="h-4 w-4 animate-pulse" />
              <span className="text-sm font-medium">Secure</span>
            </div>
            <div className="flex items-center space-x-2 text-pink-600 dark:text-pink-400">
              <UserCheck className="h-4 w-4 animate-pulse" style={{ animationDelay: '0.5s' }} />
              <span className="text-sm font-medium">Easy Setup</span>
            </div>
            <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400">
              <Sparkles className="h-4 w-4 animate-pulse" style={{ animationDelay: '1s' }} />
              <span className="text-sm font-medium">Smart Features</span>
            </div>
          </div>
        </div>

        {/* Signup Card with Glass Effect */}
        <Card className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 shadow-2xl border border-white/20 dark:border-gray-700/50 transform transition-all duration-500 hover:scale-105 hover:shadow-3xl">
          <CardHeader className="text-center pb-4 px-6 pt-6">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-2">
              Create Account
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300 text-base">
              Start monitoring your pond with intelligent automation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-8 pb-8">
            {error && (
              <Alert variant="destructive" className="border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20 animate-shake">
                <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name and Email in responsive grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2 min-w-0">
                  <Label htmlFor="name" className="text-gray-700 dark:text-gray-200 font-medium text-sm">Full Name</Label>
                  <div className="relative group">
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-purple-400/20 transition-all duration-300 group-hover:border-purple-400 dark:group-hover:border-purple-300 text-sm"
                    />
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-all duration-300 pointer-events-none"></div>
                  </div>
                </div>

                <div className="space-y-2 min-w-0">
                  <Label htmlFor="email" className="text-gray-700 dark:text-gray-200 font-medium text-sm">Email Address</Label>
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
                      className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-purple-400/20 transition-all duration-300 group-hover:border-purple-400 dark:group-hover:border-purple-300 text-sm"
                    />
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-all duration-300 pointer-events-none"></div>
                  </div>
                </div>
              </div>

              {/* Password and Confirm Password in responsive grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2 min-w-0">
                  <Label htmlFor="password" className="text-gray-700 dark:text-gray-200 font-medium text-sm">Password</Label>
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
                      className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-purple-400/20 transition-all duration-300 group-hover:border-purple-400 dark:group-hover:border-purple-300 text-sm"
                    />
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-all duration-300 pointer-events-none"></div>
                  </div>
                </div>

                <div className="space-y-2 min-w-0">
                  <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-200 font-medium text-sm">Confirm Password</Label>
                  <div className="relative group">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-purple-400/20 transition-all duration-300 group-hover:border-purple-400 dark:group-hover:border-purple-300 text-sm"
                    />
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-all duration-300 pointer-events-none"></div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Password must be at least 8 characters long</p>

              <div className="flex items-start space-x-2 pt-1">
                <Checkbox
                  id="agreeToTerms"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, agreeToTerms: checked }))
                  }
                  disabled={isLoading}
                  className="border-2 border-gray-300 dark:border-gray-600 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 mt-1"
                />
                <Label htmlFor="agreeToTerms" className="text-gray-700 dark:text-gray-200 font-medium cursor-pointer text-sm leading-relaxed">
                  I agree to the{" "}
                  <span className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 underline cursor-pointer">
                    Terms of Service
                  </span>{" "}
                  and{" "}
                  <span className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 underline cursor-pointer">
                    Privacy Policy
                  </span>
                </Label>
              </div>

              <Button 
                type="submit" 
                className="w-full py-3 mt-2 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:via-pink-700 hover:to-rose-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
                disabled={isLoading || !formData.agreeToTerms}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create My Account"
                )}
              </Button>
            </form>

            <div className="text-center pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Already have an account?{" "}
                <Link href="/login">
                  <span className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold cursor-pointer transition-colors duration-300 underline decoration-2 underline-offset-4 hover:decoration-purple-500">
                    Sign In
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
