import { freightCarriersAtom } from "@/scripts/atoms/state";
import { getAllFreightCarriers } from "@/scripts/services/freightCarriersService";
import { useAtom } from "jotai";
import { useEffect } from "react";


export default function useFreightCarriers() {
  const [freightCarriers, setFreightCarriers] = useAtom<FreightCarrier[]>(freightCarriersAtom);

  useEffect(() => {
    const fetchData = async () => {
      if (freightCarriers.length === 0) setFreightCarriers(await getAllFreightCarriers());
    };
    fetchData();
  }, [freightCarriers]);


  return { freightCarriers };
}
