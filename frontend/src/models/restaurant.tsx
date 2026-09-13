export class Restaurant {
  id: number;
  name: string;
  passwordhash: string;
  nombredelencargado: string;
  email: string;
  phoneNumber: string;
  creationDate?: string;

  constructor(name: string, email: string, passwordhash: string, nombre: string, phoneNumber: string, id: number = 0) {
    this.id = id;
    this.name = name;
    this.passwordhash = passwordhash;
    this.nombredelencargado = nombre;
    this.email = email;
    this.phoneNumber = phoneNumber;
  }
}
