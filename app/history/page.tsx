"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Package,
  Search,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  MapPin,
  CreditCard,
  Copy,
  Check,
  Eye,
  X,
  ThumbsUp,
} from "lucide-react";

const ORDER_STEPS = [
  { key: "Pending", label: "Order Placed", desc: "Awaiting confirmation", icon: Clock },
  { key: "Accepted", label: "Accepted", desc: "Crafting your items", icon: ThumbsUp },
  { key: "Shipping", label: "Out for Delivery", desc: "On the way / Ready for meetup", icon: Truck },
  { key: "Done", label: "Completed", desc: "Order fulfilled", icon: CheckCircle2 },
];

export default function OrderHistory() {
  const [query, setQuery] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewModal, setPreviewModal] = useState<{ url: string; title: string } | null>(null);

  const performSearch = async (searchValue: string) => {
    const trimmed = searchValue.trim();
    if (!trimmed) return;

    setLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/orders?email=${encodeURIComponent(trimmed)}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error(error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedPreset = localStorage.getItem("userPreset");
    if (savedPreset) {
      try {
        const parsed = JSON.parse(savedPreset);
        const defaultQuery = parsed.email || parsed.phone || "";
        if (defaultQuery) {
          setQuery(defaultQuery);
          performSearch(defaultQuery);
        }
      } catch {
        // ignore invalid preset
      }
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const getStepIndex = (status: string) => {
    return ORDER_STEPS.findIndex((s) => s.key === status);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/40";
      case "Accepted":
        return "bg-blue-500/20 text-blue-400 border-blue-500/40";
      case "Shipping":
        return "bg-purple-500/20 text-purple-400 border-purple-500/40";
      case "Done":
        return "bg-green-500/20 text-green-400 border-green-500/40";
      case "Declined":
        return "bg-red-500/20 text-red-400 border-red-500/40";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/40";
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === "All") return true;
    if (statusFilter === "Active") {
      return o.status === "Pending" || o.status === "Accepted" || o.status === "Shipping";
    }
    return o.status === statusFilter;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-white mb-2">Track Your Orders</h1>
        <p className="text-gray-400 text-lg">
          Enter your email address, phone number, or Order ID to view real-time status updates.
        </p>
      </div>

      {/* Search Card */}
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg mb-8">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              id="emailSearch"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter email (juan@example.com), phone (0912...), or Order ID..."
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-xl transition-colors flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20"
          >
            {loading ? "Searching..." : "Track Orders"}
          </button>
        </form>
      </div>

      {/* Empty State */}
      {hasSearched && !loading && orders.length === 0 && (
        <div className="text-center py-14 bg-gray-800/50 rounded-2xl border border-gray-700/50">
          <Package className="w-14 h-14 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No orders found</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            We couldn&apos;t find any orders matching <span className="text-white font-medium">&ldquo;{query}&rdquo;</span>. Double-check your email, phone number, or Order ID.
          </p>
          <Link
            href="/shop"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl font-medium inline-flex items-center transition-colors"
          >
            Browse Shop <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Results List */}
      {orders.length > 0 && (
        <div className="space-y-6">
          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {[
                { id: "All", label: `All (${orders.length})` },
                {
                  id: "Active",
                  label: `Active (${
                    orders.filter((o) => ["Pending", "Accepted", "Shipping"].includes(o.status)).length
                  })`,
                },
                { id: "Done", label: `Completed (${orders.filter((o) => o.status === "Done").length})` },
                { id: "Declined", label: `Declined (${orders.filter((o) => o.status === "Declined").length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    statusFilter === tab.id
                      ? "bg-purple-600 text-white border-purple-500 shadow"
                      : "bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {filteredOrders.map((order) => {
            let items: any[] = [];
            try {
              items = JSON.parse(order.items || "[]");
            } catch {
              items = [];
            }
            const currentStep = getStepIndex(order.status);
            const subtotal = Math.max(0, (Number(order.totalAmount) || 0) - (Number(order.deliveryFee) || 0));

            return (
              <div
                key={order.id}
                className="bg-gray-800 rounded-2xl border border-gray-700 shadow-xl overflow-hidden"
              >
                {/* Order Header */}
                <div className="bg-gray-900/70 px-6 py-4 border-b border-gray-700 flex flex-wrap justify-between items-center gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div>
                      <span className="text-xs text-gray-400 block">Order ID</span>
                      <button
                        type="button"
                        onClick={() => handleCopyId(order.id)}
                        className="font-mono text-white text-sm font-semibold flex items-center gap-1.5 hover:text-purple-400 transition-colors"
                        title="Copy Order ID"
                      >
                        <span>#{order.id.substring(0, 10)}</span>
                        {copiedId === order.id ? (
                          <Check className="w-3.5 h-3.5 text-green-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-gray-500" />
                        )}
                      </button>
                    </div>

                    <div className="h-8 w-px bg-gray-700 hidden sm:block" />

                    <div>
                      <span className="text-xs text-gray-400 block">Date Placed</span>
                      <span className="text-white text-sm font-medium">
                        {new Date(order.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs text-gray-400 block">Total Amount</span>
                      <span className="text-purple-400 text-lg font-extrabold">₱{order.totalAmount}</span>
                    </div>

                    <span
                      className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold border ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Visual Progress Stepper */}
                <div className="px-6 py-5 bg-gray-900/30 border-b border-gray-700/60">
                  {order.status === "Declined" ? (
                    <div className="flex items-center gap-3 bg-red-950/30 border border-red-800/50 rounded-xl p-3 text-red-300 text-sm">
                      <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                      <span>
                        This order was declined. Please contact us on our Facebook page if you have any questions.
                      </span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {ORDER_STEPS.map((step, idx) => {
                        const Icon = step.icon;
                        const isCompleted = currentStep >= idx;
                        const isCurrent = currentStep === idx;
                        return (
                          <div
                            key={step.key}
                            className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                              isCurrent
                                ? "bg-purple-600/15 border-purple-500/60 text-white"
                                : isCompleted
                                ? "bg-gray-900/60 border-green-500/30 text-gray-200"
                                : "bg-gray-900/20 border-gray-800 text-gray-500"
                            }`}
                          >
                            <div
                              className={`p-2 rounded-lg shrink-0 ${
                                isCurrent
                                  ? "bg-purple-600 text-white"
                                  : isCompleted
                                  ? "bg-green-600/20 text-green-400"
                                  : "bg-gray-800 text-gray-500"
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold truncate">{step.label}</p>
                              <p className="text-[11px] text-gray-400 leading-tight mt-0.5">{step.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Order Items & Delivery Info */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Items List */}
                  <div className="lg:col-span-7 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Items Ordered ({items.reduce((acc, i) => acc + (Number(i.quantity) || 1), 0)})
                    </h4>
                    <div className="space-y-2.5">
                      {items.map((item: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between gap-3 bg-gray-900/60 p-3 rounded-xl border border-gray-700/60"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {item.image ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewModal({
                                    url: item.image,
                                    title: item.name,
                                  })
                                }
                                className="w-12 h-12 rounded-lg overflow-hidden bg-gray-800 border border-gray-700 shrink-0 relative group"
                              >
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              </button>
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-[10px] text-gray-500 shrink-0">
                                No Img
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-white truncate">
                                <span className="text-purple-400 font-extrabold mr-1.5">
                                  {item.quantity}x
                                </span>
                                {item.name}
                              </p>
                              {item.description && String(item.id || "").startsWith("custom-") && (
                                <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="text-sm font-bold text-gray-200 shrink-0">
                            ₱{(Number(item.price) || 0) * (Number(item.quantity) || 1)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery & Payment Summary */}
                  <div className="lg:col-span-5 bg-gray-900/50 p-4 rounded-xl border border-gray-700/60 flex flex-col justify-between space-y-4">
                    <div className="space-y-3 text-sm">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        Delivery & Payment
                      </h4>
                      <div className="flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-400">Delivery / Meetup Location</p>
                          <p className="text-white font-medium">{order.address || "Campus Meetup"}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <CreditCard className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-400">Payment Method</p>
                          <p className="text-white font-medium uppercase">{order.paymentMethod}</p>
                        </div>
                      </div>
                      {order.proofOfPayment && (
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewModal({
                              url: order.proofOfPayment,
                              title: `Payment Receipt — Order #${order.id.substring(0, 8)}`,
                            })
                          }
                          className="text-xs text-blue-400 hover:underline inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/30 px-3 py-1.5 rounded-lg font-medium"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Uploaded Receipt
                        </button>
                      )}
                    </div>

                    <div className="pt-3 border-t border-gray-800 space-y-1 text-xs text-gray-400">
                      <div className="flex justify-between">
                        <span>Items Subtotal</span>
                        <span className="text-gray-200">₱{subtotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Fee</span>
                        <span className="text-gray-200">
                          {order.deliveryFee > 0 ? `₱${order.deliveryFee}` : "Free (Meetup)"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm font-extrabold text-white pt-1.5 border-t border-gray-800">
                        <span>Total</span>
                        <span className="text-purple-400">₱{order.totalAmount}</span>
                      </div>
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
            className="bg-gray-900 border border-gray-700 rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-800">
              <h3 className="text-sm font-bold text-white truncate pr-4">{previewModal.title}</h3>
              <button
                type="button"
                onClick={() => setPreviewModal(null)}
                className="text-gray-400 hover:text-white bg-gray-800 rounded-full p-1"
              >
                <X className="w-5 h-5" />
              </button>
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
  );
}
