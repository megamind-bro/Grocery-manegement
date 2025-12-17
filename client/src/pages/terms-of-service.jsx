import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Terms of Service</h1>
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
              Please read these Terms of Service carefully before using GrocerySync. By using our service, you agree to be bound by these terms.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h3>
            <p className="text-gray-600">
              By accessing and using GrocerySync, you accept and agree to be bound by these Terms of Service and all applicable laws and regulations.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">2. Use of Service</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>You must be at least 18 years old to use our service</li>
              <li>You are responsible for maintaining the confidentiality of your account</li>
              <li>You agree to provide accurate and complete information</li>
              <li>You will not use the service for any illegal or unauthorized purpose</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">3. Orders and Payments</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>All orders are subject to product availability</li>
              <li>Prices are subject to change without notice</li>
              <li>Payment must be made at the time of order placement</li>
              <li>We reserve the right to refuse or cancel orders</li>
              <li>Refunds will be processed according to our refund policy</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">4. Delivery</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Delivery times are estimates and not guaranteed</li>
              <li>You are responsible for providing accurate delivery addresses</li>
              <li>Delivery fees may apply and will be shown at checkout</li>
              <li>We are not liable for delays caused by circumstances beyond our control</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">5. Product Information</h3>
            <p className="text-gray-600">
              We strive to provide accurate product information, but we do not warrant that product descriptions or other content is accurate, complete, or error-free.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">6. Limitation of Liability</h3>
            <p className="text-gray-600">
              GrocerySync shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">7. Changes to Terms</h3>
            <p className="text-gray-600">
              We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">8. Contact Us</h3>
            <p className="text-gray-600">
              For questions about these Terms of Service, please contact us at:
              <br />
              Email: legal@grocerysync.com
              <br />
              Phone: +254 700 000 000
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



