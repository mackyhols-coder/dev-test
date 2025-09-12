import { User } from "@/types/api/User";
import { BaseService } from "./BaseService";

class UserService extends BaseService {
  constructor() {
    super("user");
  }

  async getAll(): Promise<User[]> {
    return await this.get<User[]>("");
  }

  async create(user: User): Promise<string> {
    return await this.post<User, string>("", user);
  }

  async getById(id: string): Promise<User> {
    return await this.get<User>(id);
  }

  async update(id: string, user: User): Promise<void> {
    return await this.put<User, void>(id, user);
  }
}

export default new UserService();
