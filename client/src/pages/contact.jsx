import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  MessageCircle, 
  Send,
  CheckCircle,
  AlertCircle,
  Building,
  Globe,
  User,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    priority: "normal"
  });

  const contactMethods = [
    {
      title: "Email Support",
      description: "Get detailed responses within 24 hours",
      icon: <Mail className="h-6 w-6" />,
      value: "support@aquawatch.com",
      action: "Send Email",
      href: "mailto:support@aquawatch.com",
      color: "bg-blue-500"
    },
    {
      title: "Phone Support",
      description: "Speak with our technical experts",
      icon: <Phone className="h-6 w-6" />,
      value: "+1 (800) AQUAWATCH",
      action: "Call Now",
      href: "tel:+1-800-AQUAWATCH",
      color: "bg-green-500"
    },
    {
      title: "Live Chat",
      description: "Instant help during business hours",
      icon: <MessageCircle className="h-6 w-6" />,
      value: "Available 9AM-6PM EST",
      action: "Start Chat",
      href: "#chat",
      color: "bg-purple-500"
    },
    {
      title: "Office Address",
      description: "Visit our headquarters",
      icon: <MapPin className="h-6 w-6" />,
      value: "123 AquaTech Blvd, Water City, WC 12345",
      action: "Get Directions",
      href: "https://maps.google.com",
      color: "bg-orange-500"
    }
  ];

  const supportHours = [
    { day: "Monday - Friday", hours: "9:00 AM - 6:00 PM EST" },
    { day: "Saturday", hours: "10:00 AM - 4:00 PM EST" },
    { day: "Sunday", hours: "Emergency Support Only" }
  ];

  const priorityOptions = [
    { value: "low", label: "Low Priority", description: "General inquiry or feedback" },
    { value: "normal", label: "Normal Priority", description: "Standard support request" },
    { value: "high", label: "High Priority", description: "System issue affecting operation" },
    { value: "urgent", label: "Urgent", description: "Critical system failure" }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message Sent!",
        description: "Thank you for contacting us. We'll get back to you within 24 hours.",
      });
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        priority: "normal"
      });
      setIsSubmitting(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 shadow-lg">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Contact Us
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                Get in touch with our support team
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Send className="h-6 w-6" />
                  <span>Send us a Message</span>
                </CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        className="border-gray-200 dark:border-gray-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email address"
                        className="border-gray-200 dark:border-gray-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="Brief description of your inquiry"
                      className="border-gray-200 dark:border-gray-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority Level</Label>
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {priorityOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label} - {option.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Please provide detailed information about your inquiry..."
                      rows={6}
                      className="border-gray-200 dark:border-gray-700 resize-none"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending Message...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Contact Methods */}
            <Card className="border-0 shadow-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Get in Touch</CardTitle>
                <CardDescription>
                  Multiple ways to reach our support team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactMethods.map((method, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className={`p-2 rounded-lg ${method.color}`}>
                      {method.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{method.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{method.description}</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{method.value}</p>
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-blue-600 dark:text-blue-400 mt-1"
                        asChild
                      >
                        <a href={method.href}>{method.action}</a>
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Business Hours */}
            <Card className="border-0 shadow-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Support Hours</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {supportHours.map((schedule, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{schedule.day}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-300">{schedule.hours}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <AlertCircle className="h-4 w-4 inline mr-1" />
                    Emergency support available 24/7 for critical issues
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card className="border-0 shadow-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="h-5 w-5" />
                  <span>About AquaWatch</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">www.aquawatch.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">500+ Happy Customers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">ISO 9001 Certified</span>
                </div>
                <div className="pt-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Trusted by Aquaculture Industry
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <Card className="border-0 shadow-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Quick answers to common questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">How quickly will I get a response?</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    We typically respond to all inquiries within 24 hours. Urgent issues are addressed within 4 hours during business hours.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">What information should I include?</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Please include your system model, sensor types, error messages, and any relevant screenshots to help us assist you faster.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Do you offer remote support?</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Yes, we offer remote diagnostics and support for most issues. Our technicians can access your system securely with your permission.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Is there a warranty on support?</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    All our support services are backed by our satisfaction guarantee. If you're not satisfied, we'll work until you are.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 