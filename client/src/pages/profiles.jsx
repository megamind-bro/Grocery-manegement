import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Profiles() {
  const [me, setMe] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [adminAuth, setAdminAuth] = useState("");
  const [products, setProducts] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = await res.json();
      setMe(data);
      if (data) {
        setName(data.name || "");
        setEmail(data.email || "");
      }
    })();
  }, []);

  async function saveProfile() {
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, email }),
    });
    if (!res.ok) return alert("Failed to update profile");
    const data = await res.json();
    setMe(data);
    alert("Profile updated");
  }

  async function loadAllProducts() {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card>
        <CardContent className="p-6 space-y-4">
          <h1 className="text-2xl font-semibold">Profile</h1>
          {me ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>
              <Button onClick={saveProfile}>Save</Button>
            </>
          ) : (
            <div>Please log in to manage your profile.</div>
          )}
        </CardContent>
      </Card>

      {me?.isAdmin && (
        <div className="mt-8">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-semibold">Admin</h2>
              <div className="flex gap-2">
                <Button onClick={loadAllProducts}>View All Products</Button>
                <Button onClick={async () => {
                  const name = prompt("Product name") || "";
                  const priceStr = prompt("Price (number)") || "0";
                  const price = parseFloat(priceStr);
                  const image = prompt("Image URL") || "";
                  const category = prompt("Category") || "general";
                  const res = await fetch("/api/admin/products", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ name, price, image, category }),
                  });
                  if (!res.ok) return alert("Failed to add product");
                  const p = await res.json();
                  alert(`Added product #${p.id}`);
                  await loadAllProducts();
                }}>Add Product</Button>
              </div>

              {products.length > 0 && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {products.map((p) => (
                    <div key={p.id} className="border rounded p-3">
                      <div className="font-medium">{p.name}</div>
                      <div className="text-sm text-gray-600">KSh {p.price}</div>
                      <div className="text-sm">{p.category}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}


