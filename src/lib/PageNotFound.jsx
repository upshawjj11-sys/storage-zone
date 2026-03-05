import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PageNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-black text-[#1B365D]/10 mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-gray-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to={createPageUrl("Home")}>
            <Button className="rounded-full gap-2" style={{ background: "#1B365D" }}>
              <Home className="w-4 h-4" /> Go Home
            </Button>
          </Link>
          <Link to={createPageUrl("Locations")}>
            <Button variant="outline" className="rounded-full gap-2">
              Find Storage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}