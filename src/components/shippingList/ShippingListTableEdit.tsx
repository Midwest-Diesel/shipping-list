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
  onReorder: (sectionIndex: number, fromId: number, toId: number) => void
}


export default function ShippingListTableEdit({ sections, onEditRow, editingUser, refetch, setMoveRow, onEditWeightDims, onEditPartWeightDims, onReorder }: Props) {
  const [hoveredWeightDimsId, setHoveredWeightDimsId] = useState<number | null>(null);

  
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
              { i > 0 && <tr className="shipping-list__section-divider"><td colSpan={21}></td></tr> }

              <tr className="shipping-list__section">
                { section.name && <th colSpan={21}>{ section.name }</th> }
              </tr>

              {section.rows.map((row, index) => {
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
                    hoveredWeightDimsId={hoveredWeightDimsId}
                    setHoveredWeightDimsId={setHoveredWeightDimsId}
                    onReorder={(fromId, toId) => onReorder(i, fromId, toId)}
                    previousRow={section.rows[index - 1] ?? null}
                    nextRow={section.rows[index + 1] ?? null}
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
