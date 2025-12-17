import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CookiePolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Cookie Policy</h1>
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
              This Cookie Policy explains how GrocerySync uses cookies and similar technologies to recognize you when you visit our website and use our services.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">1. What Are Cookies?</h3>
            <p className="text-gray-600">
              Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">2. How We Use Cookies</h3>
            <p className="text-gray-600 mb-2">We use cookies for the following purposes:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li><strong>Essential Cookies:</strong> Required for the website to function properly, including authentication and security</li>
              <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our website</li>
              <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements (with your consent)</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">3. Types of Cookies We Use</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Session cookies: Temporary cookies that expire when you close your browser</li>
              <li>Persistent cookies: Remain on your device for a set period or until you delete them</li>
              <li>First-party cookies: Set by our website</li>
              <li>Third-party cookies: Set by third-party services we use</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">4. Managing Cookies</h3>
            <p className="text-gray-600 mb-2">
              You can control and manage cookies in several ways:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Browser settings: Most browsers allow you to refuse or accept cookies</li>
              <li>Browser extensions: Use privacy-focused extensions to block cookies</li>
              <li>Opt-out tools: Use industry opt-out tools for advertising cookies</li>
            </ul>
            <p className="text-gray-600 mt-2">
              Note: Disabling cookies may affect the functionality of our website.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">5. Third-Party Cookies</h3>
            <p className="text-gray-600">
              We may use third-party services that set their own cookies, such as analytics providers and payment processors. These third parties have their own privacy policies.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">6. Updates to This Policy</h3>
            <p className="text-gray-600">
              We may update this Cookie Policy from time to time. We will notify you of any changes by posting the new policy on this page.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">7. Contact Us</h3>
            <p className="text-gray-600">
              If you have questions about our use of cookies, please contact us at:
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



