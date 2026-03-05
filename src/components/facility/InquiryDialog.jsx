import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check } from "lucide-react";

export default function InquiryDialog({ open, onOpenChange, facility, selectedUnit, form, setForm, submitting, submitted, onSubmit }) {
  const isBC = facility?.facility_type === "business_center";

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {submitted ? (isBC ? "Inquiry Sent!" : "Reservation Submitted!") : (isBC ? "Inquire About This Space" : "Reserve a Unit")}
          </DialogTitle>
          <DialogDescription>
            {submitted
              ? (isBC ? "Our team will be in touch shortly." : "We'll confirm your reservation soon.")
              : (
                <span>
                  <span className="font-semibold text-gray-800">{facility?.name}</span>
                  {selectedUnit && (
                    <span className="text-gray-500">
                      {" "}— {selectedUnit.name}
                      {selectedUnit.unit_type ? ` (${selectedUnit.unit_type})` : ""}
                      {selectedUnit.size ? `, ${selectedUnit.size}` : ""}
                    </span>
                  )}
                </span>
              )}
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <Button onClick={() => onOpenChange(false)} className="rounded-full">Close</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedUnit && (
              <div className="bg-gray-50 rounded-xl p-3 text-sm space-y-1">
                <p className="font-semibold text-[#1B365D]">{selectedUnit.name}</p>
                {selectedUnit.unit_type && <p className="text-gray-600">Type: {selectedUnit.unit_type}</p>}
                {selectedUnit.size && <p className="text-gray-600">Size: {selectedUnit.size}</p>}
                {selectedUnit.price > 0 && (
                  <p className="text-gray-600">{isBC ? "Starting at" : "Price"}: ${selectedUnit.price.toLocaleString()}/mo</p>
                )}
                {selectedUnit.features?.length > 0 && (
                  <p className="text-gray-600">Features: {selectedUnit.features.join(", ")}</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div><Label>Full Name *</Label><Input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} /></div>
              <div><Label>Email *</Label><Input type="email" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Phone</Label><Input value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} /></div>
              {!isBC && (
                <div><Label>Move-in Date</Label><Input type="date" value={form.move_in_date} onChange={(e) => setForm({ ...form, move_in_date: e.target.value })} /></div>
              )}
            </div>
            <div>
              <Label>{isBC ? "Message / Questions" : "Notes"}</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder={isBC ? "Tell us about your needs, questions, or preferred move-in timeline..." : "Anything we should know?"} />
            </div>
            <Button
              className="w-full rounded-full font-semibold py-5"
              style={{ background: "#E8792F" }}
              onClick={onSubmit}
              disabled={submitting || !form.customer_name || !form.customer_email}
            >
              {submitting ? "Submitting..." : (isBC ? "Send Inquiry" : "Submit Reservation")}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}