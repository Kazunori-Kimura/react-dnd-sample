import { createContext, useCallback, useState } from 'react';
import { uuidv7 as uuid } from 'uuidv7';
import { KanbanStatus, KanbanStatuses } from '../types/Kanban';
import { Ticket } from '../types/Ticket';

/**
 * カンバンのステータスごとにチケットを管理する
 */
export type KanbanTickets = Record<KanbanStatus, Ticket[]>;

/**
 * チケットの移動/並び替え関数
 */
type MoveTicketFunction = {
    (status: KanbanStatus, ticketId: string, index: number): void;
    (status: KanbanStatus, oldIndex: number, newIndex: number): void;
    (status: KanbanStatus, ticketId: string): void;
};

/**
 * カンバンの末尾に移動
 * @param tickets
 * @param status
 * @param ticketId
 * @returns
 */
function moveTicketKanbanTail(
    tickets: KanbanTickets,
    status: KanbanStatus,
    ticketId: string
): KanbanTickets {
    const newTickets = JSON.parse(JSON.stringify(tickets)) as KanbanTickets;

    for (const ks of KanbanStatuses) {
        // 該当チケットを探す
        const index = newTickets[ks].findIndex((ticket) => ticket.id === ticketId);
        if (index !== -1) {
            // 該当チケットを削除
            const [ticket] = newTickets[ks].splice(index, 1);
            // 新しいステータスに追加
            newTickets[status].push(ticket);
            break;
        }
    }

    return newTickets;
}

/**
 * カンバンの指定位置にチケットを挿入
 * @param tickets
 * @param status
 * @param ticketId
 * @param insertOrder
 * @returns
 */
function moveTicketAt(
    tickets: KanbanTickets,
    status: KanbanStatus,
    ticketId: string,
    insertOrder: number
): KanbanTickets {
    const newTickets = JSON.parse(JSON.stringify(tickets)) as KanbanTickets;

    for (const ks of KanbanStatuses) {
        // 該当チケットを探す
        const index = newTickets[ks].findIndex((ticket) => ticket.id === ticketId);
        if (index !== -1) {
            // 該当チケットを削除
            const [ticket] = newTickets[ks].splice(index, 1);
            // 指定位置に挿入
            newTickets[status].splice(insertOrder, 0, ticket);
            break;
        }
    }

    return newTickets;
}

/**
 * チケットの並び替え
 * @param tickets
 * @param status
 * @param oldIndex
 * @param newIndex
 * @returns
 */
function replaceTicket(
    tickets: KanbanTickets,
    status: KanbanStatus,
    oldIndex: number,
    newIndex: number
): KanbanTickets {
    const newTickets = JSON.parse(JSON.stringify(tickets)) as KanbanTickets;

    // 該当チケットを探す
    const [ticket] = newTickets[status].splice(oldIndex, 1);
    // 指定位置に挿入
    newTickets[status].splice(newIndex, 0, ticket);

    return newTickets;
}

interface IDataContext {
    tickets: KanbanTickets;
    addTicket: (ticket: string) => void;
    moveTicket: MoveTicketFunction;
    removeTicket: (ticketId: string) => void;
}

export const DataContext = createContext<IDataContext>(undefined!);

interface Props {
    children: React.ReactNode;
}

/**
 * 初期データ
 */
const emptyTickets: KanbanTickets = {
    New: [],
    Active: [],
    Closed: [],
};

export default function DataProvider(props: Props) {
    const [tickets, setTickets] = useState<KanbanTickets>(emptyTickets);

    /**
     * チケットの追加
     */
    const addTicket = useCallback((ticket: string) => {
        const newTicket: Ticket = {
            id: uuid(),
            title: ticket,
        };

        setTickets((prev) => ({
            ...prev,
            New: [...prev['New'], newTicket],
        }));
    }, []);

    /**
     * チケットの移動
     */
    const moveTicket: MoveTicketFunction = useCallback(
        (status: KanbanStatus, arg2: string | number, arg3?: number) => {
            let newTickets: KanbanTickets | undefined = undefined;

            if (typeof arg2 === 'string') {
                if (typeof arg3 === 'number') {
                    // 指定位置に移動
                    newTickets = moveTicketAt(tickets, status, arg2, arg3);
                } else {
                    // 末尾に移動
                    newTickets = moveTicketKanbanTail(tickets, status, arg2);
                }
            } else if (typeof arg2 === 'number' && typeof arg3 === 'number') {
                // 並び替え
                newTickets = replaceTicket(tickets, status, arg2, arg3);
            }

            if (newTickets) {
                setTickets(newTickets);
            }
        },
        [tickets]
    );

    /**
     * チケットの削除
     */
    const removeTicket = useCallback(
        (ticketId: string) => {
            const newTickets = JSON.parse(JSON.stringify(tickets)) as KanbanTickets;

            for (const ks of KanbanStatuses) {
                // 該当チケットを探す
                const index = newTickets[ks].findIndex((ticket) => ticket.id === ticketId);
                if (index !== -1) {
                    // 該当チケットを削除
                    newTickets[ks].splice(index, 1);
                    break;
                }
            }

            setTickets(newTickets);
        },
        [tickets]
    );

    return (
        <DataContext.Provider
            value={{
                tickets,
                addTicket,
                moveTicket,
                removeTicket,
            }}
        >
            {props.children}
        </DataContext.Provider>
    );
}
