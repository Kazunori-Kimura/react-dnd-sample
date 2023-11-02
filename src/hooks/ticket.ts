import { useContext } from 'react';
import { DataContext } from '../providers/DataProvider';

export default function useTicket() {
    return useContext(DataContext);
}
