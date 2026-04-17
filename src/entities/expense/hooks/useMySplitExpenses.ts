import { useQuery } from "@tanstack/react-query";
import { expenseApi } from "../api/expenseApi";

export const useMySplitExpenses = () =>
    useQuery({
        queryKey: ["expenses", "my-splits"],
        queryFn: () => expenseApi.getMySplits(),
    });
