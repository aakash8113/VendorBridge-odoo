import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createRfqRequest, fetchVendorsRequest } from "../lib/api"; // Or directly use apiFetch

export function CreateRFQ() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState<any[]>([]);

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [lineItems, setLineItems] = useState([
    { item: "", quantity: 1, unit: "NOS" },
  ]);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);

  useEffect(() => {
    fetchVendorsRequest()
      .then(setVendors)
      .catch((err) => console.error("Failed to load vendors", err));
  }, []);

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { item: "", quantity: 1, unit: "NOS" }]);
  };

  const handleLineItemChange = (
    index: number,
    field: string,
    value: string | number,
  ) => {
    const newItems = [...lineItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setLineItems(newItems);
  };

  const handleSubmit = async (status: "DRAFT" | "PUBLISHED") => {
    setLoading(true);
    try {
      await createRfqRequest({
        title,
        category,
        deadline,
        description,
        status,
        lineItems,
        vendorIds: selectedVendors,
      });
      navigate("/rfqs"); // Redirect back to list
    } catch (err) {
      console.error("Failed to create RFQ", err);
      alert("Error creating RFQ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-semibold text-gray-100">Create RFQ</h1>
        <p className="text-sm text-gray-400 mt-1">New request for quotation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Basic Details */}
        <div className="space-y-6">
          <div className="space-y-1">
            <label className="text-sm text-gray-400">RFQ Title*</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-black/50 border border-zinc-700 text-gray-100 rounded-lg px-4 py-2"
              placeholder="Office Supplies Q3"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-400">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-black/50 border border-zinc-700 text-gray-100 rounded-lg px-4 py-2"
              placeholder="e.g., Furniture"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-400">Deadline*</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full bg-black/50 border border-zinc-700 text-gray-100 rounded-lg px-4 py-2 cursor-pointer"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-400">Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-black/50 border border-zinc-700 text-gray-100 rounded-lg px-4 py-2 resize-none"
            ></textarea>
          </div>

          <div className="flex flex-col gap-3 pt-6">
            <button
              onClick={() => handleSubmit("PUBLISHED")}
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors w-full"
            >
              {loading ? "Saving..." : "Save & Publish to Vendors"}
            </button>
            <button
              onClick={() => handleSubmit("DRAFT")}
              disabled={loading}
              className="px-6 py-2.5 text-gray-400 hover:text-white transition-colors w-fit underline underline-offset-4"
            >
              Save as Draft
            </button>
          </div>
        </div>

        {/* Line Items & Assignment */}
        <div className="space-y-8">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Line items</label>
            <div className="bg-[#1E1E1E] border border-zinc-800 rounded-lg overflow-hidden p-3 space-y-3">
              {lineItems.map((li, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Item Name"
                    value={li.item}
                    onChange={(e) =>
                      handleLineItemChange(index, "item", e.target.value)
                    }
                    className="flex-1 bg-black/50 border border-zinc-700 text-gray-100 rounded px-2 py-1"
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={li.quantity}
                    onChange={(e) =>
                      handleLineItemChange(
                        index,
                        "quantity",
                        parseInt(e.target.value),
                      )
                    }
                    className="w-20 bg-black/50 border border-zinc-700 text-gray-100 rounded px-2 py-1"
                  />
                  <input
                    type="text"
                    placeholder="Unit"
                    value={li.unit}
                    onChange={(e) =>
                      handleLineItemChange(index, "unit", e.target.value)
                    }
                    className="w-24 bg-black/50 border border-zinc-700 text-gray-100 rounded px-2 py-1"
                  />
                </div>
              ))}
              <button
                onClick={handleAddLineItem}
                className="text-sm text-blue-400 hover:text-blue-300 mt-2"
              >
                + Add line item
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400 uppercase tracking-wider">
              Assign Vendors
            </label>
            <select
              onChange={(e) =>
                setSelectedVendors(
                  Array.from(new Set([...selectedVendors, e.target.value])),
                )
              }
              className="w-full bg-[#1E1E1E] border border-zinc-800 rounded p-2 text-gray-300 outline-none"
            >
              <option value="">Select a vendor to assign...</option>
              {vendors.map((v: any) => (
                <option key={v.id} value={v.id}>
                  {v.companyName} ({v.category})
                </option>
              ))}
            </select>
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedVendors.map((id) => {
                const v = vendors.find((ven) => ven.id === id);
                if (!v) return null;
                return (
                  <div
                    key={id}
                    className="bg-zinc-800 px-3 py-1.5 rounded flex items-center justify-between gap-2 text-sm text-gray-200"
                  >
                    {v.companyName}
                    <X
                      className="w-4 h-4 text-gray-400 cursor-pointer hover:text-white"
                      onClick={() =>
                        setSelectedVendors(
                          selectedVendors.filter((vid) => vid !== id),
                        )
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
