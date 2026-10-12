import * as XLSX from 'xlsx';
import { formatDate, formatShippingListWeightDims } from '../tools/stringUtils';
import { handleError } from '../tools/utils';
import { invoke } from '../config/tauri';
import { getShippingList } from '../services/shippingListService';


export const exportShippingList = async (sections: ShippingListSection[], date: Date): Promise<{ path: string, name: string } | null> => {
  try {
    const workbook = XLSX.utils.book_new();
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const sectionOrder: (string | null)[] = [null, 'UPS', 'Fedex Small Pak', 'Misc', 'Will Call', 'Truck Lines'];
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
    const path = `\\\\MWD1-SERVER\\Server\\ShippingListFiles${import.meta.env.DEV ? '\\development' : ''}\\${year}`;
    const name = `shippinglist_${start}-${end}-${year}.xlsx`;

    await XLSX.writeFile(workbook, name);
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { path, name };
  } catch (error) {
    handleError(error, 'exportShippingList');
    return null;
  }
};

export const backupShippingList = async () => {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  const monday = new Date(date);
  const day = monday.getDay();
  monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1));
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);

  const start = formatMonthDay(monday);
  const end = formatMonthDay(friday);
  const year = date.getFullYear();
  const path = `\\\\MWD1-SERVER\\Server\\ShippingListFiles${import.meta.env.DEV ? '\\development' : ''}\\${year}`;
  const latestBackup = await invoke('get_latest_backup_name', { args: { path }});
  const currentWeek = `shippinglist_${start}-${end}-${year}.xlsx`;
  if (latestBackup === currentWeek) return;
  
  const dates = Array.from({ length: 5 }, (_, index) => {
    const currentDate = new Date(monday);
    currentDate.setDate(monday.getDate() + index);
    return currentDate;
  });

  const sections = (await Promise.all(
    dates.map((date) => getShippingList(date))
  )).flat();

  const res = await exportShippingList(sections, date);
  if (!res) return;

  const args = { name: res.name, path: res.path };
  await invoke('backup_shipping_list', { args });
};

const formatMonthDay = (date: Date) => {
  return `${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
};

const formatISODate = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export const getRowClasses = (row: ShippingListRow): string => {
  const classes = ['shipping-list-row'];
  if (row.shipDocs) classes.push('shipping-list-row--ship-docs');
  if (row.awaitingPayment) classes.push('shipping-list-row--awaiting-payment');
  if (row.isBlind) classes.push('shipping-list-row--blind');
  if (row.isMissingPartPhotos) classes.push('shipping-list-row--missing-photos');
  if (row.isComplete) classes.push('shipping-list-row--complete');
  return classes.join(' ');
};
