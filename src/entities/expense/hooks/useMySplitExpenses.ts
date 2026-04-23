import { useQuery } from "@tanstack/react-query";
import { expenseApi } from "../api/expenseApi";

interface Params {
    limit?: number;
    offset?: number;
    status?: "all" | "pending" | "paid";
}

export const useMySplitExpenses = (params?: Params) =>
    useQuery({
        queryKey: ["expenses", "my-splits", params],
        queryFn: () => expenseApi.getMySplits(params),
    });
