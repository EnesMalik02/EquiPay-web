import { useQuery } from "@tanstack/react-query";
import { expenseApi } from "../api/expenseApi";

export const useRecentExpenses = (limit = 10) =>
    useQuery({
        queryKey: ["expenses", "recent", limit],
        queryFn: () => expenseApi.getRecent(limit),
    });
