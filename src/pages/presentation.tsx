import { Button } from "@midwest-diesel/mwd-ui";
import ShippingListTable from "../components/shippingList/ShippingListTable";
import { getShippingList } from "@/scripts/services/shippingListService";
import { formatDate, getDay, parseResDate } from "@/scripts/tools/stringUtils";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";


export default function Presentation() {
  const params = new URLSearchParams(window.location.search);
  const date = parseResDate(params.get('date') ?? '') ?? new Date();
  const [zoom, setZoom] = useState(Number(localStorage.getItem('presentation-zoom') || 1));

  const { data: sections = [] } = useQuery<ShippingListSection[]>({
    queryKey: ['sections', date],
    queryFn: () => getShippingList(date)
  });

  const onClickZoomOut = () => {
    const newZoom = Math.max(0.5, zoom - 0.1);
    setZoom(newZoom);
    localStorage.setItem('presentation-zoom', newZoom.toString());
  };

  const onClickZoomIn = () => {
    const newZoom = Math.min(2, zoom + 0.1);
    setZoom(newZoom);
    localStorage.setItem('presentation-zoom', newZoom.toString());
  };


  return (
    <div className="shipping-list shipping-list-presentation">
      <h2 style={{ margin: '0.5rem 0 0.3rem', textAlign: 'center' }}>
        Shipping List ({ getDay(date) } { formatDate(date) })
      </h2>
      
      <div className="shipping-list-presentation__top-left-buttons">
        <Button onClick={onClickZoomOut}>
          <img alt="Zoom out" src="/images/icons/zoom-out.svg" draggable={false} />
        </Button>
        <Button onClick={onClickZoomIn}>
          <img alt="Zoom in" src="/images/icons/zoom-in.svg" draggable={false} />
        </Button>
        <h4>{ Math.round(zoom * 100) }%</h4>
      </div>

      <Button variant={['link', 'red-color']} className="shipping-list-presentation__close-btn">
        <a href="/">X</a>
      </Button>

      <div style={{ zoom }}>
        <ShippingListTable sections={sections} />
      </div>
    </div>
  );
}
