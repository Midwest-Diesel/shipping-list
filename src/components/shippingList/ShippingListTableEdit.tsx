import { Table } from "@midwest-diesel/mwd-ui";
import ShippingListRowEdit from "./ShippingListRowEdit";
import { Fragment, useState } from "react";

interface Props {
  sections: ShippingListSection[]
  onEditRow: (id: number, key: keyof ShippingListRow, value: unknown) => void
  editingUser: { id: number, field: keyof ShippingListRow, user: string } | null
  refetch: () => void
  setMoveRow: (value: ShippingListRow | null) => void
  onEditWeightDims: (id: number) => void
  onEditPartWeightDims: (id: number) => void
}


export default function ShippingListTableEdit({ sections, onEditRow, editingUser, refetch, setMoveRow, onEditWeightDims, onEditPartWeightDims }: Props) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  
  return (
    <Table variant={['plain']}>
      <thead>
        <tr>
          <th>Inits</th>
          <th>Ship Via</th>
          <th>Customer</th>
          <th>Attn To</th>
          <th>Part #</th>
          <th>Description</th>
          <th>Stock #</th>
          <th>Location</th>
          <th>MP</th>
          <th>BR</th>
          <th>CAP</th>
          <th>FL</th>
          <th>Attn To</th>
          <th>Pulled</th>
          <th>Packaged</th>
          <th>Gone</th>
          <th>Ready</th>
          <th>Weight/Dims</th>
          <th>Handwritten</th>
          <th>Scheduled</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {sections.map((section, i) => {
          return (
            <Fragment key={i}>
              <tr className="shipping-list__section">
                { section.name && <th colSpan={21}>{ section.name }</th> }
              </tr>

              {section.rows.map((row) => {
                return (
                  <ShippingListRowEdit
                    key={row.id}
                    row={row}
                    onEditRow={onEditRow}
                    editingUser={editingUser}
                    refetch={refetch}
                    setMoveRow={setMoveRow}
                    onEditWeightDims={onEditWeightDims}
                    onEditPartWeightDims={onEditPartWeightDims}
                    hoveredRow={hoveredRow}
                    setHoveredRow={setHoveredRow}
                  />
                );
              })}
            </Fragment>
          );
        })}
      </tbody>
    </Table>
  );
}
