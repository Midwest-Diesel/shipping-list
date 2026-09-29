import * as XLSX from 'xlsx';
import { formatDate, getDay } from '../tools/stringUtils';
import { handleError } from '../tools/utils';


export const exportShippingList = async (sections: ShippingListSection[], date: Date): Promise<{ path: string, name: string } | null> => {
  try {
    const rows = sections.flatMap((section) =>
      section.rows.map((row) => ({
        'Inits:': row.createdBy,
        'Ship Via:': row.shipVia,
        'Customer:': row.customer,
        'Attn To:': row.shipToContact,
        'Part #:': row.partNum,
        'Description:': row.desc,
        'Stock #:': row.stockNum,
        'Location:': row.location,
        'MP:': row.mp,
        'BR:': row.br,
        'CAP:': row.cap,
        'FL:': row.fl,
        'Attn To: ': row.marketingContact,
        'Pulled:': row.pulled,
        'Packaged:': row.packaged,
        'Gone:': row.gone,
        'Ready:': row.ready,
        'Weight/Dims:': row.weightDims,
        'Handwritten ID:': row.handwrittenId,
        'Scheduled:': row.scheduled
      }))
    );

    const worksheet = XLSX.utils.aoa_to_sheet([]);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.sheet_add_aoa(worksheet, [
      ['Shipping List', getDay(date), formatDate(date)]
    ], { origin: 'A1' });

    XLSX.utils.sheet_add_json(worksheet, rows, { origin: 'A2' });
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Monday');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([]), 'Tuesday');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([]), 'Wednesday');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([]), 'Thursday');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([]), 'Friday');

    const monday = new Date(date);
    const day = monday.getDay();
    monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1));
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);

    const start = formatMonthDay(monday);
    const end = formatMonthDay(friday);
    const year = date.getFullYear();
    const path = `\\\\MWD1-SERVER\\Server\\ShippingListFiles\\${year}`;
    const name = `shippinglist_${start}-${end}-${year}.xlsx`;

    await XLSX.writeFile(workbook, name);
    await new Promise(resolve => setTimeout(resolve, 500));
    return { path, name };
  } catch (error) {
    handleError(error, 'exportShippingList');
    return null;
  }
};

const formatMonthDay = (date: Date) => {
  return `${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
};

export const getRowClasses = (row: ShippingListRow): string => {
  const classes = ['shipping-list-row'];
  if (row.awaitingPayment) classes.push('shipping-list-row--awaiting-payment');
  if (row.isBlind) classes.push('shipping-list-row--blind');
  if (row.isMissingPartPhotos) classes.push('shipping-list-row--missing-photos');
  if (row.isComplete) classes.push('shipping-list-row--complete');
  return classes.join(' ');
};
