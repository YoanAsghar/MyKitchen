import { config } from "../config";
import { Restaurant } from "../models/restaurant";

const API_URL = `${config.apiRoute}/api/v1/Restaurant`

export interface RegisterRestaurantPayload {
  name: string;
  password: string;
  nombreDelEncargado: string;
  email: string;
  phoneNumber: string;
}

export interface RegisterRestaurantResult {
  userName: string;
  role: string;
  restaurantId: number;
  restaurant: Restaurant;
}

async function readError(response: Response, fallback: string): Promise<string> {
  try {
    const data = await response.json();
    if (data && typeof data.message === "string") return data.message;
  } catch { /* not JSON */ }
  return fallback;
}

export const RestaurantServices = {
  register: async (payload: RegisterRestaurantPayload): Promise<RegisterRestaurantResult> => {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok)
      throw new Error(await readError(response, "No se pudo crear el restaurante"));
    return await response.json();
  },

  getMy: async (): Promise<Restaurant> => {
    const response = await fetch(API_URL, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("No se pudo obtener el restaurante");
    return await response.json();
  },

  update: async (id: number, restaurant: Partial<Restaurant>): Promise<Restaurant> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(restaurant),
    });
    if (!response.ok) throw new Error("No se pudo actualizar el restaurante");
    return await response.json();
  },

  remove: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("No se pudo eliminar el restaurante");
  },
};