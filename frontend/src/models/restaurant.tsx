export class Restaurant {
  id: number;
  name: string;
  nombreDelEncargado: string;
  email: string;
  phoneNumber: string;
  creationDate?: string;

  constructor(name: string, email: string, nombreDelEncargado: string, phoneNumber: string, id: number = 0) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.nombreDelEncargado = nombreDelEncargado;
    this.phoneNumber = phoneNumber;
  }
}
