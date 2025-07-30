import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  HelpCircle, 
  Search, 
  MessageCircle, 
  Phone, 
  Mail, 
  FileText,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Video,
  BookOpen
} from "lucide-react";
import { Link } from "wouter";

export default function Help() {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const faqs = [
    {
      category: "Getting Started",
      items: [
        {
          question: "How do I set up my first sensor?",
          answer: "To set up your first sensor, follow these steps: 1) Unbox the sensor and check all components, 2) Place the sensor in your pond at the recommended depth, 3) Connect the sensor to the monitoring unit, 4) Power on the system and wait for initial calibration, 5) Access the dashboard to verify readings are coming through."
        },
        {
          question: "What sensors are included in the basic package?",
          answer: "The basic AquaWatch package includes: pH sensor, Temperature sensor, Water Level sensor, NH3 (Ammonia) sensor, and Turbidity sensor. Each sensor is calibrated and ready for immediate use."
        },
        {
          question: "How long does initial setup take?",
          answer: "Initial setup typically takes 15-30 minutes. This includes sensor placement, system calibration, and dashboard configuration. The system will be fully operational within 1 hour of installation."
        }
      ]
    },
    {
      category: "Troubleshooting",
      items: [
        {
          question: "My sensor readings seem inaccurate, what should I do?",
          answer: "If sensor readings seem inaccurate: 1) Check if the sensor is properly submerged and positioned, 2) Clean the sensor with a soft brush and clean water, 3) Recalibrate the sensor using the calibration kit, 4) Contact support if issues persist."
        },
        {
          question: "The system is not connecting to the internet",
          answer: "For connectivity issues: 1) Check your WiFi password and signal strength, 2) Ensure the monitoring unit is within range of your router, 3) Restart the monitoring unit, 4) Check if your internet service is working, 5) Contact support if the problem continues."
        },
        {
          question: "I'm not receiving alert notifications",
          answer: "To fix notification issues: 1) Check your notification settings in the dashboard, 2) Verify your email address is correct, 3) Check your spam folder, 4) Ensure your phone notifications are enabled if using mobile app, 5) Test the notification system from settings."
        }
      ]
    },
    {
      category: "Data & Analytics",
      items: [
        {
          question: "How do I export my sensor data?",
          answer: "To export data: 1) Go to the History page, 2) Select your desired date range, 3) Choose the data format (CSV, JSON, or Excel), 4) Click the Export button, 5) Download will start automatically. Data can be exported for any time period."
        },
        {
          question: "Can I integrate with other systems?",
          answer: "Yes! AquaWatch provides a REST API for integration. You can access real-time data, historical records, and configure alerts programmatically. Check our API documentation for detailed integration guides and code examples."
        },
        {
          question: "How long is my data stored?",
          answer: "Sensor data is stored for 2 years by default. You can adjust retention settings in your account preferences. Data older than 2 years is automatically archived but can be restored upon request."
        }
      ]
    },
    {
      category: "Account & Billing",
      items: [
        {
          question: "How do I change my password?",
          answer: "To change your password: 1) Go to your Profile page, 2) Click on 'Security Settings', 3) Enter your current password, 4) Enter and confirm your new password, 5) Click 'Update Password'. You'll receive a confirmation email."
        },
        {
          question: "Can I add multiple users to my account?",
          answer: "Yes! You can add multiple users with different permission levels: Administrator (full access), Operator (monitoring and alerts), and Viewer (read-only access). Manage users from the Account Settings page."
        },
        {
          question: "How do I cancel my subscription?",
          answer: "To cancel your subscription: 1) Go to Account Settings, 2) Click on 'Billing', 3) Select 'Cancel Subscription', 4) Choose your cancellation reason, 5) Confirm cancellation. You'll have access until the end of your current billing period."
        }
      ]
    }
  ];

  const supportOptions = [
    {
      title: "Live Chat",
      description: "Get instant help from our support team",
      icon: <MessageCircle className="h-6 w-6" />,
      action: "Start Chat",
      href: "#chat",
      color: "bg-blue-500"
    },
    {
      title: "Phone Support",
      description: "Speak directly with a technician",
      icon: <Phone className="h-6 w-6" />,
      action: "Call Now",
      href: "tel:+1-800-AQUAWATCH",
      color: "bg-green-500"
    },
    {
      title: "Email Support",
      description: "Send us a detailed message",
      icon: <Mail className="h-6 w-6" />,
      action: "Send Email",
      href: "mailto:support@aquawatch.com",
      color: "bg-purple-500"
    },
    {
      title: "Video Tutorials",
      description: "Watch step-by-step guides",
      icon: <Video className="h-6 w-6" />,
      action: "Watch Now",
      href: "/tutorials",
      color: "bg-orange-500"
    }
  ];

  const quickGuides = [
    {
      title: "Sensor Installation Guide",
      description: "Step-by-step sensor setup instructions",
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      href: "/docs/installation"
    },
    {
      title: "Troubleshooting Common Issues",
      description: "Solutions for frequent problems",
      icon: <AlertTriangle className="h-5 w-5 text-orange-500" />,
      href: "/docs/troubleshooting"
    },
    {
      title: "API Integration Guide",
      description: "Connect AquaWatch to your systems",
      icon: <ExternalLink className="h-5 w-5 text-blue-500" />,
      href: "/docs/api"
    },
    {
      title: "User Manual",
      description: "Complete system documentation",
      icon: <BookOpen className="h-5 w-5 text-purple-500" />,
      href: "/docs/manual"
    }
  ];

  const filteredFaqs = faqs.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 shadow-lg">
              <HelpCircle className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Help Center
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                Find answers, get support, and learn more about AquaWatch
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <input
              type="text"
              placeholder="Search for help articles, FAQs, or troubleshooting guides..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Support Options */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Get Support</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {supportOptions.map((option, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`p-2 rounded-lg ${option.color}`}>
                      {option.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{option.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{option.description}</p>
                    </div>
                  </div>
                  <Button className="w-full" asChild>
                    <a href={option.href}>{option.action}</a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Guides */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Quick Guides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickGuides.map((guide, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <a href={guide.href} className="flex items-center space-x-3 group">
                    {guide.icon}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {guide.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{guide.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Frequently Asked Questions
            {searchTerm && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredFaqs.reduce((total, cat) => total + cat.items.length, 0)} results)
              </span>
            )}
          </h2>
          
          {filteredFaqs.map((category, categoryIndex) => (
            <Card key={categoryIndex} className="mb-6 border-0 shadow-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl">{category.category}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {category.items.map((faq, faqIndex) => {
                  const faqId = `${categoryIndex}-${faqIndex}`;
                  const isExpanded = expandedFaq === faqId;
                  
                  return (
                    <div key={faqIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                      <button
                        onClick={() => setExpandedFaq(isExpanded ? null : faqId)}
                        className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-lg"
                      >
                        <span className="font-medium text-gray-900 dark:text-white">{faq.question}</span>
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-500" />
                        )}
                      </button>
                      {isExpanded && (
                        <div className="px-4 pb-3">
                          <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Section */}
        <div className="text-center">
          <Card className="border-0 shadow-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Still Need Help?
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Our support team is here to help you get the most out of AquaWatch
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/contact">Contact Support</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/documentation">View Documentation</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 