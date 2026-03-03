import { GroupPage } from "@/views/group";

interface GroupDetailRouteProps {
    params: Promise<{ groupId: string }>;
}

export default async function GroupDetailRoute({ params }: GroupDetailRouteProps) {
    const { groupId } = await params;
    return <GroupPage groupId={groupId} />;
}
