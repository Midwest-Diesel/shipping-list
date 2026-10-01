import { atom } from "jotai";

const user = {
  id: null,
  username: null
} as any;

export const userAtom = atom<User>(user);
export const tooltipAtom = atom<string>('');
export const shippingListWeekAtom = atom<'Current' | 'Next'>('Current');
export const shippingListDayAtom = atom(new Date());
export const freightCarriersAtom = atom<FreightCarrier[]>([]);
