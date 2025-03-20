import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useUser } from "@clerk/nextjs";
import LoginModal from "../components/Auth/LoginModal";

const MissingRuleForm = () => {
  const { user } = useUser();
  const [propFirms, setPropFirms] = useState([]);
  const [selectedFirm, setSelectedFirm] = useState("");
  const [ruleDescription, setRuleDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Fetch all prop firm names
  useEffect(() => {
    const fetchPropFirms = async () => {
      const { data, error } = await supabase
        .from("prop_firms")
        .select("id, propfirm_name");

      if (error) {
        console.error("Error fetching prop firms:", error);
      } else {
        setPropFirms(data);
      }
    };

    fetchPropFirms();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFirm || !ruleDescription.trim()) {
      setMessage("Please select a firm and provide a rule description.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    const { error } = await supabase.from("missing_rules").insert([
      {
        prop_firm_id: selectedFirm,
        rule_description: ruleDescription.trim(),
      },
    ]);

    if (error) {
      console.error("Error submitting rule:", error);
      setMessage("❌ Failed to submit. Try again.");
    } else {
      setMessage("✅ Rule submitted successfully!");
      setRuleDescription("");
      setSelectedFirm("");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="relative mt-20 bg-[#0f0f0f] border-[#EDB900] bg-[rgba(237,185,0,0.03)] border-[1px] p-10 rounded-[10px] text-white w-[80%] mx-auto mb-[150px]">
      {/* ✅ Transparent Overlay for Non-Logged Users */}
      {!user && (
        <div
          className="absolute inset-0 w-full h-full bg-transparent cursor-pointer z-30"
          onClick={() => setIsLoginOpen(true)}
        />
      )}

      <h2 className="text-6xl font-bold text-center mb-2 mt-5 text-[#EDB900]">Are we missing a rule?</h2>
      <p className="text-center mb-5 mt-3 text-white">
        Let us know if we should add something specific.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
        {/* Dropdown for prop firms */}
        <div>
          <label className="block mb-2 text-[#EDB900]">Prop Firm</label>
          <select
            value={selectedFirm}
            onChange={(e) => setSelectedFirm(e.target.value)}
            className="w-full p-2 bg-[#0f0f0f] border border-[#EDB900] text-white rounded-[10px] focus:outline-none"
            disabled={!user} // Disable if not logged in
          >
            <option value="">Select one...</option>
            {propFirms.map((firm) => (
              <option key={firm.id} value={firm.id}>
                {firm.propfirm_name}
              </option>
            ))}
          </select>
        </div>

        {/* Rule description input */}
        <div>
          <label className="block mb-2 text-[#EDB900]">Rule Description</label>
          <textarea
            value={ruleDescription}
            onChange={(e) => setRuleDescription(e.target.value)}
            placeholder="Provide us with rule description or source."
            className="w-full p-3 h-24 bg-[#0f0f0f] border border-[#EDB900] text-white rounded-[10px] focus:outline-none"
            disabled={!user} // Disable if not logged in
          />
        </div>
        <div className="flex justify-center">
            {/* Submit button */}
            <button
            type="submit"
            className="bg-[#EDB900] text-black py-2 rounded-[10px] hover:opacity-80 transition disabled:opacity-50 w-[200px]"
            disabled={!user || isSubmitting}
            >
            {isSubmitting ? "Submitting..." : "Submit"}
            </button>
        </div>
        
        {/* Message */}
        {message && <p className="text-center mt-3">{message}</p>}
      </form>

      {/* ✅ Login Modal for Authentication */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
};

export default MissingRuleForm;
