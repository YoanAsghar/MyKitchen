import { Product } from "../models/product";
import { config } from "../config";

const API_URL = config.apiRoute + "/api/v1/Product";

// Surfaces the backend's plain-text reason (e.g. category not found) instead of
// a generic message, so the admin form can show something actionable.
async function readError(response: Response, fallback: string): Promise<string> {
  try {
    const text = await response.text();
    return text?.trim() || fallback;
  } catch {
    return fallback;
  }
}

export const ProductServices = {
  getAll: async(searchTerm : string = ""): Promise<Product[]> =>{
    //If search term is empty return all products
    const opts: RequestInit = { credentials: "include" };
    if(searchTerm === ""){
      const response = await fetch(API_URL + "/search", opts);
      if(!response.ok) throw new Error ("Error fetching products");
      return await response.json();
    }

    const response = await fetch(API_URL + `/search?search=${searchTerm}`, opts)
    if(!response.ok) throw new Error (`Error getting ${searchTerm} products`);
    return await response.json();
  },

  createProduct: async(product: Product): Promise<Product> => {
    const response = await fetch(API_URL, {
      method : "POST",
      headers : { "Content-Type": "application/json"},
      credentials: "include",
      body : JSON.stringify(product)
    })

    if(!response.ok) throw new Error(await readError(response, "Error creating product"));

  return await response.json();
  },
  
  editProduct: async(product: Product): Promise<Product> => {
    const response = await fetch(API_URL + `/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(product)
    })
    
    if(!response.ok) throw new Error(await readError(response, `Error editing product to ${product.name}`));

    return await response.json();
  },
  
  deleteProduct: async(id: number): Promise<Product> => {
    const response = await fetch(API_URL + `/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json"},
      credentials: "include"
    })

    if(!response.ok) throw new Error (`Error deleting product by id ${id}`);

    return await response.json();
  }
}
