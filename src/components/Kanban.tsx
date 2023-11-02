import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Paper, Typography } from '@mui/material';
import { KanbanStatus } from '../types/Kanban';
import { Ticket } from '../types/Ticket';

interface Props {
    status: KanbanStatus;
    items: Ticket[];
    children: React.ReactNode;
}

export default function Kanban(props: Props) {
    const { isOver, setNodeRef } = useDroppable({ id: props.status });

    return (
        <Paper
            ref={setNodeRef}
            variant="outlined"
            sx={{
                p: 2,
                backgroundColor: isOver ? 'grey.300' : undefined,
                flexGrow: 1,
                minHeight: '100%',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <Typography variant="h6" component="h3">
                {props.status}
            </Typography>
            <SortableContext items={props.items} strategy={verticalListSortingStrategy}>
                {props.children}
            </SortableContext>
        </Paper>
    );
}
