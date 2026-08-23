export interface Vehicle {
  id: string;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface VehicleListResponse {
  items: Vehicle[];
  total: number;
  page: number;
  limit: number;
}

export interface VehicleFilters {
  make?: string;
  model?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
}

export interface VehiclePayload {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}

export type VehicleUpdatePayload = Partial<VehiclePayload>;

export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";

export const stockStatus = (quantity: number): StockStatus => {
  if (quantity === 0) return "Out of Stock";
  if (quantity <= 3) return "Low Stock";
  return "In Stock";
};
