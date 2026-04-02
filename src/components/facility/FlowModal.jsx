import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";

export default function FlowModal({ open, onClose, children, maxWidth = "max-w-2xl" }) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className={`${maxWidth} p-0 overflow-hidden max-h-[90vh] overflow-y-auto`}>
        {children}
      </DialogContent>
    </Dialog>
  );
}