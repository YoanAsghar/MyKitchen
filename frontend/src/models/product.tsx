import { Category } from "./category";

export class Product {
  id: number;
  name: string;
  price: number;
  categoryId: number | null;
  category: Category | null;
  image: string;
  description: string;
  restaurantId: number;

  constructor(
    id: number,
    name: string,
    price: number,
    categoryId: number | null,
    category: Category | null,
    description: string,
    image: string,
    restaurantId: number
  ) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.categoryId = categoryId;
    this.category = category;
    this.description = description;
    this.image = image;
    this.restaurantId = restaurantId;
  }
}
