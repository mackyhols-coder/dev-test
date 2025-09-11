import { Address } from "./Address";

export interface Client {
  id?: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  documentNumber: string;
  birthDate: string;
  address: Address;
}