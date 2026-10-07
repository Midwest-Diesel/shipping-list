import api from "../config/axios";
import { socket } from "../config/websockets";
import { formatWeightDims, parseResDate, parseWeightDims } from "../tools/stringUtils";
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

export const getIncomingRow = async (params: { received: boolean, page: number, limit: number }): Promise<{ pageCount: number, rows: IncomingRow[] }> => {
  try {
    const res = await api.get('/api/shipping-list/incoming', { params: { ...params, offset: (params.page - 1) * params.limit } });
    const rows = res.data.rows.map((row: any) => ({ ...row, date: parseResDate(row.date), estimatedDeliveryDate: parseResDate(row.estimatedDeliveryDate) }));
    return { pageCount: res.data.pageCount, rows };
  } catch (error) {
    handleError(error, 'getIncomingRow');
    return { pageCount: 0, rows: [] };
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

export const addIncomingRow = async () => {
  try {
    await api.post('/api/shipping-list/incoming', { socketId: socket.id });
  } catch (error) {
    handleError(error, 'addIncomingRow');
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

export const editIncomingRow = async (row: IncomingRow, field: keyof IncomingRow) => {
  try {
    await api.put('/api/shipping-list/incoming', { ...row, field, socketId: socket.id });
  } catch (error) {
    handleError(error, 'editIncomingRow');
  }
};

export const editShippingListOrder = async (rows: { id: number, order: number }[]) => {
  try {
    await api.put('/api/shipping-list/order', { rows, socketId: socket.id });
  } catch (error) {
    handleError(error, 'editShippingListOrder');
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

export const deleteIncomingRow = async (id: number) => {
  try {
    const params = { id, socketId: socket.id };
    await api.delete('/api/shipping-list/incoming', { params });
  } catch (error) {
    handleError(error, 'deleteIncomingRow');
  }
};
