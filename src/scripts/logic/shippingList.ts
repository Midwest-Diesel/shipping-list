import * as XLSX from 'xlsx';
import { formatDate, formatShippingListWeightDims } from '../tools/stringUtils';
import { handleError } from '../tools/utils';


export const exportShippingList = async (sections: ShippingListSection[], date: Date): Promise<{ path: string, name: string } | null> => {
  try {
    const workbook = XLSX.utils.book_new();
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const sectionOrder: (string | null)[] = [null, 'Fedex Small Pak', 'Misc', 'Will Call', 'Truck Lines'];
    const monday = new Date(date);
    const day = monday.getDay();
    monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1));

    days.forEach((dayName, index) => {
      const sheetDate = new Date(monday);
      sheetDate.setDate(monday.getDate() + index);

      const headers = [
        'Inits:',
        'Ship Via:',
        'Customer:',
        'Attn To:',
        'Part #:',
        'Description:',
        'Stock #:',
        'Location:',
        'MP:',
        'BR:',
        'CAP:',
        'FL:',
        'Attn To: ',
        'Pulled:',
        'Packaged:',
        'Gone:',
        'Ready:',
        'Weight/Dims:',
        'Handwritten ID:',
        'Scheduled:'
      ];

      const rows: unknown[][] = [
        ['Shipping List', dayName, formatDate(sheetDate)],
        headers
      ];

      sectionOrder.forEach((sectionName) => {
        if (sectionName !== null) {
          rows.push([]);
          rows.push([sectionName]);
        }

        sections
          .filter((section) => section.name === sectionName)
          .flatMap((section) => section.rows)
          .filter((row) =>
            String(row.date).slice(0, 10) === formatISODate(sheetDate)
          )
          .forEach((row) => {
            rows.push([
              row.createdBy,
              row.shipVia,
              row.customer,
              row.shipToContact,
              row.partNum,
              row.desc,
              row.stockNum,
              row.location,
              row.mp || '',
              row.br || '',
              row.cap || '',
              row.fl || '',
              row.marketingContact,
              row.pulled,
              row.packaged,
              row.gone,
              row.ready,
              formatShippingListWeightDims(row.weightDims),
              row.handwrittenId,
              row.scheduled,
              row.isBlind,
              row.isMissingPartPhotos,
              row.awaitingPayment,
              row.isComplete
            ]);
          });
      });

      const worksheet = XLSX.utils.aoa_to_sheet(rows);
      XLSX.utils.book_append_sheet(workbook, worksheet, dayName);
    });

    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);

    const start = formatMonthDay(monday);
    const end = formatMonthDay(friday);
    const year = date.getFullYear();
    const path = `\\\\MWD1-SERVER\\Server\\ShippingListFiles\\${year}`;
    const name = `shippinglist_${start}-${end}-${year}.xlsx`;

    await XLSX.writeFile(workbook, name);
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { path, name };
  } catch (error) {
    handleError(error, 'exportShippingList');
    return null;
  }
};

const formatMonthDay = (date: Date) => {
  return `${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
};

const formatISODate = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export const getRowClasses = (row: ShippingListRow): string => {
  const classes = ['shipping-list-row'];
  if (row.awaitingPayment) classes.push('shipping-list-row--awaiting-payment');
  if (row.isBlind) classes.push('shipping-list-row--blind');
  if (row.isMissingPartPhotos) classes.push('shipping-list-row--missing-photos');
  if (row.isComplete) classes.push('shipping-list-row--complete');
  return classes.join(' ');
};
