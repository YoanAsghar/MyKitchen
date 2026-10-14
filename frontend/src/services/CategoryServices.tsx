import { Category } from "../models/category";
import { config } from "../config";

const API_URL = config.apiRoute + "/api/v1/Category";

// Reads the server's error message (the backend replies with a plain-text
// reason on 400/409) so the admin UI can show "duplicada" / "en uso" distinctly.
async function readError(response: Response, fallback: string): Promise<string> {
  try {
    const text = await response.text();
    return text?.trim() || fallback;
  } catch {
    return fallback;
  }
}

export const CategoryServices = {
  getAll: async (): Promise<Category[]> => {
    const response = await fetch(API_URL, { credentials: "include" });
    if (!response.ok) throw new Error("Error fetching categories");
    return await response.json();
  },

  createCategory: async (category: Category): Promise<Category> => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(category),
    });
    if (!response.ok) {
      throw new Error(await readError(response, "Error creating category"));
    }
    return await response.json();
  },

  editCategory: async (category: Category): Promise<Category> => {
    const response = await fetch(API_URL + `/${category.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(category),
    });
    if (!response.ok) {
      throw new Error(await readError(response, "Error editing category"));
    }
    return await response.json();
  },

  deleteCategory: async (id: number): Promise<Category> => {
    const response = await fetch(API_URL + `/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error(await readError(response, "Error deleting category"));
    }
    return await response.json();
  },
};
