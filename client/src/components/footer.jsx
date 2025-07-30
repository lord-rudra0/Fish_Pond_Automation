import { Fish, Facebook, Twitter, Linkedin, Github } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <Fish className="text-primary text-2xl mr-3" size={24} />
              <h3 className="text-xl font-bold">AquaWatch</h3>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Advanced fish pond automation system providing real-time monitoring and intelligent alerts for optimal aquaculture management.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Github size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Features</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Real-time Monitoring</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Smart Alerts</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Historical Data</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Mobile App</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API Access</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/documentation" className="hover:text-white transition-colors">Documentation</Link></li>
              <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <div className="text-sm text-gray-400">
            © 2024 AquaWatch. All rights reserved.
          </div>
          <div className="mt-4 sm:mt-0 text-sm text-gray-400">
            Powered by IoT sensors and real-time analytics
          </div>
        </div>
      </div>
    </footer>
  );
}
