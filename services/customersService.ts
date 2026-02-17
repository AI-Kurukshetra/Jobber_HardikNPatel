import { z } from "zod";
import { CustomersRepository } from "@/repositories/customersRepository";

const customerSchema = z.object({
  companyId: z.string().uuid(),
  name: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  tags: z.array(z.string()).optional()
});

export class CustomersService {
  constructor(private readonly repo: CustomersRepository) {}

  async list(companyId: string, search?: string) {
    return this.repo.list(companyId, search);
  }

  async create(payload: unknown) {
    const input = customerSchema.parse(payload);
    return this.repo.create(input);
  }

  async delete(companyId: string, id: string) {
    return this.repo.softDelete(companyId, id);
  }
}
