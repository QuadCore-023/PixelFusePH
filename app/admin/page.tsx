"use client";

import { useState, useEffect } from "react";
import { LogOut, RefreshCw, Settings, Package, ShoppingBag, Search, Filter, ArrowUpDown, Trash2 } from "lucide-react";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"products" | "orders" | "account" | "categories" | "website">("products");
  
  // Data states
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>(null);
  
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  
  // Category Form State
  const [newCategoryName, setNewCategoryName] = useState("");

  // Product Form states
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [confirmDeleteProduct, setConfirmDeleteProduct] = useState(false);

  // Manage Existing Products filter & sort states
  const [productSearch, setProductSearch] = useState("");
  const [productSort, setProductSort] = useState<string>("default");
  const [selectedFilterTags, setSelectedFilterTags] = useState<string[]>([]);

  // Product Form states
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    image: "",
    isAvailable: true,
  });
  const [productImage, setProductImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Account states
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Check login state on mount
  useEffect(() => {
    const isAuth = localStorage.getItem("adminAuth");
    if (isAuth === "true") {
      setIsAuthenticated(true);
    }
    
    // Initialize default credentials if they don't exist
    if (!localStorage.getItem("adminCreds")) {
      localStorage.setItem("adminCreds", JSON.stringify({ username: "admin", password: "password123" }));
    }
  }, []);

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const fetchSettings = async () => {
    setIsLoadingSettings(true);
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        setSiteSettings(await res.json());
      }
    } catch (error) {
      console.error("Error fetching settings", error);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
      fetchOrders();
      fetchCategories();
      fetchSettings();
    }
  }, [isAuthenticated]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName) return;
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName }),
      });
      if (res.ok) {
        setNewCategoryName("");
        fetchCategories();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to add category");
      }
    } catch (error) {
      console.error("Add category error", error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Delete this tag?")) return;
    try {
      const res = await fetch(`/api/categories?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchCategories();
      } else {
        alert("Failed to delete category");
      }
    } catch (error) {
      console.error("Delete category error", error);
    }
  };
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const storedCreds = JSON.parse(localStorage.getItem("adminCreds") || "{}");
    if (loginUsername === storedCreds.username && loginPassword === storedCreds.password) {
      setIsAuthenticated(true);
      localStorage.setItem("adminAuth", "true");
    } else {
      alert("Invalid username or password");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("adminAuth");
    setLoginUsername("");
    setLoginPassword("");
  };

  const handleUpdateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) {
      alert("Please fill in both fields");
      return;
    }
    localStorage.setItem("adminCreds", JSON.stringify({ username: newUsername, password: newPassword }));
    alert("Credentials updated successfully! You will use these on your next login.");
    setNewUsername("");
    setNewPassword("");
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productImage && !editingProductId) {
      alert("Please select an image");
      return;
    }
    
    setIsSubmitting(true);
    try {
      let url = editingProductId ? newProduct.image : "";
      if (productImage) {
        const fileData = new FormData();
        fileData.append("file", productImage);
        
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: fileData,
        });
        
        if (!uploadRes.ok) throw new Error("Image upload failed");
        const uploadData = await uploadRes.json();
        url = uploadData.url;
      }
      
      const payload = { ...newProduct, image: url };
      
      let res;
      if (editingProductId) {
        res = await fetch(`/api/products`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, id: editingProductId }),
        });
      } else {
        res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      
      if (res.ok) {
        alert(`Product ${editingProductId ? 'updated' : 'added'} successfully!`);
        setNewProduct({ name: "", price: "", description: "", category: "", image: "", isAvailable: true } as any);
        setProductImage(null);
        setEditingProductId(null);
        setConfirmDeleteProduct(false);
        fetchProducts();
      } else {
        alert("Error saving product");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProductClick = (product: any) => {
    setEditingProductId(product.id);
    setConfirmDeleteProduct(false);
    setNewProduct({
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category || "",
      image: product.image,
      isAvailable: product.isAvailable !== false,
    } as any);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleAvailability = async (product: any) => {
    const nextAvailable = product.isAvailable === false ? true : false;
    // Optimistically update UI
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, isAvailable: nextAvailable } : p))
    );
    if (editingProductId === product.id) {
      setNewProduct((prev) => ({ ...prev, isAvailable: nextAvailable }));
    }
    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id, isAvailable: nextAvailable }),
      });
      if (!res.ok) {
        throw new Error("Failed to toggle availability");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to update availability status.");
      fetchProducts();
    }
  };

  const toggleFilterTag = (tag: string) => {
    setSelectedFilterTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filteredAndSortedProducts = products
    .filter((p) => {
      // Search filter
      if (productSearch.trim() !== "") {
        const q = productSearch.toLowerCase();
        const matchesName = p.name?.toLowerCase().includes(q);
        const matchesDesc = p.description?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }
      // Tag filter
      if (selectedFilterTags.length > 0) {
        if (!p.category) return false;
        const pTags = p.category.split(",");
        if (!selectedFilterTags.some((tag) => pTags.includes(tag))) return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (productSort) {
        case "name-asc":
          return (a.name || "").localeCompare(b.name || "");
        case "name-desc":
          return (b.name || "").localeCompare(a.name || "");
        case "price-asc":
          return (Number(a.price) || 0) - (Number(b.price) || 0);
        case "price-desc":
          return (Number(b.price) || 0) - (Number(a.price) || 0);
        case "available-first":
          return (a.isAvailable !== false ? 0 : 1) - (b.isAvailable !== false ? 0 : 1);
        case "unavailable-first":
          return (a.isAvailable === false ? 0 : 1) - (b.isAvailable === false ? 0 : 1);
        default:
          return 0;
      }
    });

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteSettings)
      });
      if (res.ok) alert("Settings saved!");
      else alert("Failed to save settings");
    } catch (e) {
      console.error(e);
      alert("Error saving settings");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirmDeleteProduct) {
      alert("Please check the confirmation box before permanently deleting this item.");
      return;
    }
    
    try {
      const res = await fetch(`/api/products?id=${id}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        alert("Product permanently deleted!");
        setEditingProductId(null);
        setConfirmDeleteProduct(false);
        setNewProduct({ name: "", price: "", description: "", category: "", image: "", isAvailable: true } as any);
        setProductImage(null);
        fetchProducts();
      } else {
        alert("Failed to delete product.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Error occurred while deleting the product.");
    }
  };

  const updateOrderStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        fetchOrders();
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to update status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'Accepted': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'Shipping': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'Done': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'Declined': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-32 mb-32 p-8 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 text-center">
        <h2 className="text-3xl font-extrabold text-white mb-2">Admin Portal</h2>
        <p className="text-gray-400 mb-8">Login to manage PixelFuse PH</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={loginUsername}
            onChange={(e) => setLoginUsername(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors mt-4"
          >
            Access Dashboard
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Admin Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-purple-400">Admin Panel</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-2">
              <button
                onClick={() => setActiveTab("products")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  activeTab === "products" ? "bg-gray-800 text-purple-400" : "text-gray-400 hover:text-white"
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Product Manager</span>
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  activeTab === "orders" ? "bg-gray-800 text-purple-400" : "text-gray-400 hover:text-white"
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Orders</span>
              </button>
              <button
                onClick={() => setActiveTab("categories")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  activeTab === "categories" ? "bg-gray-800 text-purple-400" : "text-gray-400 hover:text-white"
                }`}
              >
                <span className="font-bold">#</span>
                <span>Tags</span>
              </button>
              <button
                onClick={() => setActiveTab("website")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  activeTab === "website" ? "bg-gray-800 text-purple-400" : "text-gray-400 hover:text-white"
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Manage Website</span>
              </button>
              <button
                onClick={() => setActiveTab("account")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  activeTab === "account" ? "bg-gray-800 text-purple-400" : "text-gray-400 hover:text-white"
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Account Manager</span>
              </button>
              
              <div className="pl-4 ml-4 border-l border-gray-700">
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-extrabold text-white">Product Manager</h1>
              <button 
                onClick={fetchProducts}
                className="flex items-center space-x-2 text-gray-400 hover:text-white bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingProducts ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">{editingProductId ? "Edit Product" : "Add New Product"}</h2>
                {editingProductId && (
                  <button onClick={() => {
                    setEditingProductId(null);
                    setConfirmDeleteProduct(false);
                    setNewProduct({ name: "", price: "", description: "", category: "", image: "", isAvailable: true } as any);
                    setProductImage(null);
                  }} className="text-sm text-red-400 hover:underline">
                    Cancel Edit
                  </button>
                )}
              </div>
              <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Product Name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  required
                />
                <input
                  type="number"
                  placeholder="Price (₱)"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  required
                />
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-white">
                  <p className="text-sm text-gray-400 mb-2 font-medium">Select Tags (Multiple)</p>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {categories.length === 0 && <span className="text-xs text-gray-500">No tags available. Add some in the Tags tab.</span>}
                    {categories.map((c) => {
                      const selectedTags = newProduct.category ? newProduct.category.split(',') : [];
                      const isSelected = selectedTags.includes(c.name);
                      return (
                        <label key={c.id} className={`cursor-pointer px-3 py-1 rounded-full text-sm border transition-colors flex items-center gap-1 ${isSelected ? 'bg-purple-600/20 border-purple-500 text-purple-300' : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'}`}>
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={isSelected}
                            onChange={(e) => {
                              let newTags;
                              if (e.target.checked) {
                                newTags = [...selectedTags, c.name];
                              } else {
                                newTags = selectedTags.filter(t => t !== c.name);
                              }
                              setNewProduct({...newProduct, category: newTags.join(',')});
                            }}
                          />
                          {c.name}
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProductImage(e.target.files ? e.target.files[0] : null)}
                    className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-1.5 text-white file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
                    required={!editingProductId}
                  />
                  {editingProductId && <p className="text-xs text-gray-400">Leave file empty to keep current image.</p>}
                  <div className="flex items-center justify-between bg-gray-900 border border-gray-700 rounded-lg px-4 py-2">
                    <span className="text-sm text-gray-300 font-medium">Public Shop Availability:</span>
                    <button
                      type="button"
                      onClick={() => setNewProduct({ ...newProduct, isAvailable: !newProduct.isAvailable })}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                        newProduct.isAvailable
                          ? "bg-green-500/20 text-green-400 border border-green-500/50"
                          : "bg-red-500/20 text-red-400 border border-red-500/50"
                      }`}
                    >
                      {newProduct.isAvailable ? "● Available" : "○ Unavailable"}
                    </button>
                  </div>
                </div>
                <textarea
                  placeholder="Product Description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white md:col-span-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  rows={3}
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-colors md:col-span-2 ${isSubmitting ? 'opacity-70' : ''}`}
                >
                  {isSubmitting ? 'Saving...' : (editingProductId ? 'Update Product' : 'Save Product')}
                </button>
              </form>

              {editingProductId && (
                <div className="mt-6 pt-5 border-t border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-red-950/20 p-4 rounded-xl border border-red-900/40">
                  <label className="flex items-center space-x-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={confirmDeleteProduct}
                      onChange={(e) => setConfirmDeleteProduct(e.target.checked)}
                      className="w-4 h-4 text-red-600 bg-gray-900 border-gray-600 rounded focus:ring-red-500"
                    />
                    <span className="text-sm text-red-300 font-medium">
                      Confirm permanent deletion of this item
                    </span>
                  </label>
                  <button
                    type="button"
                    disabled={!confirmDeleteProduct}
                    onClick={() => handleDeleteProduct(editingProductId)}
                    className={`flex items-center justify-center space-x-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                      confirmDeleteProduct
                        ? "bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                        : "bg-gray-700 text-gray-500 cursor-not-allowed opacity-60"
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Product</span>
                  </button>
                </div>
              )}
            </div>

            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Manage Existing Products</h2>
                  <p className="text-sm text-gray-400">
                    Showing {filteredAndSortedProducts.length} of {products.length} items
                  </p>
                </div>

                {/* Search & Sort Controls */}
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search items..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="relative flex items-center">
                    <ArrowUpDown className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
                    <select
                      value={productSort}
                      onChange={(e) => setProductSort(e.target.value)}
                      className="w-full sm:w-auto bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-8 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                    >
                      <option value="default">Sort: Default</option>
                      <option value="name-asc">Name: A to Z</option>
                      <option value="name-desc">Name: Z to A</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="available-first">Status: Available First</option>
                      <option value="unavailable-first">Status: Unavailable First</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Tag Filter Pills */}
              {categories.length > 0 && (
                <div className="pt-2 border-t border-gray-700/60">
                  <div className="flex items-center gap-2 mb-2.5 text-gray-300 text-sm">
                    <Filter className="w-4 h-4 text-purple-400" />
                    <span className="font-medium">Filter by Tags:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((c) => {
                      const isSelected = selectedFilterTags.includes(c.name);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => toggleFilterTag(c.name)}
                          className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all duration-200 border ${
                            isSelected
                              ? "bg-purple-600 text-white border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                              : "bg-gray-900 text-gray-400 border-gray-700 hover:bg-gray-700 hover:text-white"
                          }`}
                        >
                          {c.name}
                        </button>
                      );
                    })}
                    {selectedFilterTags.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedFilterTags([])}
                        className="px-3 py-1 text-xs font-medium text-red-400 hover:text-red-300 hover:underline"
                      >
                        Clear tags
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Grid View of Products */}
              {filteredAndSortedProducts.length === 0 ? (
                <div className="text-center text-gray-400 py-14 bg-gray-900/40 rounded-xl border border-gray-700/50">
                  <p className="text-lg">
                    {products.length === 0
                      ? "No products found. Add one above!"
                      : "No products match your search or selected tags."}
                  </p>
                  {(productSearch || selectedFilterTags.length > 0) && (
                    <button
                      type="button"
                      onClick={() => {
                        setProductSearch("");
                        setSelectedFilterTags([]);
                      }}
                      className="mt-3 text-sm text-purple-400 hover:underline"
                    >
                      Reset search & filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredAndSortedProducts.map((p) => {
                    const isAvailable = p.isAvailable !== false;
                    const isEditingThis = editingProductId === p.id;
                    return (
                      <div
                        key={p.id}
                        className={`bg-gray-900 rounded-xl overflow-hidden shadow-lg border flex flex-col h-full transition-all ${
                          isEditingThis
                            ? "border-purple-500 ring-2 ring-purple-500/40"
                            : isAvailable
                            ? "border-gray-700"
                            : "border-gray-800 opacity-80"
                        }`}
                      >
                        <div className="h-44 w-full bg-gray-800 relative flex items-center justify-center overflow-hidden">
                          {p.image ? (
                            <img
                              src={p.image}
                              alt={p.name}
                              className={`w-full h-full object-cover ${!isAvailable ? "opacity-50 grayscale-[40%]" : ""}`}
                            />
                          ) : (
                            <div className="text-gray-500 text-sm">No Image</div>
                          )}
                          <span
                            className={`absolute top-2 left-2 text-xs font-bold px-2.5 py-1 rounded-full shadow ${
                              isAvailable
                                ? "bg-green-600/90 text-white"
                                : "bg-red-600/90 text-white"
                            }`}
                          >
                            {isAvailable ? "Available" : "Unavailable"}
                          </span>
                        </div>

                        <div className="p-4 flex flex-col flex-grow">
                          <div className="flex justify-between items-start gap-2 mb-1.5">
                            <h3 className="text-base font-semibold text-white line-clamp-1">{p.name}</h3>
                            <span className="text-purple-400 font-bold shrink-0">₱{p.price}</span>
                          </div>

                          <p className="text-gray-400 text-xs mb-3 line-clamp-2 flex-grow">
                            {p.description}
                          </p>

                          <div className="flex flex-wrap gap-1 mb-4">
                            {p.category ? (
                              p.category.split(",").map((tag: string, i: number) => (
                                <span
                                  key={i}
                                  className="bg-gray-800 px-2 py-0.5 rounded text-[11px] border border-gray-700 text-gray-300"
                                >
                                  {tag}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-500 text-[11px]">No tags</span>
                            )}
                          </div>

                          {/* Availability Toggle + Edit Button */}
                          <div className="pt-3 border-t border-gray-800 flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleAvailability(p)}
                              className="flex items-center space-x-2 text-xs font-medium text-gray-300 hover:text-white transition-colors"
                              title="Toggle availability in public shop"
                            >
                              <div
                                className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                                  isAvailable ? "bg-green-600" : "bg-gray-700"
                                }`}
                              >
                                <div
                                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                    isAvailable ? "translate-x-4" : "translate-x-0"
                                  }`}
                                />
                              </div>
                              <span>{isAvailable ? "Available" : "Unavailable"}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleEditProductClick(p)}
                              className="bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                            >
                              {isEditingThis ? "Editing..." : "Edit"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-extrabold text-white">Order Management</h1>
              <button 
                onClick={fetchOrders}
                className="flex items-center space-x-2 text-gray-400 hover:text-white bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingOrders ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 overflow-x-auto shadow-lg">
              <table className="w-full text-left text-gray-400">
                <thead className="text-xs text-gray-400 uppercase bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Date / ID</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Delivery Info</th>
                    <th className="px-4 py-3">Order Items</th>
                    <th className="px-4 py-3">Total & Payment</th>
                    <th className="px-4 py-3 rounded-tr-lg">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-lg">No orders yet.</td>
                    </tr>
                  ) : (
                    orders.map((o) => {
                      const itemsList = JSON.parse(o.items || "[]");
                      return (
                        <tr key={o.id} className="border-b border-gray-700 text-sm hover:bg-gray-800/50 transition-colors">
                          <td className="px-4 py-4 align-top">
                            <div className="text-white font-medium mb-1">{new Date(o.createdAt).toLocaleDateString()}</div>
                            <div className="text-xs font-mono text-gray-500 bg-gray-900 px-2 py-1 rounded inline-block">{o.id.substring(0, 8)}</div>
                          </td>
                          <td className="px-4 py-4 align-top">
                            <div className="font-bold text-white mb-1">{o.customerName}</div>
                            <div className="text-xs text-gray-400">{o.customerEmail}</div>
                          </td>
                          <td className="px-4 py-4 align-top">
                            <div className="max-w-[180px] break-words text-gray-300" title={o.address || 'N/A'}>{o.address || 'N/A'}</div>
                            {o.deliveryFee > 0 ? (
                              <div className="text-xs text-purple-400 mt-2 font-medium bg-purple-400/10 inline-block px-2 py-0.5 rounded">Delivery Fee: ₱{o.deliveryFee}</div>
                            ) : (
                              <div className="text-xs text-blue-400 mt-2 font-medium bg-blue-400/10 inline-block px-2 py-0.5 rounded">Meetup (Free)</div>
                            )}
                          </td>
                          <td className="px-4 py-4 align-top">
                            <ul className="space-y-1">
                              {itemsList.map((item: any, idx: number) => (
                                <li key={idx} className="flex items-start">
                                  <span className="text-purple-400 font-bold mr-2">{item.quantity}x</span>
                                  <span className="text-gray-300 line-clamp-2">{item.name}</span>
                                </li>
                              ))}
                            </ul>
                          </td>
                          <td className="px-4 py-4 align-top">
                            <div className="text-purple-400 font-bold text-base mb-1">₱{o.totalAmount}</div>
                            <div className="capitalize text-xs font-medium bg-gray-900 inline-block px-2 py-1 rounded border border-gray-700">{o.paymentMethod}</div>
                            {o.proofOfPayment && (
                              <a href={o.proofOfPayment} target="_blank" rel="noreferrer" className="inline-flex items-center mt-2 text-blue-400 hover:text-blue-300 text-xs font-medium hover:underline bg-blue-400/10 px-2 py-1 rounded">
                                View Receipt
                              </a>
                            )}
                          </td>
                          <td className="px-4 py-4 align-top">
                            <select
                              value={o.status}
                              onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                              className={`px-3 py-2 rounded text-xs font-bold border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 w-full shadow-sm ${getStatusColor(o.status)}`}
                            >
                              <option value="Pending">🕒 Pending</option>
                              <option value="Accepted">👍 Accepted</option>
                              <option value="Shipping">🚚 Shipping</option>
                              <option value="Done">✅ Done</option>
                              <option value="Declined">❌ Declined</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === "categories" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-extrabold text-white text-center mb-8">Tag Manager</h1>
            
            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-xl mb-6">
              <h2 className="text-xl font-bold text-white mb-2">Add New Tag</h2>
              <form onSubmit={handleAddCategory} className="flex gap-4">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g. anime, cute, keychain..."
                  required
                />
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Add Tag
                </button>
              </form>
            </div>

            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Existing Tags</h2>
                <button 
                  onClick={fetchCategories}
                  className="text-gray-400 hover:text-white"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingCategories ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {categories.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No tags found. Create one above.</p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {categories.map((c) => (
                    <div key={c.id} className="bg-gray-900 border border-gray-700 rounded-lg pl-4 pr-2 py-2 flex items-center gap-3">
                      <span className="text-white font-medium">{c.name}</span>
                      <button
                        onClick={() => handleDeleteCategory(c.id)}
                        className="text-red-400 hover:text-red-300 p-1 hover:bg-red-400/10 rounded transition-colors"
                        title="Delete Tag"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Website Settings Tab */}
        {activeTab === "website" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-2xl font-extrabold text-white text-center mb-8">Manage Website</h1>
            
            {siteSettings ? (
              <form onSubmit={handleSaveSettings} className="bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-xl space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">Delivery Fees (₱)</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Taguig Delivery Fee</label>
                      <input
                        type="number"
                        value={siteSettings.deliveryTaguig}
                        onChange={(e) => setSiteSettings({...siteSettings, deliveryTaguig: e.target.value})}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Makati Delivery Fee</label>
                      <input
                        type="number"
                        value={siteSettings.deliveryMakati}
                        onChange={(e) => setSiteSettings({...siteSettings, deliveryMakati: e.target.value})}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-700">
                  <h2 className="text-xl font-bold text-white mb-4">About Us Content</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Facebook Page URL</label>
                      <input
                        type="url"
                        value={siteSettings.facebookUrl}
                        onChange={(e) => setSiteSettings({...siteSettings, facebookUrl: e.target.value})}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Website Description</label>
                      <textarea
                        value={siteSettings.aboutDescription}
                        onChange={(e) => setSiteSettings({...siteSettings, aboutDescription: e.target.value})}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">About the Developers (QuadCore_023)</label>
                      <textarea
                        value={siteSettings.aboutDevs}
                        onChange={(e) => setSiteSettings({...siteSettings, aboutDevs: e.target.value})}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px]"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors mt-4"
                >
                  Save Website Settings
                </button>
              </form>
            ) : (
              <div className="text-center py-10 text-gray-400">Loading settings...</div>
            )}
            
            {/* Danger Zone */}
            <div className="bg-red-950/30 p-8 rounded-xl border border-red-900/50 shadow-xl mt-8">
              <h2 className="text-xl font-bold text-red-500 mb-2">Danger Zone</h2>
              <p className="text-red-400/70 text-sm mb-6">Irreversible actions that affect the entire website.</p>
              
              <button
                onClick={async () => {
                  if (prompt("This will DELETE ALL PRODUCTS, ORDERS, AND TAGS. Type 'CONFIRM' to proceed.") === 'CONFIRM') {
                    try {
                      const res = await fetch('/api/settings/reset', { method: 'POST' });
                      if (res.ok) {
                        alert("Database has been wiped. It is now a fresh website.");
                        fetchProducts();
                        fetchOrders();
                        fetchCategories();
                      } else {
                        alert("Failed to wipe database.");
                      }
                    } catch (e) {
                      console.error(e);
                      alert("Error wiping database");
                    }
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors w-full sm:w-auto"
              >
                Factory Reset (Delete All Data)
              </button>
            </div>
          </div>
        )}

        {/* Account Manager Tab */}
        {activeTab === "account" && (
          <div className="max-w-xl mx-auto space-y-6">
            <h1 className="text-2xl font-extrabold text-white text-center mb-8">Account Settings</h1>
            
            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-2">Update Credentials</h2>
              <p className="text-gray-400 text-sm mb-6">Change your admin portal login username and password here.</p>
              
              <form onSubmit={handleUpdateAccount} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">New Username</label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter new username"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter new password"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors mt-4"
                >
                  Save New Credentials
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
