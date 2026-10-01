import { Button } from "@midwest-diesel/mwd-ui";
import { Dialog } from "@midwest-diesel/mwd-ui";
import { Input } from "@midwest-diesel/mwd-ui";
import { editShippingList } from "@/scripts/services/shippingListService";
import { parseDateInputValue } from "@/scripts/tools/stringUtils";
import { useEffect, useState } from "react";

interface Props {
  row: ShippingListRow
  setRow: (value: ShippingListRow | null) => void
  refetch: () => void
}


export default function MoveShippingListRowDialog({ row, setRow, refetch }: Props) {
  const [date, setDate] = useState<Date | null>(null);
  
  useEffect(() => {
    setDate(new Date(row.date));
  }, [row]);

  const onClickConfirm = async () => {
    if (!date) return;
    await editShippingList({ ...row, date }, 'date');
    refetch();
    setRow(null);
  };

  const onClickCancel = () => {
    setRow(null);
  };


  return (
    <Dialog
      title="Move Row"
      open={!!row}
      setOpen={() => setRow(null)}
    >
      <Input
        label="Date"
        variant={['small', 'thin', 'label-bold', 'label-stack']}
        value={parseDateInputValue(date)}
        onChange={(e) => setDate(new Date(e.target.value))}
        type="date"
      />

      <div className="form__footer">
        <Button variant={['red-color']} onClick={onClickCancel}>Cancel</Button>
        <Button onClick={onClickConfirm}>Confirm</Button>
      </div>
    </Dialog>
  );
}
