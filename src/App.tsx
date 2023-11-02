import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    closestCenter,
} from '@dnd-kit/core';
import { Container, CssBaseline, Stack } from '@mui/material';
import React, { useCallback, useState } from 'react';
import Kanban from './components/Kanban';
import SortableTicket from './components/SortableTicket';
import Ticket from './components/Ticket';
import TicketForm from './components/TicketForm';
import useTicket from './hooks/ticket';
import { KanbanTickets } from './providers/DataProvider';
import { KanbanStatus, KanbanStatuses, isKanbanStatus } from './types/Kanban';
import { Ticket as TicketProps } from './types/Ticket';

interface FindTicketResponse {
    status: KanbanStatus;
    ticket: TicketProps;
    index: number;
}

/**
 * チケットの id をもとにチケットを探す
 * @param tickets
 * @param ticketId
 * @returns
 */
function findTicket(tickets: KanbanTickets, ticketId: string): FindTicketResponse | undefined {
    for (const status of KanbanStatuses) {
        const index = tickets[status].findIndex((ticket) => ticket.id === ticketId);
        if (index !== -1) {
            return {
                status,
                ticket: tickets[status][index],
                index,
            };
        }
    }
}

export default function App() {
    const { tickets, moveTicket } = useTicket();
    // ドラッグ中のチケット
    const [draggingTicket, setDraggingTicket] = useState<TicketProps>();

    /**
     * ドラッグ開始時にドラッグ中のチケットを取得する
     */
    const handleDragStart = useCallback(
        (event: DragStartEvent) => {
            const { active } = event;
            if (typeof active.id === 'string') {
                const data = findTicket(tickets, active.id);
                if (data) {
                    setDraggingTicket(data.ticket);
                }
            }
        },
        [tickets]
    );

    /**
     * ドラッグ完了時に発生するイベント
     */
    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;
            // ドラッグ中のチケットをクリア
            setDraggingTicket(undefined);

            if (over === null) {
                // ドラッグ先の要素がなければ終了
                return;
            }

            const overId = over.id;
            const ticketId = active.id;

            if (typeof ticketId === 'string') {
                if (isKanbanStatus(overId)) {
                    // 衝突要素の id がステータスの場合はカンバン間の移動
                    moveTicket(overId, ticketId);
                } else if (typeof overId === 'string') {
                    // 衝突要素がチケットの場合
                    // id からチケットを探す
                    const activeTicket = findTicket(tickets, ticketId);
                    const overTicket = findTicket(tickets, overId);

                    if (activeTicket && overTicket) {
                        if (activeTicket.status === overTicket.status) {
                            // 同じステータス内での移動
                            moveTicket(activeTicket.status, activeTicket.index, overTicket.index);
                        } else {
                            // 異なるステータス間での移動
                            moveTicket(overTicket.status, ticketId, overTicket.index);
                        }
                    }
                }
            }
        },
        [moveTicket, tickets]
    );

    return (
        <>
            <CssBaseline />
            <Container component="main" maxWidth="xl">
                <TicketForm />
                <DndContext
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <Stack
                        direction="row"
                        sx={{ minHeight: 'calc(100dvh - 110px)' }}
                        spacing={2}
                        alignItems="stretch"
                    >
                        {KanbanStatuses.map((status) => (
                            <Kanban key={status} status={status} items={tickets[status]}>
                                {tickets[status].map((ticket) => (
                                    <React.Fragment key={ticket.id}>
                                        {/* ドラッグ中のチケットはリストから非表示とする */}
                                        {ticket.id !== draggingTicket?.id && (
                                            <SortableTicket {...ticket} />
                                        )}
                                    </React.Fragment>
                                ))}
                            </Kanban>
                        ))}
                    </Stack>
                    {/* SortableContext をまたがるドラッグを行う場合、DragOverlay を使用しないと表示が崩れる */}
                    <DragOverlay>{draggingTicket && <Ticket {...draggingTicket} />}</DragOverlay>
                </DndContext>
            </Container>
        </>
    );
}
