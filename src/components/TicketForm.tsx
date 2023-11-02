import { Button, Stack, TextField } from '@mui/material';
import { ChangeEvent, FormEvent, useCallback, useId, useState } from 'react';
import useTicket from '../hooks/ticket';

export default function TicketForm() {
    const { addTicket } = useTicket();
    const [ticket, setTicket] = useState('');
    const id = useId();

    const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setTicket(event.target.value);
    }, []);

    const handleSubmit = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            if (ticket) {
                addTicket(ticket);
            }
            setTicket('');
        },
        [addTicket, ticket]
    );

    return (
        <Stack
            direction="row"
            sx={{ py: 2 }}
            spacing={1}
            component="form"
            noValidate
            autoComplete="off"
            onSubmit={handleSubmit}
        >
            <TextField
                id={id}
                label="チケット"
                variant="outlined"
                sx={{ width: 320 }}
                value={ticket}
                onChange={handleChange}
            />
            <Button type="submit" variant="contained">
                追加
            </Button>
        </Stack>
    );
}
