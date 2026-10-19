import { config } from "../config";
import type { User } from "../models/user";

const API_URL = `${config.apiRoute}/api/v1/User`

export interface AuthSession {
  userName: string;
  role: string;
  restaurantId: number;
  // Restaurant display name; the frontend slugifies it into the URL segment.
  restaurantName?: string;
}

export const UserServices = {
  getAll: async(): Promise<User[]> => {
    const response = await fetch(API_URL, {
      credentials: "include",
      headers: { "Content-Type": "application/json"}
    })
    if(!response.ok) throw new Error("Error fetching users");

    return await response.json();
  },

  logIn: async(user: User): Promise<AuthSession> => {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

    if(!response.ok){
      const errorText = await response.text();
      throw new Error(errorText || "Unauthorized");
    }

    return await response.json();
  },

  // Restores the current session from the auth cookie (used on app load / refresh).
  getMe: async(): Promise<AuthSession> => {
    const response = await fetch(`${API_URL}/me`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if(!response.ok) throw new Error("Not authenticated");

    return await response.json();
  },

  // Terminates the server-side session by clearing the auth cookie.
  logOut: async(): Promise<void> => {
    await fetch(`${API_URL}/logout`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
  },

  createUser: async(newUser: User): Promise<User> => {
    const response = await fetch(API_URL, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json"},
      body: JSON.stringify(newUser)
    })
    if(!response.ok) throw new Error("Error creating user");

    return await response.json();
  },

  editUser: async(id: number, userToEdit: User): Promise<User> => {

    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json"},
      body: JSON.stringify(userToEdit)
    })
    if(!response.ok) throw new Error("Error editing user");

    return await response.json();
  },

  deleteUser: async(id: number): Promise<User> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json"},
    })
    if(!response.ok) throw new Error("Error deleting user");

    return await response.json();
  }
}
