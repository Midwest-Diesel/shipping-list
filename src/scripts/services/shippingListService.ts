import api from "../config/axios";
import { socket } from "../config/websockets";
import { formatWeightDims, parseWeightDims } from "../tools/stringUtils";
import { handleError } from "../tools/utils";

interface NewShippingListRow {
  handwrittenId: number | null
  date: Date
  createdBy: string
  shipVia: string
  customer: string
  shipToContact: string | null
  partNum: string | null
  desc: string | null
  stockNum: string | null
  location: string | null
  mp: number
  br: number
  cap: number
  fl: number
  marketingContact: string | null
  pulled: boolean
  packaged: boolean
  gone: boolean
  ready: boolean
  weightDims: string
  scheduled: string | null
  isBlind: boolean
  isMissingPartPhotos: boolean
}


// === GET routes === //

export const getShippingList = async (date: Date): Promise<ShippingListSection[]> => {
  try {
    const params = { date };
    const res = await api.get('/api/shipping-list', { params });
    return res.data.map((d: ShippingListSection) => ({ ...d, rows: d.rows.map((r) => ({ ...r, weightDims: r.weightDims ? parseWeightDims(r.weightDims.toString()) : [] })) }));
  } catch (error) {
    handleError(error, 'getShippingList');
    return [];
  }
};

// === POST routes === //

export const addShippingListRow = async (row: NewShippingListRow): Promise<number | null> => {
  try {
    const res = await api.post('/api/shipping-list', { ...row, socketId: socket.id });
    return Number(res.data.id);
  } catch (error) {
    handleError(error, 'addShippingListRow');
    return null;
  }
};

// === PUT routes === //

export const editShippingList = async (row: ShippingListRow, field: keyof ShippingListRow) => {
  try {
    const payload = { ...row, weightDims: formatWeightDims(row.weightDims) };
    await api.put('/api/shipping-list', { ...payload, field, socketId: socket.id });
  } catch (error) {
    handleError(error, 'editShippingList');
  }
};

// === PATCH routes === //

export const editShippingListRowCompleted = async (handwrittenId: number, isComplete: boolean) => {
  try {
    await api.patch('/api/shipping-list/complete', { handwrittenId, isComplete, socketId: socket.id });
  } catch (error) {
    handleError(error, 'editShippingListRowCompleted');
  }
};

// === DELETE routes === //

export const deleteShippingListRow = async (id: number) => {
  try {
    const params = { id, socketId: socket.id };
    await api.delete('/api/shipping-list', { params });
  } catch (error) {
    handleError(error, 'deleteShippingListRow');
  }
};
