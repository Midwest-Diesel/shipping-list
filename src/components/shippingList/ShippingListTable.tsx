import { Table } from "@midwest-diesel/mwd-ui";
import ShippingListRow from "./ShippingListRow";
import { Fragment } from "react";

interface Props {
  sections: ShippingListSection[]
}


export default function ShippingListTable({ sections }: Props) {
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
        </tr>
      </thead>
      <tbody>
        {sections.map((section, i) => {
          return (
            <Fragment key={i}>
              <tr className="shipping-list__section">
                { section.name && <th colSpan={20}>{ section.name }</th> }
              </tr>

              {section.rows.map((row) => {
                return (
                  <ShippingListRow key={row.id} row={row} />
                );
              })}
            </Fragment>
          );
        })}
      </tbody>
    </Table>
  );
}
