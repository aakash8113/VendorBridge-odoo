import { Search, X } from "lucide-react";
import { useState, useEffect } from "react";
import { apiFetch } from "../lib/api";

export function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    category: "",
    gstNumber: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
  });

  const loadVendors = async () => {
    try {
      const endpoint = search ? `/vendors?search=${search}` : "/vendors";
      const data = await apiFetch(endpoint);
      setVendors(data);
    } catch (err) {
      console.error("Failed to fetch vendors", err);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(loadVendors, 300);
    return () => clearTimeout(timeoutId);
  }, [search]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch("/vendors", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      setIsModalOpen(false);
      setFormData({
        companyName: "",
        category: "",
        gstNumber: "",
        contactEmail: "",
        contactPhone: "",
        address: "",
      });
      loadVendors(); // Refresh list after adding
    } catch (err: any) {
      alert(err.message || "Failed to add vendor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-semibold text-gray-100">Vendors</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage supplier profiles and registrations
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2 text-sm"
        >
          + Add Vendor
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, gst number, category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#1E1E1E] border border-zinc-700 text-gray-100 rounded-lg pl-10 pr-4 py-3 outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      <div className="bg-[#1E1E1E] border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-800/50 text-gray-400 border-b border-zinc-800">
            <tr>
              <th className="px-6 py-4 font-medium">Vendor Name</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">GST no.</th>
              <th className="px-6 py-4 font-medium">Contact Email</th>
              <th className="px-6 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800 text-gray-300">
            {vendors.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-zinc-500">
                  No vendors found.
                </td>
              </tr>
            ) : (
              vendors.map((vendor: any) => (
                <tr key={vendor.id}>
                  <td className="px-6 py-4">{vendor.companyName}</td>
                  <td className="px-6 py-4">{vendor.category}</td>
                  <td className="px-6 py-4">{vendor.gstNumber}</td>
                  <td className="px-6 py-4">{vendor.contactEmail}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs ${vendor.status === "ACTIVE" ? "bg-emerald-900/30 text-emerald-500" : "bg-amber-900/30 text-amber-500"}`}
                    >
                      {vendor.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Vendor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1E1E1E] border border-zinc-800 rounded-xl w-full max-w-lg shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-zinc-800">
              <h2 className="text-xl font-semibold text-gray-100">
                Register New Vendor
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVendor} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm text-gray-400">
                    Company Name *
                  </label>
                  <input
                    required
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-zinc-700 text-gray-100 rounded-lg px-3 py-2 outline-none focus:border-blue-500 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-400">Category *</label>
                  <input
                    required
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-zinc-700 text-gray-100 rounded-lg px-3 py-2 outline-none focus:border-blue-500 text-sm"
                    placeholder="e.g. IT Equipment"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm text-gray-400">GST Number *</label>
                <input
                  required
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-zinc-700 text-gray-100 rounded-lg px-3 py-2 outline-none focus:border-blue-500 text-sm italic"
                  placeholder="e.g. 27AADCB2230M1Z2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm text-gray-400">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-zinc-700 text-gray-100 rounded-lg px-3 py-2 outline-none focus:border-blue-500 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-400">
                    Contact Phone *
                  </label>
                  <input
                    required
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-zinc-700 text-gray-100 rounded-lg px-3 py-2 outline-none focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm text-gray-400">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={2}
                  className="w-full bg-black/50 border border-zinc-700 text-gray-100 rounded-lg px-3 py-2 outline-none focus:border-blue-500 text-sm resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-zinc-700 text-gray-300 hover:bg-zinc-800 rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-blue-600 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Register Vendor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
