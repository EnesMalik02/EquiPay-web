import { ExpenseDetailPage } from "@/views/expense-detail/ui/ExpenseDetailPage";

interface Props {
    params: Promise<{ groupId: string; expenseId: string }>;
}

export default async function ExpenseDetailRoute({ params }: Props) {
    const { groupId, expenseId } = await params;
    return <ExpenseDetailPage groupId={groupId} expenseId={expenseId} />;
}
