import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";
import { apiClient, type components } from "@/shared/api";

export type Owner = components["schemas"]["Owner"];
export type UpdateOwnerRequest = components["schemas"]["UpdateOwnerRequest"];

function isOwner(v: unknown): v is Owner {
  return typeof v === "object" && v !== null && "id" in v && "email" in v;
}

type Options = Omit<UseQueryOptions<Owner>, "queryKey" | "queryFn">;

export function useOwner(options?: Options) {
  return useQuery({
    queryKey: ["owner"],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/api/v1/admin/owner", {});
      if (error) throw error;
      if (!data || !isOwner(data)) throw new Error("Failed to load owner");
      return data;
    },
    ...options,
  });
}

export function useUpdateOwner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpdateOwnerRequest) => {
      const { data, error, response } = await apiClient.PUT("/api/v1/admin/owner", { body });
      const status = response.status;
      if (error) {
        throw new Error((error as components["schemas"]["ErrorResponse"]).message ?? "Failed to update owner");
      }
      void status;
      if (!data || !isOwner(data)) throw new Error("Failed to update owner");
      return data;
    },
    onSuccess: (owner) => qc.setQueryData(["owner"], owner),
  });
}