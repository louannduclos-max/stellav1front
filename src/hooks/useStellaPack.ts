import { useQuery, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getStellaPack } from "@/lib/stella-pack.functions";

export const stellaPackQueryOptions = (
  id: string,
  fetcher: (args: { data: { id: string } }) => Promise<Awaited<ReturnType<typeof getStellaPack>>>,
) =>
  queryOptions({
    queryKey: ["stella-pack", id],
    queryFn: () => fetcher({ data: { id } }),
    enabled: !!id,
  });

export function useStellaPack(id: string) {
  const fetcher = useServerFn(getStellaPack);
  return useQuery(stellaPackQueryOptions(id, fetcher));
}