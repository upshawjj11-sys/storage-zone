// All sizes in cubic feet (approximate real-world volumes)
// NOTE: Large furniture cuft values are intentionally floor-space dominant
// (width × depth × ~4ft effective height) since furniture generally cannot be stacked.
// Boxes/bins use a more compressed stacking height assumption.
export const ITEM_CATEGORIES = [
  {
    label: "Seating",
    icon: "🛋️",
    items: [
      { id: "sofa_3seat", label: "Sofa (3-seat)", icon: "🛋️", cuft: 70, w: 84, d: 35, h: 34 },
      { id: "sofa_sectional", label: "Sectional Sofa", icon: "🛋️", cuft: 130, w: 110, d: 85, h: 34 },
      { id: "loveseat", label: "Loveseat", icon: "🛋️", cuft: 50, w: 60, d: 35, h: 34 },
      { id: "recliner", label: "Recliner", icon: "🪑", cuft: 35, w: 32, d: 38, h: 42 },
      { id: "armchair", label: "Armchair", icon: "🪑", cuft: 25, w: 30, d: 30, h: 38 },
      { id: "office_chair", label: "Office Chair", icon: "🪑", cuft: 12, w: 26, d: 26, h: 48 },
    ],
  },
  {
    label: "Tables",
    icon: "🪵",
    items: [
      { id: "dining_table_4", label: "Dining Table (4-seat)", icon: "🪵", cuft: 30, w: 48, d: 36, h: 30 },
      { id: "dining_table_6", label: "Dining Table (6-seat)", icon: "🪵", cuft: 45, w: 72, d: 36, h: 30 },
      { id: "coffee_table", label: "Coffee Table", icon: "🪵", cuft: 16, w: 48, d: 24, h: 18 },
      { id: "end_table", label: "End / Side Table", icon: "🪵", cuft: 6, w: 20, d: 20, h: 24 },
      { id: "desk", label: "Desk", icon: "🖥️", cuft: 27, w: 54, d: 30, h: 30 },
      { id: "desk_l", label: "L-Shape Desk", icon: "🖥️", cuft: 50, w: 60, d: 60, h: 30 },
    ],
  },
  {
    label: "Beds",
    icon: "🛏️",
    items: [
      { id: "bed_twin", label: "Twin Bed & Frame", icon: "🛏️", cuft: 55, w: 39, d: 75, h: 14 },
      { id: "bed_full", label: "Full Bed & Frame", icon: "🛏️", cuft: 72, w: 54, d: 75, h: 14 },
      { id: "bed_queen", label: "Queen Bed & Frame", icon: "🛏️", cuft: 85, w: 60, d: 80, h: 14 },
      { id: "bed_king", label: "King Bed & Frame", icon: "🛏️", cuft: 108, w: 76, d: 80, h: 14 },
      { id: "mattress_twin", label: "Mattress (Twin)", icon: "🛏️", cuft: 20, w: 39, d: 75, h: 9 },
      { id: "mattress_queen", label: "Mattress (Queen)", icon: "🛏️", cuft: 32, w: 60, d: 80, h: 9 },
    ],
  },
  {
    label: "Storage & Shelving",
    icon: "🗄️",
    items: [
      { id: "dresser_sm", label: "Dresser (Small)", icon: "🗄️", cuft: 20, w: 36, d: 18, h: 42 },
      { id: "dresser_lg", label: "Dresser (Large)", icon: "🗄️", cuft: 32, w: 60, d: 20, h: 48 },
      { id: "bookcase", label: "Bookcase", icon: "📚", cuft: 18, w: 36, d: 12, h: 72 },
      { id: "wardrobe", label: "Wardrobe / Armoire", icon: "🗄️", cuft: 48, w: 48, d: 24, h: 72 },
      { id: "filing_cabinet", label: "Filing Cabinet", icon: "🗄️", cuft: 10, w: 18, d: 26, h: 52 },
      { id: "shelving_unit", label: "Shelving Unit", icon: "🗄️", cuft: 18, w: 36, d: 18, h: 72 },
    ],
  },
  {
    label: "Appliances",
    icon: "🧺",
    items: [
      { id: "washer", label: "Washer", icon: "🧺", cuft: 14, w: 27, d: 30, h: 44 },
      { id: "dryer", label: "Dryer", icon: "🧺", cuft: 14, w: 27, d: 30, h: 44 },
      { id: "fridge", label: "Refrigerator", icon: "🧊", cuft: 22, w: 30, d: 32, h: 66 },
      { id: "fridge_mini", label: "Mini Fridge", icon: "🧊", cuft: 6, w: 18, d: 18, h: 32 },
      { id: "dishwasher", label: "Dishwasher", icon: "🧽", cuft: 10, w: 24, d: 26, h: 34 },
      { id: "microwave", label: "Microwave", icon: "📦", cuft: 2, w: 22, d: 14, h: 12 },
    ],
  },
  {
    label: "Boxes & Bins",
    icon: "📦",
    items: [
      { id: "box_sm", label: "Small Box", icon: "📦", cuft: 1.5, w: 12, d: 12, h: 12 },
      { id: "box_md", label: "Medium Box", icon: "📦", cuft: 3, w: 18, d: 14, h: 14 },
      { id: "box_lg", label: "Large Box", icon: "📦", cuft: 4.5, w: 18, d: 18, h: 24 },
      { id: "tote_lg", label: "Storage Tote (Large)", icon: "📦", cuft: 4, w: 24, d: 16, h: 16 },
      { id: "wardrobe_box", label: "Wardrobe Box", icon: "📦", cuft: 10, w: 24, d: 20, h: 48 },
    ],
  },
  {
    label: "Outdoor & Misc",
    icon: "🚲",
    items: [
      { id: "bicycle", label: "Bicycle", icon: "🚲", cuft: 12, w: 68, d: 22, h: 44 },
      { id: "lawnmower", label: "Lawn Mower", icon: "🌿", cuft: 15, w: 54, d: 22, h: 38 },
      { id: "tv_50", label: "TV (50\")", icon: "📺", cuft: 5, w: 47, d: 6, h: 28 },
      { id: "tv_65", label: "TV (65\")", icon: "📺", cuft: 8, w: 58, d: 6, h: 34 },
      { id: "piano_upright", label: "Upright Piano", icon: "🎹", cuft: 35, w: 58, d: 26, h: 52 },
      { id: "grill", label: "Grill / BBQ", icon: "🔥", cuft: 12, w: 48, d: 24, h: 50 },
    ],
  },
];

// All unit sizes — widthIn/depthIn are floor dimensions in inches, cuft is usable storage volume
export const UNIT_SIZES = [
  { label: "5' × 5'",  sqft: 25,  widthIn: 60,  depthIn: 60,  cuft: 200,  desc: "Walk-in closet size. Great for a few boxes, small furniture, seasonal items." },
  { label: "5' × 10'", sqft: 50,  widthIn: 60,  depthIn: 120, cuft: 400,  desc: "Large shed size. Fits a bedroom's worth of furniture." },
  { label: "10' × 10'",sqft: 100, widthIn: 120, depthIn: 120, cuft: 800,  desc: "Half a standard garage. Fits 1-bedroom apartment contents." },
  { label: "10' × 15'",sqft: 150, widthIn: 120, depthIn: 180, cuft: 1200, desc: "Large bedroom size. Fits 2-bedroom home contents." },
  { label: "10' × 20'",sqft: 200, widthIn: 120, depthIn: 240, cuft: 1600, desc: "Small garage size. Fits 3–4 bedroom home." },
  { label: "10' × 30'",sqft: 300, widthIn: 120, depthIn: 360, cuft: 2400, desc: "Large garage size. Fits 4–5 bedroom home." },
];