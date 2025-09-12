import { BaseService } from "./BaseService";
import { Client } from "@/types/api/Client";
import {ImportJobStatus, StartImportResponse} from "@/types/ImportJob";

class ClientService extends BaseService {
  constructor() {
    super("client");
  }

  async getAll(): Promise<Client[]> {
    return await this.get<Client[]>("");
  }

  async create(client: Client): Promise<string> {
    return await this.post<Client, string>("", client);
  }

  async getById(id: string): Promise<Client> {
    return await this.get<Client>(id);
  }

  async getByDocument(document: string): Promise<Client> {
    return await this.get<Client>(`document/${document}`);
  }

  async update(id: string, client: Client): Promise<void> {
    return await this.put<Client, void>(id, client);
  }
  
  async startImport(formData: FormData): Promise<StartImportResponse> {
    return await this.postFile<StartImportResponse>("import", formData);
  }

  async getImportStatus(jobId: string): Promise<ImportJobStatus> {
    return await this.get<ImportJobStatus>(`import/status/${jobId}`);
  }
}

export default new ClientService();