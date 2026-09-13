export class Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  restaurantId: number;

  constructor(id: number, name: string, price: number,category: string, description: string, image: string, restaurantId: number) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.category = category;
    this.description = description;
    this.image = image;
    this.restaurantId = restaurantId;
  }
}

