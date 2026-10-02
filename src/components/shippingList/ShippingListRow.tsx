import { useEffect, useState } from "react";
import { getRowClasses } from "@/scripts/logic/shippingList";

interface Props {
  row: ShippingListRow
}


export default function ShippingListRow({ row }: Props) {
  const [className, setClassName] = useState('shipping-list-row');

  useEffect(() => {
    setClassName(getRowClasses(row));
  }, [row]);


  return (
    <tr className={className}>
      <td>{ row.createdBy }</td>
      <td className={row.shipVia === 'UPS Red' ? 'shipping-list-row--ups-red' : ''}>
        { row.shipVia }
      </td>
      <td>{ row.customer }</td>
      <td>{ row.shipToContact }</td>
      <td>{ row.partNum }</td>
      <td>{ row.desc }</td>
      <td>{ row.stockNum }</td>
      <td>{ row.location }</td>
    </tr>
  );
}
