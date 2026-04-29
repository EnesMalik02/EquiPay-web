import { useQuery } from "@tanstack/react-query";
import { expenseApi } from "../api/expenseApi";

interface Params {
    limit?: number;
    offset?: number;
    status?: "all" | "paid" | "unpaid";
    group_id?: string;
}

const sortByUpdated = (list: import("../model/types").ExpenseWithMySplitResponse[]) =>
    [...list].sort((a, b) => {
        const tA = new Date(a.updated_at ?? a.created_at ?? 0).getTime();
        const tB = new Date(b.updated_at ?? b.created_at ?? 0).getTime();
        return tB - tA;
    });

export const useMySplitExpenses = (params?: Params) =>
    useQuery({
        queryKey: ["expenses", "my-splits", params],
        queryFn: () => expenseApi.getMySplits(params),
        select: sortByUpdated,
    });
