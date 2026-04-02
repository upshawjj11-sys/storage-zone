import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";

export default function FlowModal({ open, onClose, children, maxWidth = "max-w-2xl" }) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className={`${maxWidth} p-0 overflow-hidden max-h-[90vh] overflow-y-auto`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 transition"
        >
          <X className="w-4 h-4" />
        </button>
        {children}
      </DialogContent>
    </Dialog>
  );
}