import {BaseService} from "./BaseService";
import {ClientUserAssociation, CreateClientUserAssociationRequest} from "@/types/api/ClientUserAssociation";

class AssociationService extends BaseService {
  constructor() {
    super("association");
  }

  async getByClientId(clientId: string): Promise<ClientUserAssociation[]> {
    return await this.get<ClientUserAssociation[]>(`client/${clientId}`);
  }
  async removeAssociation(associationId: string): Promise<boolean> {
    return await this.delete<boolean>(`client/${associationId}`);
  }

  async createAssociation(request: CreateClientUserAssociationRequest): Promise<string> {
    return await this.post<CreateClientUserAssociationRequest, string>("client", request);
  }
}

export default new AssociationService();
