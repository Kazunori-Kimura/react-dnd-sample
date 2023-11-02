export const KanbanStatuses = ['New', 'Active', 'Closed'] as const;
export type KanbanStatus = (typeof KanbanStatuses)[number];

export function isKanbanStatus(item: unknown): item is KanbanStatus {
    if (typeof item === 'string') {
        return KanbanStatuses.some((status) => status === item);
    }
    return false;
}
