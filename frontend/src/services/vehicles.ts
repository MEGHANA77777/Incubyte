import type {
  Vehicle,
  VehicleFilters,
  VehicleListResponse,
  VehiclePayload,
  VehicleUpdatePayload,
} from "../types/vehicle";
import { api } from "./api";

export const getVehicles = async (
  page = 1,
  limit = 12,
): Promise<VehicleListResponse> => {
  const response = await api.get<VehicleListResponse>("/api/vehicles", {
    params: { page, limit },
  });
  return response.data;
};

export const searchVehicles = async (
  filters: VehicleFilters,
): Promise<Vehicle[]> => {
  const response = await api.get<Vehicle[]>("/api/vehicles/search", {
    params: filters,
  });
  return response.data;
};

export const getVehicle = async (id: string): Promise<Vehicle> => {
  const response = await api.get<Vehicle>(`/api/vehicles/${id}`);
  return response.data;
};

export const createVehicle = async (payload: VehiclePayload): Promise<Vehicle> => {
  const response = await api.post<Vehicle>("/api/vehicles", payload);
  return response.data;
};

export const updateVehicle = async (
  id: string,
  payload: VehicleUpdatePayload,
): Promise<Vehicle> => {
  const response = await api.put<Vehicle>(`/api/vehicles/${id}`, payload);
  return response.data;
};

export const deleteVehicle = async (id: string): Promise<void> => {
  await api.delete(`/api/vehicles/${id}`);
};

export const purchaseVehicle = async (id: string): Promise<Vehicle> => {
  const response = await api.post<Vehicle>(`/api/vehicles/${id}/purchase`);
  return response.data;
};

export const restockVehicle = async (
  id: string,
  quantity: number,
): Promise<Vehicle> => {
  const response = await api.post<Vehicle>(`/api/vehicles/${id}/restock`, {
    quantity,
  });
  return response.data;
};
