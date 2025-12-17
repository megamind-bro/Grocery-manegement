import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Last Updated: {new Date().toLocaleDateString()}</h2>
            <p className="text-gray-600">
              At GrocerySync, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our grocery delivery service.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">1. Information We Collect</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Personal information such as name, email address, phone number, and delivery address</li>
              <li>Payment information (processed securely through third-party payment processors)</li>
              <li>Order history and preferences</li>
              <li>Device information and usage data</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">2. How We Use Your Information</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Process and fulfill your orders</li>
              <li>Communicate with you about your orders and account</li>
              <li>Improve our services and user experience</li>
              <li>Send promotional offers and updates (with your consent)</li>
              <li>Comply with legal obligations</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">3. Information Sharing</h3>
            <p className="text-gray-600 mb-2">
              We do not sell your personal information. We may share your information with:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Delivery partners to fulfill your orders</li>
              <li>Payment processors to process transactions</li>
              <li>Service providers who assist in our operations</li>
              <li>Legal authorities when required by law</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">4. Data Security</h3>
            <p className="text-gray-600">
              We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">5. Your Rights</h3>
            <p className="text-gray-600 mb-2">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Access and update your personal information</li>
              <li>Request deletion of your account and data</li>
              <li>Opt-out of promotional communications</li>
              <li>File a complaint with relevant data protection authorities</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">6. Contact Us</h3>
            <p className="text-gray-600">
              If you have questions about this Privacy Policy, please contact us at:
              <br />
              Email: privacy@grocerysync.com
              <br />
              Phone: +254 700 000 000
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



