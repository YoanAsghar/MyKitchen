import type { User } from "./user";

export interface ExpenseType {
  BILLS: string,
  GROCERIES: string,
  SALARY: string,
  SERVICES: string 
}

export class expense{
  id?: number;
  name: string;
  value: number;
  expenseType: ExpenseType;
  dateOfExpense: Date;
  createdByUserId: number;
  createdByUser: User;
  restaurantId: number;

  constructor(name: string, value: number, expenseType: ExpenseType, dateOfExpense: Date, createdByUser: User, restaurantId: number){
    this.name = name;
    this.value = value;
    this.expenseType = expenseType;
    this.dateOfExpense = dateOfExpense;
    this.createdByUserId = createdByUser.id || 0;
    this.createdByUser = createdByUser;
    this.restaurantId = restaurantId;
  }
}
