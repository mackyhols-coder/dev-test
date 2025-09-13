export interface ClientUserAssociation {
  id: string;
  clientId: string;
  userId: string;
  username: string;
  isActive: boolean;
  createdAt: string;
  modifiedAt?: string;
}

export interface CreateClientUserAssociationRequest {
  clientId: string;
  userId: string;
}