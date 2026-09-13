export class User{
  id?: number;
  userName: string;
  passwordHash: string;
  role: string;
  restaurantId: number;

  constructor(userName: string, password: string, restaurantId: number){
    this.userName = userName;
    this.passwordHash = password;
    this.role = "";
    this.restaurantId = restaurantId;
  }
}
