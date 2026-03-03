import { CreateExpensePage } from "@/views/create-expense";

interface Props {
    params: Promise<{ groupId: string }>;
}

export default async function CreateExpenseRoute({ params }: Props) {
    const { groupId } = await params;
    return <CreateExpensePage groupId={groupId} />;
}
