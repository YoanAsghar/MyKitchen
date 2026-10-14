export class Category {
  id: number;
  name: string;
  restaurantId: number;

  constructor(id: number, name: string, restaurantId: number) {
    this.id = id;
    this.name = name;
    this.restaurantId = restaurantId;
  }
}
