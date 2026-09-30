import api from "../config/axios";
import { handleError } from "../tools/utils";


// === GET routes === //

export const getPartInfoByPartNum = async (partNum: string | null): Promise<PartInfo | null> => {
  try {
    if (!partNum) return null;
    const res = await api.get(`/api/parts/parts-info/part-num/${partNum}`);
    return res.data ? res.data : null;
  } catch (error) {
    handleError(error, 'getPartInfoByPartNum');
    return null;
  }
};

// === PATCH routes === //

export const editWeightDims = async (partNum: string, weightDims: string) => {
  try {
    await api.patch('/api/parts/parts-info/weight-dims', { partNum, weightDims });
  } catch (error) {
    handleError(error, 'editWeightDims');
  }
};
