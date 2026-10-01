import { useEffect, useState } from "react";
import { Button, Dialog, Input, Select, Table } from "@midwest-diesel/mwd-ui";
import useAutoSave from "@/hooks/useAutoSave";
import { confirm } from "@/scripts/config/tauri";
import { useQuery } from "@tanstack/react-query";
import { getPartInfoByPartNum } from "@/scripts/services/partsService";
import { parseWeightDims } from "@/scripts/tools/stringUtils";

interface Props {
  row: ShippingListRow
  setRow: (value: number | null) => void
  onEditPartWeightDims: (partNum: string, weightDims: WeightDims[]) => Promise<void>
}


export default function EditPartWeightDimsDialog({ row, setRow, onEditPartWeightDims }: Props) {
  const { data: partInfo } = useQuery<PartInfo | null>({
    queryKey: ['partInfo', row.partNum],
    queryFn: () => getPartInfoByPartNum(row.partNum)
  });

  const [weightDims, setWeightDims] = useState<WeightDims[]>([]);

  useEffect(() => {
    if (!partInfo) return;
    setWeightDims(partInfo.weightDims ? parseWeightDims(partInfo.weightDims) : []);
  }, [partInfo]);

  useAutoSave(weightDims, async () => {
    const newWeightDims = weightDims.map((r) => ({ ...r, lbs: Number(r.lbs), length: Number(r.length) }));
    await onEditPartWeightDims(row.partNum!, newWeightDims);
  }, { delay: 0, ignoreFirstSave: true });

  const onChange = (i: number, field: keyof typeof weightDims[number], value: string | number) => {
    setWeightDims((prev) => prev.map((r, index) => {
      return index === i ? { ...r, [field]: value } : r;
    }));
  };

  const onClickAddRow = async () => {
    setWeightDims((prev) => [
      ...prev,
      { type: 'Small Pack', qty: 1, lbs: 0, length: 0, width: 0, height: 0 }
    ]);
  };

  const onClickRemoveRow = async (i: number) => {
    if (!await confirm('Delete row?')) return;
    setWeightDims((prev) => prev.filter((_, index) => index !== i))
  };

 
  return (
    <Dialog
      title={`Part ${row.partNum!}`}
      open={!!row}
      setOpen={() => setRow(null)}
      width={600}
    >
      <h4>Handwritten { row.handwrittenId }</h4>
      <Table>
        <thead>
          <tr>
            <th>Qty</th>
            <th>Type</th>
            <th>Lbs</th>
            <th>Length</th>
            <th>Width</th>
            <th>Height</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {weightDims.map((r, i) => {
            return (
              <tr key={i}>
                <td>
                  <Input
                    variant={['no-arrows']}
                    value={r.qty}
                    type="number"
                    onChange={(e) => onChange(i, 'qty', e.target.value)}
                  />
                </td>

                <td>
                  <Select
                    value={r.type}
                    onChange={(e) => onChange(i, 'type', e.target.value)}
                  >
                    <option>Small Pack</option>
                    <option>LTL</option>
                  </Select>
                </td>

                <td>
                  <Input
                    variant={['no-arrows']}
                    value={r.lbs}
                    type="number"
                    onChange={(e) => onChange(i, 'lbs', e.target.value)}
                  />
                </td>
 
                <td>
                  <Input
                    variant={['no-arrows']}
                    value={r.length}
                    type="number"
                    onChange={(e) => onChange(i, 'length', e.target.value)}
                  />
                </td>
 
                <td>
                  <Input
                    variant={['no-arrows']}
                    value={r.width}
                    type="number"
                    onChange={(e) => onChange(i, 'width', e.target.value)}
                  />
                </td>
 
                <td>
                  <Input
                    variant={['no-arrows']}
                    value={r.height}
                    type="number"
                    onChange={(e) => onChange(i, 'height', e.target.value)}
                  />
                </td>
 
                <td>
                  <Button variant={['danger']} onClick={() => onClickRemoveRow(i)}>
                    <img src="/images/icons/delete.svg" width={14} height={14} draggable={false} />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
 
      <Button onClick={onClickAddRow}>Add</Button>
    </Dialog>
  );
}
