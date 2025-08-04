import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  FileText, 
  Settings, 
  BarChart3, 
  AlertTriangle, 
  Database,
  Zap,
  Shield,
  Users,
  Download,
  ExternalLink
} from "lucide-react";
import { Link } from "wouter";

export default function Documentation() {
  const sections = [
    {
      title: "Getting Started",
      icon: <Zap className="h-6 w-6" />,
      items: [
        {
          title: "System Overview",
          description: "Learn about AquaWatch's core features and capabilities",
          link: "#overview"
        },
        {
          title: "Quick Setup Guide",
          description: "Get your pond monitoring system up and running in minutes",
          link: "#setup"
        },
        {
          title: "First Dashboard",
          description: "Understanding your dashboard and key metrics",
          link: "#dashboard"
        }
      ]
    },
    {
      title: "Sensor Management",
      icon: <Settings className="h-6 w-6" />,
      items: [
        {
          title: "Sensor Types",
          description: "pH, Temperature, Water Level, NH3, and Turbidity sensors",
          link: "#sensors"
        },
        {
          title: "Installation Guide",
          description: "Proper sensor placement and calibration",
          link: "#installation"
        },
        {
          title: "Maintenance",
          description: "Regular cleaning and calibration procedures",
          link: "#maintenance"
        }
      ]
    },
    {
      title: "Data & Analytics",
      icon: <BarChart3 className="h-6 w-6" />,
      items: [
        {
          title: "Real-time Monitoring",
          description: "Understanding live sensor data and trends",
          link: "#monitoring"
        },
        {
          title: "Historical Data",
          description: "Analyzing past performance and patterns",
          link: "#history"
        },
        {
          title: "Data Export",
          description: "Exporting data for external analysis",
          link: "#export"
        }
      ]
    },
    {
      title: "Alerts & Notifications",
      icon: <AlertTriangle className="h-6 w-6" />,
      items: [
        {
          title: "Threshold Configuration",
          description: "Setting up custom alert thresholds",
          link: "#thresholds"
        },
        {
          title: "Alert Types",
          description: "Critical, warning, and informational alerts",
          link: "#alert-types"
        },
        {
          title: "Notification Settings",
          description: "Configuring email and push notifications",
          link: "#notifications"
        }
      ]
    },
    {
      title: "User Management",
      icon: <Users className="h-6 w-6" />,
      items: [
        {
          title: "User Roles",
          description: "Administrator, operator, and viewer permissions",
          link: "#roles"
        },
        {
          title: "Account Settings",
          description: "Managing your profile and preferences",
          link: "#account"
        },
        {
          title: "Security",
          description: "Password policies and account protection",
          link: "#security"
        }
      ]
    },
    {
      title: "API & Integration",
      icon: <Database className="h-6 w-6" />,
      items: [
        {
          title: "REST API",
          description: "Accessing data programmatically",
          link: "#api"
        },
        {
          title: "Webhooks",
          description: "Real-time data integration",
          link: "#webhooks"
        },
        {
          title: "Third-party Tools",
          description: "Integrating with external systems",
          link: "#integration"
        }
      ]
    }
  ];

  const quickLinks = [
    { title: "User Manual", icon: <FileText />, href: "/docs/manual.pdf" },
    { title: "API Reference", icon: <Database />, href: "/docs/api" },
    { title: "Troubleshooting", icon: <AlertTriangle />, href: "/help" },
    { title: "Video Tutorials", icon: <ExternalLink />, href: "/tutorials" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 shadow-lg">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Documentation
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                Complete guide to AquaWatch pond monitoring system
              </p>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="flex flex-wrap gap-3 mt-6">
            {quickLinks.map((link, index) => (
              <Button
                key={index}
                variant="outline"
                className="flex items-center space-x-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                asChild
              >
                <a href={link.href} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2">
                  {React.cloneElement(link.icon, { className: 'h-4 w-4 text-gray-700 dark:text-gray-300' })}
                  <span className="text-gray-700 dark:text-gray-200">{link.title}</span>
                </a>
              </Button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <input
              type="text"
              placeholder="Search documentation..."
              className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Documentation Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section, sectionIndex) => (
            <Card key={sectionIndex} className="hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500">
                    {React.cloneElement(section.icon, { className: 'h-5 w-5 text-white' })}
                  </div>
                  <CardTitle className="text-xl text-gray-900 dark:text-white">{section.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="group">
                    <a
                      href={item.link}
                      className="block p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                    >
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {item.description}
                      </p>
                    </a>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Resources */}
        <div className="mt-12">
          <Card className="border-0 shadow-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
                <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <span>Additional Resources</span>
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Download guides, watch tutorials, and get support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="flex items-center space-x-2 h-auto p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600" asChild>
                  <a href="/docs/installation-guide.pdf" download className="w-full">
                    <Download className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                    <div className="text-left">
                      <div className="font-semibold text-gray-800 dark:text-gray-100">Installation Guide</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">PDF Download</div>
                    </div>
                  </a>
                </Button>
                
                <Button variant="outline" className="flex items-center space-x-2 h-auto p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600" asChild>
                  <a href="/docs/troubleshooting.pdf" download className="w-full">
                    <AlertTriangle className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                    <div className="text-left">
                      <div className="font-semibold text-gray-800 dark:text-gray-100">Troubleshooting</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Common Issues</div>
                    </div>
                  </a>
                </Button>
                
                <Button variant="outline" className="flex items-center space-x-2 h-auto p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600" asChild>
                  <a href="/contact" className="w-full">
                    <Users className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                    <div className="text-left">
                      <div className="font-semibold text-gray-800 dark:text-gray-100">Contact Support</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Get Help</div>
                    </div>
                  </a>
                </Button>
                
                <Button variant="outline" className="flex items-center space-x-2 h-auto p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600" asChild>
                  <a href="/help" className="w-full">
                    <FileText className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                    <div className="text-left">
                      <div className="font-semibold text-gray-800 dark:text-gray-100">Help Center</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">FAQs & Guides</div>
                    </div>
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Search icon component
function Search(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
} 