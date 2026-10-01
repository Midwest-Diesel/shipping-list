import api from "../config/axios";
import { handleError } from "../tools/utils";


// === GET routes === //

export const getAllFreightCarriers = async () => {
  try {
    const res = await api.get('/api/freight-carriers');
    return res.data;
  } catch (error) {
    handleError(error, 'getAllFreightCarriers');
  }
};
