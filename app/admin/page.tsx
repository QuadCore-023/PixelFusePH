"use client";

import { useState, useEffect } from "react";
import {
  LogOut,
  RefreshCw,
  Settings,
  Package,
  ShoppingBag,
  Search,
  Filter,
  ArrowUpDown,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  Eye,
  X,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  BarChart3,
  TrendingUp,
  Download,
  Plus,
  Minus,
  Store,
  Calendar,
  CreditCard,
  Award,
} from "lucide-react";

const AVAILABLE_RIBBONS = [
  { id: "Highlight", label: "✨ Highlight", activeClass: "bg-purple-600/30 border-purple-500 text-purple-200" },
  { id: "Sale", label: "🏷️ Sale", activeClass: "bg-emerald-600/30 border-emerald-500 text-emerald-200" },
  { id: "Limited", label: "⏳ Limited", activeClass: "bg-rose-600/30 border-rose-500 text-rose-200" },
  { id: "Best Seller", label: "🏆 Best Seller", activeClass: "bg-amber-500/30 border-amber-500 text-amber-200" },
  { id: "Popular", label: "🔥 Popular", activeClass: "bg-orange-500/30 border-orange-500 text-orange-200" },
];

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"products" | "orders" | "sales" | "account" | "categories" | "website">("products");
  
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
  const [showFormTags, setShowFormTags] = useState(false);

  // Manage Existing Products filter & sort states
  const [productSearch, setProductSearch] = useState("");
  const [productSort, setProductSort] = useState<string>("default");
  const [selectedFilterTags, setSelectedFilterTags] = useState<string[]>([]);
  const [showAdminTagFilter, setShowAdminTagFilter] = useState(false);

  // Orders filter, sort, & modal states
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("All");
  const [orderSearch, setOrderSearch] = useState<string>("");
  const [orderSort, setOrderSort] = useState<string>("newest");
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [previewModal, setPreviewModal] = useState<{ url: string; title: string } | null>(null);
  const [confirmDeleteOrderId, setConfirmDeleteOrderId] = useState<string | null>(null);

  // Sales & Analytics states
  const [salesPeriod, setSalesPeriod] = useState<"today" | "7days" | "30days" | "month" | "all" | "custom">("all");
  const [salesCustomStart, setSalesCustomStart] = useState<string>("");
  const [salesCustomEnd, setSalesCustomEnd] = useState<string>("");
  const [salesBasis, setSalesBasis] = useState<"fulfilled" | "done_only" | "all_active">("fulfilled");

  // Quick Walk-in POS states
  const [showPosModal, setShowPosModal] = useState<boolean>(false);
  const [posCart, setPosCart] = useState<Array<{ id: string; name: string; price: number; quantity: number; image?: string }>>([]);
  const [posSearch, setPosSearch] = useState<string>("");
  const [posCustomerName, setPosCustomerName] = useState<string>("Walk-in Customer");
  const [posPaymentMethod, setPosPaymentMethod] = useState<"cash" | "gcash" | "maya">("cash");
  const [posLocationNote, setPosLocationNote] = useState<string>("Walk-in / Booth POS");
  const [posDiscount, setPosDiscount] = useState<string>("");
  const [posCashReceived, setPosCashReceived] = useState<string>("");
  const [posCustomName, setPosCustomName] = useState<string>("");
  const [posCustomPrice, setPosCustomPrice] = useState<string>("");
  const [isSubmittingPos, setIsSubmittingPos] = useState<boolean>(false);

  // Product Form states
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    salePrice: "",
    description: "",
    category: "",
    image: "",
    isAvailable: true,
    ribbons: "",
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

  const resetProductForm = () => {
    setEditingProductId(null);
    setConfirmDeleteProduct(false);
    setNewProduct({
      name: "",
      price: "",
      salePrice: "",
      description: "",
      category: "",
      image: "",
      isAvailable: true,
      ribbons: "",
    });
    setProductImage(null);
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
        resetProductForm();
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
      salePrice: product.salePrice !== null && product.salePrice !== undefined ? String(product.salePrice) : "",
      description: product.description,
      category: product.category || "",
      image: product.image,
      isAvailable: product.isAvailable !== false,
      ribbons: product.ribbons || "",
    });
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

  const getProductAllRibbons = (p: any) => {
    const manual = p.ribbons ? p.ribbons.split(",").map((r: string) => r.trim()).filter(Boolean) : [];
    const auto = Array.isArray(p.autoRibbons) ? p.autoRibbons : [];
    const hasSale = typeof p.salePrice === "number" && p.salePrice > 0 && p.salePrice < p.price;
    return Array.from(new Set([...auto, ...manual, ...(hasSale ? ["Sale"] : [])]));
  };

  const getRibbonBadgeClasses = (ribbon: string) => {
    switch (ribbon) {
      case "Best Seller":
        return "bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-950";
      case "Popular":
        return "bg-gradient-to-r from-orange-500 to-red-500 text-white";
      case "Highlight":
        return "bg-gradient-to-r from-purple-500 to-indigo-500 text-white";
      case "Sale":
        return "bg-gradient-to-r from-emerald-500 to-green-600 text-white";
      case "Limited":
        return "bg-gradient-to-r from-rose-500 to-pink-600 text-white";
      default:
        return "bg-purple-600 text-white";
    }
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
      const priceA = typeof a.salePrice === "number" && a.salePrice > 0 && a.salePrice < a.price ? a.salePrice : Number(a.price) || 0;
      const priceB = typeof b.salePrice === "number" && b.salePrice > 0 && b.salePrice < b.price ? b.salePrice : Number(b.price) || 0;
      switch (productSort) {
        case "name-asc":
          return (a.name || "").localeCompare(b.name || "");
        case "name-desc":
          return (b.name || "").localeCompare(a.name || "");
        case "price-asc":
          return priceA - priceB;
        case "price-desc":
          return priceB - priceA;
        case "best-seller":
          return (b.soldCount || 0) - (a.soldCount || 0);
        case "popular":
          return (b.recentSoldCount || 0) - (a.recentSoldCount || 0);
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
        resetProductForm();
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
    // Optimistically update status in local state
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));
    try {
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        fetchOrders();
        fetchProducts(); // Refresh Best Seller & Popular ribbons
      } else {
        alert("Failed to update status");
        fetchOrders();
      }
    } catch (error) {
      console.error(error);
      alert("Failed to update status");
      fetchOrders();
    }
  };

  const handleDeleteOrder = async (id: string) => {
    try {
      const res = await fetch(`/api/orders?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setConfirmDeleteOrderId(null);
        fetchOrders();
        fetchProducts();
      } else {
        alert("Failed to delete order.");
      }
    } catch (error) {
      console.error("Delete order error:", error);
      alert("Error deleting order.");
    }
  };

  const handleCopyOrderId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedOrderId(id);
    setTimeout(() => setCopiedOrderId(null), 1800);
  };

  const orderStatusCounts = {
    All: orders.length,
    Pending: orders.filter((o) => o.status === "Pending").length,
    Accepted: orders.filter((o) => o.status === "Accepted").length,
    Shipping: orders.filter((o) => o.status === "Shipping").length,
    Done: orders.filter((o) => o.status === "Done").length,
    Declined: orders.filter((o) => o.status === "Declined").length,
  };

  const totalRevenue = orders
    .filter((o) => o.status === "Done" || o.status === "Shipping")
    .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  const pendingRevenue = orders
    .filter((o) => o.status === "Pending" || o.status === "Accepted")
    .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  const filteredAndSortedOrders = orders
    .filter((o) => {
      if (orderStatusFilter !== "All" && o.status !== orderStatusFilter) return false;
      if (orderSearch.trim() !== "") {
        const q = orderSearch.toLowerCase();
        const matchesId = o.id?.toLowerCase().includes(q);
        const matchesName = o.customerName?.toLowerCase().includes(q);
        const matchesEmail = o.customerEmail?.toLowerCase().includes(q);
        const matchesPhone = o.customerPhone?.toLowerCase().includes(q);
        const matchesFb = o.facebookName?.toLowerCase().includes(q);
        const matchesAddr = o.address?.toLowerCase().includes(q);
        const matchesItems = o.items?.toLowerCase().includes(q);
        if (
          !matchesId &&
          !matchesName &&
          !matchesEmail &&
          !matchesPhone &&
          !matchesFb &&
          !matchesAddr &&
          !matchesItems
        ) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      switch (orderSort) {
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "total-desc":
          return (Number(b.totalAmount) || 0) - (Number(a.totalAmount) || 0);
        case "total-asc":
          return (Number(a.totalAmount) || 0) - (Number(b.totalAmount) || 0);
        case "newest":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

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

  // --- Sales & Analytics Calculations ---
  const isPosOrder = (o: any) => {
    const addr = (o.address || "").toLowerCase();
    return (
      o.customerEmail === "walkin@pixelfuse.pos" ||
      addr.includes("walk-in") ||
      addr.includes("pos") ||
      addr.includes("booth")
    );
  };

  const ordersInPeriod = orders.filter((o) => {
    if (!o.createdAt) return true;
    const orderDate = new Date(o.createdAt);
    const now = new Date();

    if (salesPeriod === "today") {
      return (
        orderDate.getFullYear() === now.getFullYear() &&
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getDate() === now.getDate()
      );
    }
    if (salesPeriod === "7days") {
      const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return orderDate >= cutoff;
    }
    if (salesPeriod === "30days") {
      const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return orderDate >= cutoff;
    }
    if (salesPeriod === "month") {
      return (
        orderDate.getFullYear() === now.getFullYear() &&
        orderDate.getMonth() === now.getMonth()
      );
    }
    if (salesPeriod === "custom") {
      if (salesCustomStart) {
        const start = new Date(`${salesCustomStart}T00:00:00`);
        if (orderDate < start) return false;
      }
      if (salesCustomEnd) {
        const end = new Date(`${salesCustomEnd}T23:59:59.999`);
        if (orderDate > end) return false;
      }
      return true;
    }
    return true; // "all"
  });

  const qualifyingSalesOrders = ordersInPeriod.filter((o) => {
    if (salesBasis === "done_only") return o.status === "Done";
    if (salesBasis === "all_active") return o.status !== "Declined";
    return o.status === "Done" || o.status === "Shipping"; // "fulfilled"
  });

  const periodGrossRevenue = qualifyingSalesOrders.reduce(
    (sum, o) => sum + (Number(o.totalAmount) || 0),
    0
  );
  const periodDeliveryFees = qualifyingSalesOrders.reduce(
    (sum, o) => sum + (Number(o.deliveryFee) || 0),
    0
  );
  const periodNetItemRevenue = Math.max(0, periodGrossRevenue - periodDeliveryFees);
  const periodAvgOrderValue =
    qualifyingSalesOrders.length > 0
      ? Math.round(periodGrossRevenue / qualifyingSalesOrders.length)
      : 0;
  const periodPendingPipeline = ordersInPeriod
    .filter((o) => o.status === "Pending" || o.status === "Accepted")
    .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  // Aggregate Top Selling Products & Total Units Sold
  const productSalesMap: Record<
    string,
    { key: string; name: string; image: string; units: number; revenue: number; ordersCount: number }
  > = {};
  let periodUnitsSold = 0;

  qualifyingSalesOrders.forEach((o) => {
    let parsedItems: any[] = [];
    try {
      parsedItems = typeof o.items === "string" ? JSON.parse(o.items) : o.items || [];
    } catch {
      parsedItems = [];
    }
    if (!Array.isArray(parsedItems)) return;

    parsedItems.forEach((item) => {
      const qty = Number(item.quantity) || 1;
      const price = Number(item.price) || 0;
      const itemRev = qty * price;
      periodUnitsSold += qty;

      const key = String(item.id || item.name || "unknown");
      if (!productSalesMap[key]) {
        productSalesMap[key] = {
          key,
          name: item.name || "Unnamed Item",
          image: item.image || "",
          units: 0,
          revenue: 0,
          ordersCount: 0,
        };
      }
      productSalesMap[key].units += qty;
      productSalesMap[key].revenue += itemRev;
      productSalesMap[key].ordersCount += 1;
    });
  });

  const topSellingProducts = Object.values(productSalesMap).sort((a, b) => {
    if (b.units !== a.units) return b.units - a.units;
    return b.revenue - a.revenue;
  });

  // Payment Method Breakdown
  const paymentBreakdown = ["cash", "gcash", "maya"].map((method) => {
    const matching = qualifyingSalesOrders.filter(
      (o) => (o.paymentMethod || "cash").toLowerCase() === method
    );
    const total = matching.reduce((s, o) => s + (Number(o.totalAmount) || 0), 0);
    const pct = periodGrossRevenue > 0 ? Math.round((total / periodGrossRevenue) * 100) : 0;
    return {
      method,
      label: method === "cash" ? "Cash" : method === "gcash" ? "GCash" : "Maya",
      count: matching.length,
      total,
      pct,
    };
  });

  // Channel Breakdown (Walk-in POS vs Meetup vs Delivery)
  const channelBreakdown = [
    {
      id: "pos",
      label: "Walk-in / Booth POS",
      orders: qualifyingSalesOrders.filter((o) => isPosOrder(o)),
      color: "bg-emerald-500",
    },
    {
      id: "meetup",
      label: "Campus Meetup",
      orders: qualifyingSalesOrders.filter((o) => !isPosOrder(o) && (Number(o.deliveryFee) || 0) === 0),
      color: "bg-purple-500",
    },
    {
      id: "delivery",
      label: "Delivery (Taguig / Makati)",
      orders: qualifyingSalesOrders.filter((o) => !isPosOrder(o) && (Number(o.deliveryFee) || 0) > 0),
      color: "bg-blue-500",
    },
  ].map((ch) => {
    const total = ch.orders.reduce((s, o) => s + (Number(o.totalAmount) || 0), 0);
    const pct = periodGrossRevenue > 0 ? Math.round((total / periodGrossRevenue) * 100) : 0;
    return { ...ch, count: ch.orders.length, total, pct };
  });

  // Daily Sales Trend (up to last 14 active dates)
  const dailyMap: Record<string, { dateKey: string; label: string; revenue: number; count: number }> = {};
  qualifyingSalesOrders.forEach((o) => {
    const d = new Date(o.createdAt);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const dateKey = `${yyyy}-${mm}-${dd}`;
    const label = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    if (!dailyMap[dateKey]) {
      dailyMap[dateKey] = { dateKey, label, revenue: 0, count: 0 };
    }
    dailyMap[dateKey].revenue += Number(o.totalAmount) || 0;
    dailyMap[dateKey].count += 1;
  });
  const dailyTrend = Object.values(dailyMap)
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
    .slice(-14);
  const maxDailyRevenue = Math.max(1, ...dailyTrend.map((d) => d.revenue));

  // CSV Export Handler
  const handleExportSalesCsv = () => {
    if (qualifyingSalesOrders.length === 0) {
      alert("No sales records in the selected period to export.");
      return;
    }
    const headers = [
      "Order ID",
      "Date",
      "Customer Name",
      "Customer Email",
      "Customer Phone",
      "Channel",
      "Location / Address",
      "Payment Method",
      "Status",
      "Items Ordered",
      "Total Units",
      "Subtotal (PHP)",
      "Delivery Fee (PHP)",
      "Total Amount (PHP)",
    ];

    const escapeCsv = (val: any) => {
      const str = String(val ?? "").replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = qualifyingSalesOrders.map((o) => {
      let itemsList: any[] = [];
      try {
        itemsList = typeof o.items === "string" ? JSON.parse(o.items) : o.items || [];
      } catch {
        itemsList = [];
      }
      const itemsSummary = itemsList
        .map((i: any) => `${i.quantity || 1}x ${i.name} (P${i.price})`)
        .join("; ");
      const units = itemsList.reduce((acc: number, i: any) => acc + (Number(i.quantity) || 1), 0);
      const total = Number(o.totalAmount) || 0;
      const deliv = Number(o.deliveryFee) || 0;
      const sub = Math.max(0, total - deliv);
      const channel = isPosOrder(o)
        ? "Walk-in POS"
        : deliv > 0
        ? "Delivery"
        : "Campus Meetup";

      return [
        o.id,
        new Date(o.createdAt).toLocaleString(),
        o.customerName,
        o.customerEmail,
        o.customerPhone || "",
        channel,
        o.address || "",
        (o.paymentMethod || "cash").toUpperCase(),
        o.status,
        itemsSummary,
        units,
        sub,
        deliv,
        total,
      ]
        .map(escapeCsv)
        .join(",");
    });

    const csvContent = "\uFEFF" + [headers.map(escapeCsv).join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const todayStr = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.setAttribute("download", `pixelfuse-sales-report-${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // --- Quick Walk-in POS Handlers ---
  const addToPosCart = (product: any) => {
    const hasSale =
      product.salePrice !== null &&
      product.salePrice !== undefined &&
      Number(product.salePrice) > 0 &&
      Number(product.salePrice) < Number(product.price);
    const effectivePrice = hasSale ? Number(product.salePrice) : Number(product.price);

    setPosCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: effectivePrice,
          quantity: 1,
          image: product.image || "",
        },
      ];
    });
  };

  const updatePosQty = (id: string, delta: number) => {
    setPosCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const handleAddPosCustomItem = () => {
    const trimmedName = posCustomName.trim();
    const priceNum = Number(posCustomPrice);
    if (!trimmedName || isNaN(priceNum) || priceNum <= 0) {
      alert("Please enter a valid custom item name and price.");
      return;
    }
    setPosCart((prev) => [
      ...prev,
      {
        id: `custom-pos-${Date.now()}`,
        name: trimmedName,
        price: priceNum,
        quantity: 1,
      },
    ]);
    setPosCustomName("");
    setPosCustomPrice("");
  };

  const posSubtotal = posCart.reduce((s, i) => s + i.price * i.quantity, 0);
  const posDiscountNum = Math.max(0, Number(posDiscount) || 0);
  const posFinalTotal = Math.max(0, posSubtotal - posDiscountNum);
  const posCashReceivedNum = Number(posCashReceived) || 0;
  const posChangeDue = Math.max(0, posCashReceivedNum - posFinalTotal);

  const handleCompletePosSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (posCart.length === 0) {
      alert("Please add at least one item to the walk-in POS ticket.");
      return;
    }
    setIsSubmittingPos(true);
    try {
      const payload = {
        customerName: posCustomerName.trim() || "Walk-in Customer",
        customerEmail: "walkin@pixelfuse.pos",
        customerPhone: "Walk-in POS",
        facebookName: "Walk-in POS",
        facebookUrl: "",
        address: posLocationNote.trim() || "Walk-in / Booth POS",
        deliveryFee: 0,
        items: posCart,
        totalAmount: posFinalTotal,
        paymentMethod: posPaymentMethod,
        proofOfPayment: null,
        status: "Done",
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setPosCart([]);
        setPosCustomerName("Walk-in Customer");
        setPosDiscount("");
        setPosCashReceived("");
        setShowPosModal(false);
        fetchOrders();
        fetchProducts();
      } else {
        alert("Failed to record walk-in sale.");
      }
    } catch (err) {
      console.error("POS Sale error:", err);
      alert("Error recording walk-in sale.");
    } finally {
      setIsSubmittingPos(false);
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

  const formSelectedTags = newProduct.category ? newProduct.category.split(",").filter(Boolean) : [];
  const formSelectedRibbons = newProduct.ribbons ? newProduct.ribbons.split(",").map((r) => r.trim()).filter(Boolean) : [];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Admin Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center gap-4">
            <div className="flex items-center space-x-2 shrink-0">
              <span className="text-xl font-bold tracking-tight text-purple-400">Admin Panel</span>
            </div>
            
            <div className="flex items-center space-x-1.5 overflow-x-auto py-2 no-scrollbar">
              <button
                onClick={() => setActiveTab("products")}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 shrink-0 ${
                  activeTab === "products" ? "bg-gray-800 text-purple-400" : "text-gray-400 hover:text-white"
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Products</span>
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 shrink-0 ${
                  activeTab === "orders" ? "bg-gray-800 text-purple-400" : "text-gray-400 hover:text-white"
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Orders</span>
                {orderStatusCounts.Pending > 0 && (
                  <span className="bg-yellow-500 text-gray-950 text-xs font-extrabold px-2 py-0.5 rounded-full">
                    {orderStatusCounts.Pending}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("sales")}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 shrink-0 ${
                  activeTab === "sales" ? "bg-gray-800 text-purple-400" : "text-gray-400 hover:text-white"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Sales &amp; POS</span>
              </button>
              <button
                onClick={() => setActiveTab("categories")}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 shrink-0 ${
                  activeTab === "categories" ? "bg-gray-800 text-purple-400" : "text-gray-400 hover:text-white"
                }`}
              >
                <span className="font-bold">#</span>
                <span>Tags</span>
              </button>
              <button
                onClick={() => setActiveTab("website")}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 shrink-0 ${
                  activeTab === "website" ? "bg-gray-800 text-purple-400" : "text-gray-400 hover:text-white"
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Website</span>
              </button>
              <button
                onClick={() => setActiveTab("account")}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 shrink-0 ${
                  activeTab === "account" ? "bg-gray-800 text-purple-400" : "text-gray-400 hover:text-white"
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Account</span>
              </button>
              
              <div className="pl-3 ml-2 border-l border-gray-700 shrink-0">
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 text-sm text-red-400 hover:text-red-300 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
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
                  <button
                    onClick={resetProductForm}
                    className="text-sm text-red-400 hover:underline"
                  >
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
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Regular Price (₱)"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Sale Price (₱ Optional)"
                    value={newProduct.salePrice}
                    onChange={(e) => setNewProduct({...newProduct, salePrice: e.target.value})}
                    className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-emerald-400 placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Collapsible Select Tags in Form */}
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-white flex flex-col justify-between">
                  <button
                    type="button"
                    onClick={() => setShowFormTags(!showFormTags)}
                    className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-300 hover:text-white"
                  >
                    <span className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-purple-400" />
                      <span>Select Tags</span>
                      {formSelectedTags.length > 0 && (
                        <span className="bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {formSelectedTags.length} selected
                        </span>
                      )}
                    </span>
                    {showFormTags ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showFormTags && (
                    <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto mt-3 pt-3 border-t border-gray-800">
                      {categories.length === 0 && <span className="text-xs text-gray-500">No tags available. Add some in the Tags tab.</span>}
                      {categories.map((c) => {
                        const isSelected = formSelectedTags.includes(c.name);
                        return (
                          <label key={c.id} className={`cursor-pointer px-3 py-1 rounded-full text-xs border transition-colors flex items-center gap-1 ${isSelected ? 'bg-purple-600/20 border-purple-500 text-purple-300' : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'}`}>
                            <input
                              type="checkbox"
                              className="hidden"
                              checked={isSelected}
                              onChange={(e) => {
                                let newTags;
                                if (e.target.checked) {
                                  newTags = [...formSelectedTags, c.name];
                                } else {
                                  newTags = formSelectedTags.filter(t => t !== c.name);
                                }
                                setNewProduct({...newProduct, category: newTags.join(',')});
                              }}
                            />
                            {c.name}
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {!showFormTags && formSelectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {formSelectedTags.map((t) => (
                        <span key={t} className="bg-purple-600/20 border border-purple-500/40 text-purple-300 text-xs px-2 py-0.5 rounded-full">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
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

                {/* Ribbons / Badges Selector */}
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-white md:col-span-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <span className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span>Item Ribbons & Highlights</span>
                    </span>
                    <span className="text-xs text-gray-500">
                      Note: 🏆 Best Seller (top 3 all-time) & 🔥 Popular (top 3 in 14d) are also awarded automatically from completed orders.
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_RIBBONS.map((r) => {
                      const isSelected = formSelectedRibbons.includes(r.id);
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => {
                            const next = isSelected
                              ? formSelectedRibbons.filter((item) => item !== r.id)
                              : [...formSelectedRibbons, r.id];
                            setNewProduct({ ...newProduct, ribbons: next.join(",") });
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                            isSelected
                              ? r.activeClass
                              : "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white"
                          }`}
                        >
                          {r.label}
                        </button>
                      );
                    })}
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

            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Manage Existing Products</h2>
                  <p className="text-sm text-gray-400">
                    Showing {filteredAndSortedProducts.length} of {products.length} items
                  </p>
                </div>

                {/* Search, Sort, & Collapsible Tag Filter Controls */}
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full lg:w-auto">
                  <div className="relative flex-1 sm:w-60">
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
                      <option value="best-seller">🏆 Most Sold (All-Time)</option>
                      <option value="popular">🔥 Popular (Last 14d)</option>
                      <option value="name-asc">Name: A to Z</option>
                      <option value="name-desc">Name: Z to A</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="available-first">Status: Available First</option>
                      <option value="unavailable-first">Status: Unavailable First</option>
                    </select>
                  </div>

                  {categories.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAdminTagFilter(!showAdminTagFilter)}
                      className={`flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        showAdminTagFilter || selectedFilterTags.length > 0
                          ? "bg-purple-600/20 text-purple-300 border-purple-500/60"
                          : "bg-gray-900 text-gray-300 border-gray-700 hover:bg-gray-700 hover:text-white"
                      }`}
                    >
                      <Filter className="w-4 h-4" />
                      <span>Filter by Tags</span>
                      {selectedFilterTags.length > 0 && (
                        <span className="bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {selectedFilterTags.length}
                        </span>
                      )}
                      {showAdminTagFilter ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Collapsible Tag Filter Drawer */}
              {categories.length > 0 && showAdminTagFilter && (
                <div className="bg-gray-900/80 border border-gray-700 rounded-xl p-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Filter by Tags ({categories.length} total)
                    </span>
                    {selectedFilterTags.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedFilterTags([])}
                        className="text-xs font-medium text-red-400 hover:text-red-300 hover:underline"
                      >
                        Clear tags ({selectedFilterTags.length})
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto">
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
                              : "bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700 hover:text-white"
                          }`}
                        >
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Active Tag Summary when drawer is closed */}
              {!showAdminTagFilter && selectedFilterTags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-400">Active tags:</span>
                  {selectedFilterTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleFilterTag(tag)}
                      className="bg-purple-600/20 text-purple-300 border border-purple-500/40 px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 hover:bg-purple-600/30"
                    >
                      <span>{tag}</span>
                      <span className="text-purple-400 font-bold">×</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setSelectedFilterTags([])}
                    className="text-xs text-red-400 hover:underline ml-1"
                  >
                    Clear all
                  </button>
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
                    const allRibbons = getProductAllRibbons(p);
                    const hasSalePrice =
                      typeof p.salePrice === "number" && p.salePrice > 0 && p.salePrice < p.price;
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

                          {/* Availability + Ribbons Overlay */}
                          <div className="absolute top-2 left-2 flex flex-col items-start gap-1 max-w-[75%]">
                            <span
                              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow ${
                                isAvailable
                                  ? "bg-green-600/90 text-white"
                                  : "bg-red-600/90 text-white"
                              }`}
                            >
                              {isAvailable ? "Available" : "Unavailable"}
                            </span>
                            {allRibbons.map((r) => (
                              <span
                                key={r}
                                className={`${getRibbonBadgeClasses(r)} text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow`}
                              >
                                {r}
                              </span>
                            ))}
                          </div>

                          {p.soldCount > 0 && (
                            <span className="absolute top-2 right-2 bg-gray-950/80 text-amber-300 border border-amber-500/30 text-[11px] font-bold px-2 py-0.5 rounded-full">
                              {p.soldCount} sold
                            </span>
                          )}
                        </div>

                        <div className="p-4 flex flex-col flex-grow">
                          <div className="flex justify-between items-start gap-2 mb-1.5">
                            <h3 className="text-base font-semibold text-white line-clamp-1">{p.name}</h3>
                            <div className="text-right shrink-0">
                              {hasSalePrice ? (
                                <div className="flex flex-col items-end">
                                  <span className="text-[11px] text-gray-500 line-through">₱{p.price}</span>
                                  <span className="text-emerald-400 font-extrabold">₱{p.salePrice}</span>
                                </div>
                              ) : (
                                <span className="text-purple-400 font-bold">₱{p.price}</span>
                              )}
                            </div>
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
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-white">Order Management</h1>
                <p className="text-sm text-gray-400">
                  Track, verify payments, and update order fulfillment status
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowPosModal(true)}
                  className="flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl shadow-lg shadow-emerald-600/20 transition-colors"
                >
                  <Store className="w-4 h-4" />
                  <span>+ Walk-in / POS Sale</span>
                </button>
                <button 
                  onClick={fetchOrders}
                  className="flex items-center justify-center space-x-2 text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-xl border border-gray-700 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingOrders ? 'animate-spin' : ''}`} />
                  <span>Refresh Orders</span>
                </button>
              </div>
            </div>

            {/* Summary KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-800/90 border border-gray-700 rounded-xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Completed Revenue</span>
                  <span className="bg-purple-500/20 text-purple-400 p-2 rounded-lg font-bold text-sm">₱</span>
                </div>
                <div className="text-2xl font-extrabold text-white">₱{totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-gray-400 mt-1">
                  + ₱{pendingRevenue.toLocaleString()} in pending/accepted
                </p>
              </div>

              <div className="bg-gray-800/90 border border-yellow-500/30 rounded-xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-yellow-400">Pending Review</span>
                  <Clock className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="text-2xl font-extrabold text-white">{orderStatusCounts.Pending}</div>
                <p className="text-xs text-gray-400 mt-1">Awaiting confirmation</p>
              </div>

              <div className="bg-gray-800/90 border border-blue-500/30 rounded-xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">Active / Shipping</span>
                  <Truck className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-2xl font-extrabold text-white">
                  {orderStatusCounts.Accepted + orderStatusCounts.Shipping}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {orderStatusCounts.Accepted} accepted · {orderStatusCounts.Shipping} shipping
                </p>
              </div>

              <div className="bg-gray-800/90 border border-green-500/30 rounded-xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-green-400">Completed</span>
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-2xl font-extrabold text-white">{orderStatusCounts.Done}</div>
                <p className="text-xs text-gray-400 mt-1">
                  {orderStatusCounts.Declined} declined
                </p>
              </div>
            </div>

            {/* Filter Tabs + Search & Sort Bar */}
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 space-y-4">
              {/* Status Filter Pills */}
              <div className="flex flex-wrap gap-2">
                {(["All", "Pending", "Accepted", "Shipping", "Done", "Declined"] as const).map((st) => {
                  const isSelected = orderStatusFilter === st;
                  const count = orderStatusCounts[st];
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setOrderStatusFilter(st)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                        isSelected
                          ? "bg-purple-600 text-white border-purple-500 shadow-md"
                          : "bg-gray-900 text-gray-400 border-gray-700 hover:bg-gray-700 hover:text-white"
                      }`}
                    >
                      <span>
                        {st === "Pending" && "🕒 "}
                        {st === "Accepted" && "👍 "}
                        {st === "Shipping" && "🚚 "}
                        {st === "Done" && "✅ "}
                        {st === "Declined" && "❌ "}
                        {st}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[11px] ${
                          isSelected ? "bg-purple-800 text-purple-100" : "bg-gray-800 text-gray-400"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search & Sort Controls */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-700/60">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search by customer name, email, phone, FB name, item, or order ID..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="relative flex items-center">
                  <ArrowUpDown className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                  <select
                    value={orderSort}
                    onChange={(e) => setOrderSort(e.target.value)}
                    className="w-full sm:w-auto bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-8 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                  >
                    <option value="newest">Sort: Newest First</option>
                    <option value="oldest">Sort: Oldest First</option>
                    <option value="total-desc">Total: High to Low</option>
                    <option value="total-asc">Total: Low to High</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Order Cards List */}
            {filteredAndSortedOrders.length === 0 ? (
              <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-12 text-center">
                <ShoppingBag className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-lg font-semibold text-white">No matching orders found</p>
                <p className="text-sm text-gray-400 mt-1">
                  {orders.length === 0
                    ? "New customer orders will appear here automatically."
                    : "Try clearing your search or switching the status filter."}
                </p>
                {(orderSearch || orderStatusFilter !== "All") && (
                  <button
                    type="button"
                    onClick={() => {
                      setOrderSearch("");
                      setOrderStatusFilter("All");
                    }}
                    className="mt-4 text-sm text-purple-400 hover:underline"
                  >
                    Reset filters
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedOrders.map((o) => {
                  let itemsList: any[] = [];
                  try {
                    itemsList = JSON.parse(o.items || "[]");
                  } catch {
                    itemsList = [];
                  }
                  const subtotal = Math.max(0, (Number(o.totalAmount) || 0) - (Number(o.deliveryFee) || 0));
                  const isDeletingThis = confirmDeleteOrderId === o.id;

                  return (
                    <div
                      key={o.id}
                      className="bg-gray-800 rounded-2xl border border-gray-700 shadow-lg overflow-hidden hover:border-gray-600 transition-colors"
                    >
                      {/* Order Card Top Bar */}
                      <div className="bg-gray-900/80 px-5 py-3.5 border-b border-gray-700 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleCopyOrderId(o.id)}
                            className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 px-2.5 py-1 rounded-lg text-xs font-mono text-gray-300 transition-colors"
                            title="Click to copy full Order ID"
                          >
                            <span>#{o.id.substring(0, 8)}</span>
                            {copiedOrderId === o.id ? (
                              <Check className="w-3.5 h-3.5 text-green-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-gray-500" />
                            )}
                          </button>

                          <span className="text-xs text-gray-400">
                            {new Date(o.createdAt).toLocaleString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>

                          {isPosOrder(o) ? (
                            <span className="text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                              🏪 Walk-in POS
                            </span>
                          ) : o.deliveryFee > 0 ? (
                            <span className="text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-full">
                              🚚 Delivery (₱{o.deliveryFee})
                            </span>
                          ) : (
                            <span className="text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 rounded-full">
                              🤝 Campus Meetup (Free)
                            </span>
                          )}

                          <span className="text-xs font-semibold uppercase bg-gray-800 text-gray-300 border border-gray-700 px-2.5 py-0.5 rounded-full">
                            💳 {o.paymentMethod}
                          </span>
                        </div>

                        {/* Status Selector */}
                        <div className="flex items-center gap-2">
                          <select
                            value={o.status}
                            onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm ${getStatusColor(o.status)}`}
                          >
                            <option value="Pending" className="bg-gray-900 text-yellow-400">🕒 Pending</option>
                            <option value="Accepted" className="bg-gray-900 text-blue-400">👍 Accepted</option>
                            <option value="Shipping" className="bg-gray-900 text-purple-400">🚚 Shipping</option>
                            <option value="Done" className="bg-gray-900 text-green-400">✅ Done</option>
                            <option value="Declined" className="bg-gray-900 text-red-400">❌ Declined</option>
                          </select>
                        </div>
                      </div>

                      {/* Order Card Body */}
                      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Column 1: Customer & Delivery Details */}
                        <div className="lg:col-span-4 space-y-3 bg-gray-900/40 p-4 rounded-xl border border-gray-700/60">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                            Customer & Delivery
                          </h3>
                          <div>
                            <div className="text-base font-bold text-white">{o.customerName}</div>
                            <div className="mt-1.5 space-y-1.5 text-xs text-gray-300">
                              <div className="flex items-center gap-2">
                                <Mail className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                                <span className="break-all">{o.customerEmail}</span>
                              </div>
                              {o.customerPhone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                                  <span>{o.customerPhone}</span>
                                </div>
                              )}
                              {(o.facebookName || o.facebookUrl) && (
                                <div className="flex items-center gap-2">
                                  <ExternalLink className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                  {o.facebookUrl ? (
                                    <a
                                      href={o.facebookUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-blue-400 hover:underline font-medium truncate"
                                    >
                                      {o.facebookName || "Facebook Profile"}
                                    </a>
                                  ) : (
                                    <span>FB: {o.facebookName}</span>
                                  )}
                                </div>
                              )}
                              <div className="flex items-start gap-2 pt-1.5 border-t border-gray-800">
                                <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                                <span className="text-gray-200 break-words">
                                  {o.address || "Campus Meetup"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Column 2: Ordered Items with Thumbnails */}
                        <div className="lg:col-span-5 space-y-3">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                            Ordered Items ({itemsList.reduce((acc, i) => acc + (Number(i.quantity) || 1), 0)})
                          </h3>
                          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                            {itemsList.map((item: any, idx: number) => {
                              const isCustom = String(item.id || "").startsWith("custom-") || item.category === "custom";
                              return (
                                <div
                                  key={idx}
                                  className="flex items-start gap-3 bg-gray-900/60 p-2.5 rounded-xl border border-gray-700/60"
                                >
                                  {item.image ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setPreviewModal({
                                          url: item.image,
                                          title: `${item.name} (${o.customerName})`,
                                        })
                                      }
                                      className="w-12 h-12 rounded-lg overflow-hidden bg-gray-800 border border-gray-700 shrink-0 relative group"
                                      title="Click to enlarge image"
                                    >
                                      <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                      />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <Eye className="w-4 h-4 text-white" />
                                      </div>
                                    </button>
                                  ) : (
                                    <div className="w-12 h-12 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-[10px] text-gray-500 shrink-0">
                                      No Img
                                    </div>
                                  )}

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <p className="text-sm font-semibold text-white truncate">
                                        <span className="text-purple-400 font-extrabold mr-1.5">
                                          {item.quantity}x
                                        </span>
                                        {item.name}
                                      </p>
                                      <span className="text-xs font-bold text-gray-300 shrink-0">
                                        ₱{(Number(item.price) || 0) * (Number(item.quantity) || 1)}
                                      </span>
                                    </div>
                                    {isCustom && (
                                      <div className="mt-1">
                                        <p className="text-xs text-purple-300 bg-purple-950/40 border border-purple-500/30 rounded px-2 py-1 break-words">
                                          {item.description || "Custom User Design"}
                                        </p>
                                        {item.image && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setPreviewModal({
                                                url: item.image,
                                                title: `Custom Design Reference — ${o.customerName}`,
                                              })
                                            }
                                            className="mt-1 text-[11px] text-purple-400 hover:underline inline-flex items-center gap-1"
                                          >
                                            <Eye className="w-3 h-3" /> View Custom Reference Image
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Column 3: Payment Summary, Receipt & Actions */}
                        <div className="lg:col-span-3 flex flex-col justify-between bg-gray-900/40 p-4 rounded-xl border border-gray-700/60 space-y-4">
                          <div className="space-y-2">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                              Payment Summary
                            </h3>
                            <div className="text-xs space-y-1 text-gray-400 pt-1">
                              <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span className="text-gray-200">₱{subtotal}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Delivery Fee:</span>
                                <span className="text-gray-200">₱{o.deliveryFee || 0}</span>
                              </div>
                              <div className="flex justify-between text-base font-extrabold text-white pt-1.5 border-t border-gray-800">
                                <span>Total:</span>
                                <span className="text-purple-400">₱{o.totalAmount}</span>
                              </div>
                            </div>

                            {o.proofOfPayment ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewModal({
                                    url: o.proofOfPayment,
                                    title: `Payment Receipt (${o.paymentMethod.toUpperCase()}) — ${o.customerName}`,
                                  })
                                }
                                className="w-full mt-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-xl py-2 px-3 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                <span>View Payment Receipt</span>
                              </button>
                            ) : (
                              <div className="text-[11px] text-gray-500 italic pt-1">
                                {o.paymentMethod === "cash"
                                  ? "Cash on Meetup / Delivery (No receipt required)"
                                  : "No receipt uploaded"}
                              </div>
                            )}
                          </div>

                          {/* Delete Order Option */}
                          <div className="pt-3 border-t border-gray-800/80 flex items-center justify-end">
                            {!isDeletingThis ? (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteOrderId(o.id)}
                                className="text-xs text-gray-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remove Order</span>
                              </button>
                            ) : (
                              <div className="flex items-center gap-2 w-full justify-between bg-red-950/30 border border-red-800/50 px-2.5 py-1.5 rounded-lg">
                                <span className="text-[11px] text-red-300 font-medium">Delete permanently?</span>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteOrder(o.id)}
                                    className="bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold px-2 py-0.5 rounded"
                                  >
                                    Yes
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteOrderId(null)}
                                    className="bg-gray-700 hover:bg-gray-600 text-gray-200 text-[11px] px-2 py-0.5 rounded"
                                  >
                                    No
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Image Preview Lightbox Modal */}
            {previewModal && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                onClick={() => setPreviewModal(null)}
              >
                <div
                  className="bg-gray-900 border border-gray-700 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-800">
                    <h3 className="text-sm font-bold text-white truncate pr-4">{previewModal.title}</h3>
                    <div className="flex items-center gap-2">
                      <a
                        href={previewModal.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-purple-400 hover:underline flex items-center gap-1 px-2 py-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Open Original
                      </a>
                      <button
                        type="button"
                        onClick={() => setPreviewModal(null)}
                        className="text-gray-400 hover:text-white bg-gray-800 rounded-full p-1"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-gray-950">
                    <img
                      src={previewModal.url}
                      alt={previewModal.title}
                      className="max-h-[72vh] w-auto object-contain rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sales & POS Analytics Tab */}
        {activeTab === "sales" && (
          <div className="space-y-6">
            {/* Header & Action Buttons */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
                  <BarChart3 className="w-7 h-7 text-purple-400" />
                  <span>Sales Report &amp; Walk-in POS</span>
                </h1>
                <p className="text-sm text-gray-400 mt-0.5">
                  Monitor total revenue, net product sales, top-selling items, payment methods, and record in-person booth/walk-in sales.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowPosModal(true)}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-colors"
                >
                  <Store className="w-4 h-4" />
                  <span>+ Record Walk-in / POS Sale</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportSalesCsv}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-purple-600/20 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV Report</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    fetchOrders();
                    fetchProducts();
                  }}
                  className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-3.5 py-2.5 rounded-xl border border-gray-700 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingOrders ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Period Filter & Revenue Basis Controls */}
            <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700 shadow-lg space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    Time Period
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "today", label: "Today" },
                      { id: "7days", label: "Last 7 Days" },
                      { id: "30days", label: "Last 30 Days" },
                      { id: "month", label: "This Month" },
                      { id: "all", label: "All Time" },
                      { id: "custom", label: "Custom Range" },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSalesPeriod(p.id as any)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          salesPeriod === p.id
                            ? "bg-purple-600 text-white border-purple-500 shadow"
                            : "bg-gray-900 text-gray-400 border-gray-700 hover:bg-gray-700 hover:text-white"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
                    Revenue Calculation Basis
                  </span>
                  <select
                    value={salesBasis}
                    onChange={(e) => setSalesBasis(e.target.value as any)}
                    className="bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                  >
                    <option value="fulfilled">Fulfilled Orders (Done + Shipping) — Recommended</option>
                    <option value="done_only">Completed Only (Done)</option>
                    <option value="all_active">All Non-Declined (Pending + Accepted + Shipping + Done)</option>
                  </select>
                </div>
              </div>

              {salesPeriod === "custom" && (
                <div className="pt-3 border-t border-gray-700/70 flex flex-wrap items-center gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={salesCustomStart}
                      onChange={(e) => setSalesCustomStart(e.target.value)}
                      className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">End Date</label>
                    <input
                      type="date"
                      value={salesCustomEnd}
                      onChange={(e) => setSalesCustomEnd(e.target.value)}
                      className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  {(salesCustomStart || salesCustomEnd) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSalesCustomStart("");
                        setSalesCustomEnd("");
                      }}
                      className="text-xs text-purple-400 hover:underline mt-4"
                    >
                      Clear Dates
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Executive KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-purple-900/40 to-gray-800 border border-purple-500/40 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                    Total Gross Sales
                  </span>
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-3xl font-extrabold text-white">
                  ₱{periodGrossRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-gray-300 mt-1.5">
                  Across <span className="text-white font-bold">{qualifyingSalesOrders.length}</span> qualifying orders
                </p>
              </div>

              <div className="bg-gray-800 border border-emerald-500/30 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Net Item Sales
                  </span>
                  <ShoppingBag className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-3xl font-extrabold text-white">
                  ₱{periodNetItemRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  <span className="text-emerald-300 font-bold">{periodUnitsSold}</span> items sold · ₱{periodDeliveryFees.toLocaleString()} delivery fees
                </p>
              </div>

              <div className="bg-gray-800 border border-blue-500/30 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                    Avg. Order Value
                  </span>
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-3xl font-extrabold text-white">
                  ₱{periodAvgOrderValue.toLocaleString()}
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  {ordersInPeriod.length} total orders in period ({ordersInPeriod.filter((o) => o.status === "Declined").length} declined)
                </p>
              </div>

              <div className="bg-gray-800 border border-amber-500/30 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Pending Pipeline
                  </span>
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
                <div className="text-3xl font-extrabold text-white">
                  ₱{periodPendingPipeline.toLocaleString()}
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  {ordersInPeriod.filter((o) => o.status === "Pending" || o.status === "Accepted").length} orders awaiting completion
                </p>
              </div>
            </div>

            {/* Middle Row: Daily Revenue Trend + Payment & Channel Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Daily Revenue Trend Chart */}
              <div className="lg:col-span-7 bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-bold text-white">Daily Revenue Trend</h2>
                      <p className="text-xs text-gray-400">
                        Sales performance across recent active order dates
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/30 px-2.5 py-1 rounded-lg">
                      Last {dailyTrend.length} Active Days
                    </span>
                  </div>

                  {dailyTrend.length === 0 ? (
                    <div className="py-12 text-center text-gray-500 text-sm">
                      No sales data recorded in this period yet.
                    </div>
                  ) : (
                    <div className="space-y-3 mt-4">
                      {dailyTrend.map((day) => {
                        const widthPct = Math.max(6, Math.round((day.revenue / maxDailyRevenue) * 100));
                        return (
                          <div key={day.dateKey} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-gray-200 w-20">{day.label}</span>
                              <span className="text-gray-400">{day.count} order{day.count === 1 ? "" : "s"}</span>
                              <span className="font-extrabold text-purple-300">
                                ₱{day.revenue.toLocaleString()}
                              </span>
                            </div>
                            <div className="w-full h-2.5 bg-gray-900 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-purple-600 to-emerald-400 rounded-full transition-all duration-300"
                                style={{ width: `${widthPct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Methods & Channel Breakdown */}
              <div className="lg:col-span-5 space-y-6">
                {/* Payment Method Breakdown */}
                <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="w-5 h-5 text-purple-400" />
                    <h2 className="text-lg font-bold text-white">Sales by Payment Method</h2>
                  </div>
                  <div className="space-y-3.5">
                    {paymentBreakdown.map((pm) => (
                      <div key={pm.method} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-white uppercase flex items-center gap-2">
                            <span>{pm.label}</span>
                            <span className="text-gray-400 font-normal">({pm.count} orders)</span>
                          </span>
                          <span className="font-extrabold text-purple-300">
                            ₱{pm.total.toLocaleString()} ({pm.pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full transition-all"
                            style={{ width: `${pm.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Channel Breakdown */}
                <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <Store className="w-5 h-5 text-emerald-400" />
                    <h2 className="text-lg font-bold text-white">Sales by Fulfillment Channel</h2>
                  </div>
                  <div className="space-y-3.5">
                    {channelBreakdown.map((ch) => (
                      <div key={ch.id} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-white flex items-center gap-2">
                            <span>{ch.label}</span>
                            <span className="text-gray-400 font-normal">({ch.count})</span>
                          </span>
                          <span className="font-extrabold text-gray-200">
                            ₱{ch.total.toLocaleString()} ({ch.pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${ch.color} rounded-full transition-all`}
                            style={{ width: `${ch.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Top-Selling Products Leaderboard & Recent Sales Log */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Top Selling Items */}
              <div className="lg:col-span-6 bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    <h2 className="text-lg font-bold text-white">Top-Selling Items</h2>
                  </div>
                  <span className="text-xs text-gray-400">Ranked by units sold</span>
                </div>

                {topSellingProducts.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">
                    No product sales recorded in this period yet.
                  </p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {topSellingProducts.map((item, idx) => {
                      const sharePct =
                        periodNetItemRevenue > 0
                          ? Math.min(100, Math.round((item.revenue / periodNetItemRevenue) * 100))
                          : 0;
                      return (
                        <div
                          key={item.key}
                          className="bg-gray-900/70 border border-gray-700/70 rounded-xl p-3 flex items-center gap-3"
                        >
                          <div
                            className={`w-7 h-7 rounded-lg font-extrabold text-xs flex items-center justify-center shrink-0 ${
                              idx === 0
                                ? "bg-amber-500 text-gray-950"
                                : idx === 1
                                ? "bg-gray-300 text-gray-950"
                                : idx === 2
                                ? "bg-amber-700 text-white"
                                : "bg-gray-800 text-gray-400"
                            }`}
                          >
                            #{idx + 1}
                          </div>

                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-11 h-11 rounded-lg object-cover bg-gray-800 border border-gray-700 shrink-0"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-[10px] text-gray-500 shrink-0">
                              Item
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-bold text-white truncate">{item.name}</p>
                              <span className="text-sm font-extrabold text-emerald-400 shrink-0">
                                ₱{item.revenue.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-400 mt-0.5">
                              <span>
                                <strong className="text-purple-300">{item.units}</strong> sold across{" "}
                                {item.ordersCount} order{item.ordersCount === 1 ? "" : "s"}
                              </span>
                              <span>{sharePct}% of item sales</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Recent Sales Transactions List */}
              <div className="lg:col-span-6 bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-white">Recent Qualifying Sales</h2>
                    <p className="text-xs text-gray-400">
                      Showing latest {Math.min(15, qualifyingSalesOrders.length)} of {qualifyingSalesOrders.length} transactions
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("orders")}
                    className="text-xs text-purple-400 hover:underline font-semibold"
                  >
                    View All Orders →
                  </button>
                </div>

                {qualifyingSalesOrders.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">
                    No qualifying transactions in this period.
                  </p>
                ) : (
                  <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                    {qualifyingSalesOrders.slice(0, 15).map((o) => {
                      let itemsList: any[] = [];
                      try {
                        itemsList = JSON.parse(o.items || "[]");
                      } catch {
                        itemsList = [];
                      }
                      const totalQty = itemsList.reduce(
                        (acc, i) => acc + (Number(i.quantity) || 1),
                        0
                      );
                      return (
                        <div
                          key={o.id}
                          className="bg-gray-900/70 border border-gray-700/70 rounded-xl p-3 flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white truncate">
                                {o.customerName}
                              </span>
                              {isPosOrder(o) && (
                                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                                  POS
                                </span>
                              )}
                              <span className="text-[10px] uppercase font-bold bg-gray-800 text-gray-300 px-2 py-0.5 rounded border border-gray-700">
                                {o.paymentMethod}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5 truncate">
                              {new Date(o.createdAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}{" "}
                              · {totalQty} item{totalQty === 1 ? "" : "s"} (
                              {itemsList.map((i: any) => `${i.quantity}x ${i.name}`).join(", ")})
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-sm font-extrabold text-purple-400">
                              ₱{Number(o.totalAmount).toLocaleString()}
                            </div>
                            <span className="text-[10px] text-gray-400">{o.status}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quick Walk-in / Booth POS Modal */}
        {showPosModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowPosModal(false)}
          >
            <div
              className="bg-gray-900 border border-gray-700 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 bg-gray-800/90 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-white">
                      Quick Walk-in / Booth POS Register
                    </h2>
                    <p className="text-xs text-gray-400">
                      Ring up in-person sales immediately — automatically logs as Completed (&ldquo;Done&rdquo;) in your Sales Report.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPosModal(false)}
                  className="text-gray-400 hover:text-white bg-gray-800 p-1.5 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Product Selector & Custom Item */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={posSearch}
                      onChange={(e) => setPosSearch(e.target.value)}
                      placeholder="Search products to tap & add..."
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Product Tap Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
                    {products
                      .filter(
                        (p) =>
                          p.isAvailable !== false &&
                          p.name.toLowerCase().includes(posSearch.toLowerCase())
                      )
                      .map((p) => {
                        const hasSale =
                          p.salePrice !== null &&
                          p.salePrice !== undefined &&
                          Number(p.salePrice) > 0 &&
                          Number(p.salePrice) < Number(p.price);
                        const activePrice = hasSale ? Number(p.salePrice) : Number(p.price);
                        const inCart = posCart.find((i) => i.id === p.id);

                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => addToPosCart(p)}
                            className={`text-left p-2.5 rounded-xl border transition-all flex flex-col justify-between relative group ${
                              inCart
                                ? "bg-emerald-950/30 border-emerald-500/60"
                                : "bg-gray-800 border-gray-700 hover:border-purple-500"
                            }`}
                          >
                            {inCart && (
                              <span className="absolute top-2 right-2 bg-emerald-500 text-gray-950 text-xs font-extrabold px-2 py-0.5 rounded-full shadow">
                                {inCart.quantity}x
                              </span>
                            )}
                            <div className="flex items-center gap-2.5 mb-2">
                              {p.image ? (
                                <img
                                  src={p.image}
                                  alt={p.name}
                                  className="w-10 h-10 rounded-lg object-cover bg-gray-900 shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center text-[9px] text-gray-500 shrink-0">
                                  No Img
                                </div>
                              )}
                              <span className="text-xs font-bold text-white line-clamp-2">
                                {p.name}
                              </span>
                            </div>
                            <div className="flex items-center justify-between w-full pt-1 border-t border-gray-700/60">
                              <span className="text-xs font-extrabold text-emerald-400">
                                ₱{activePrice}
                              </span>
                              <span className="text-[10px] text-gray-400 group-hover:text-white">
                                + Tap to Add
                              </span>
                            </div>
                          </button>
                        );
                      })}
                  </div>

                  {/* Quick Custom / On-the-spot Item */}
                  <div className="bg-gray-800/80 border border-gray-700 rounded-xl p-3.5 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
                      + Add Custom / On-the-Spot Item
                    </span>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="Item description (e.g. Custom Keychain / Bundle)"
                        value={posCustomName}
                        onChange={(e) => setPosCustomName(e.target.value)}
                        className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <input
                        type="number"
                        placeholder="Price (₱)"
                        value={posCustomPrice}
                        onChange={(e) => setPosCustomPrice(e.target.value)}
                        className="w-full sm:w-28 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddPosCustomItem}
                        className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shrink-0"
                      >
                        Add Item
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column: POS Ticket & Checkout */}
                <form
                  onSubmit={handleCompletePosSale}
                  className="lg:col-span-5 bg-gray-800 border border-gray-700 rounded-2xl p-5 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
                        Current POS Ticket ({posCart.reduce((s, i) => s + i.quantity, 0)} items)
                      </h3>
                      {posCart.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setPosCart([])}
                          className="text-xs text-red-400 hover:underline"
                        >
                          Clear Ticket
                        </button>
                      )}
                    </div>

                    {/* Ticket Items */}
                    {posCart.length === 0 ? (
                      <div className="py-8 text-center text-xs text-gray-500 bg-gray-900/50 rounded-xl border border-gray-700/60">
                        Tap products on the left to add them to this walk-in sale.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {posCart.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-2 bg-gray-900 px-3 py-2 rounded-xl border border-gray-700"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-white truncate">{item.name}</p>
                              <p className="text-[11px] text-gray-400">₱{item.price} each</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => updatePosQty(item.id, -1)}
                                className="p-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold text-white w-5 text-center">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updatePosQty(item.id, 1)}
                                className="p-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <span className="text-xs font-extrabold text-emerald-400 w-14 text-right">
                              ₱{item.price * item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Customer & Payment Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-700">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                          Buyer Name / Label
                        </label>
                        <input
                          type="text"
                          value={posCustomerName}
                          onChange={(e) => setPosCustomerName(e.target.value)}
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white"
                          placeholder="Walk-in Customer"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                          Booth / Channel Note
                        </label>
                        <input
                          type="text"
                          value={posLocationNote}
                          onChange={(e) => setPosLocationNote(e.target.value)}
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white"
                          placeholder="Walk-in / Booth POS"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 mb-1.5">
                        Payment Method
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["cash", "gcash", "maya"] as const).map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setPosPaymentMethod(m)}
                            className={`py-2 rounded-lg text-xs font-bold uppercase border transition-all ${
                              posPaymentMethod === m
                                ? "bg-emerald-600 text-white border-emerald-500"
                                : "bg-gray-900 text-gray-400 border-gray-700 hover:text-white"
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Discount & Cash Change Calculator */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                          Discount (₱ Optional)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={posDiscount}
                          onChange={(e) => setPosDiscount(e.target.value)}
                          placeholder="0"
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                          Cash Tendered (₱ Calc)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={posCashReceived}
                          onChange={(e) => setPosCashReceived(e.target.value)}
                          placeholder="Optional"
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Totals & Submit */}
                  <div className="pt-3 border-t border-gray-700 space-y-2">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Subtotal</span>
                      <span>₱{posSubtotal.toLocaleString()}</span>
                    </div>
                    {posDiscountNum > 0 && (
                      <div className="flex justify-between text-xs text-amber-400">
                        <span>Discount</span>
                        <span>-₱{posDiscountNum.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-extrabold text-white pt-1 border-t border-gray-700">
                      <span>Total Due</span>
                      <span className="text-emerald-400">₱{posFinalTotal.toLocaleString()}</span>
                    </div>
                    {posCashReceivedNum > 0 && (
                      <div className="flex justify-between text-xs font-bold text-purple-300 bg-purple-950/40 px-3 py-1.5 rounded-lg border border-purple-500/30">
                        <span>Change Due:</span>
                        <span>
                          {posCashReceivedNum >= posFinalTotal
                            ? `₱${posChangeDue.toLocaleString()}`
                            : `Short by ₱${(posFinalTotal - posCashReceivedNum).toLocaleString()}`}
                        </span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmittingPos || posCart.length === 0}
                      className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold py-3 px-6 rounded-xl shadow-lg shadow-emerald-600/20 transition-colors"
                    >
                      {isSubmittingPos
                        ? "Recording Sale..."
                        : `Complete Walk-in Sale (₱${posFinalTotal.toLocaleString()})`}
                    </button>
                  </div>
                </form>
              </div>
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
