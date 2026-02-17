import { SupabaseClient } from "@supabase/supabase-js";

export type CustomerInput = {
  companyId: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  tags?: string[];
};

export class CustomersRepository {
  constructor(private readonly client: SupabaseClient) {}

  async list(companyId: string, search?: string) {
    let query = this.client.from("customers").select("*").eq("company_id", companyId).is("deleted_at", null);
    if (search) {
      query = query.ilike("name", `%${search}%`);
    }
    return query.order("created_at", { ascending: false });
  }

  async create(input: CustomerInput) {
    return this.client.from("customers").insert({
      company_id: input.companyId,
      name: input.name,
      email: input.email,
      phone: input.phone,
      address: input.address,
      tags: input.tags ?? []
    });
  }

  async softDelete(companyId: string, id: string) {
    return this.client
      .from("customers")
      .update({ deleted_at: new Date().toISOString() })
      .eq("company_id", companyId)
      .eq("id", id);
  }
}
