import { useEffect, useState } from "react";
import { Table } from "hds-react";
import { format } from "date-fns";
import { EventName } from "./types";

const nameMap: { [key in EventName]: string } = {
  OPENING_HOURS_UPDATED: "Aukiolot päivitetty",
  AUTO_VERIFICATION_UNSUPPORTED: "Toimpistettä ei saatu vahvistettua",
  LOCATION_CLAIMED: "Toimipiste vaatii omistajuuden siirtoa",
  LOCATION_CREATED: "Toimipiste luotu onnistuneesti",
  MULTIPLE_LOCATIONS_FOUND: "Löytyi useampi toimipiste",
};

const formatDate = (date: string): string =>
  format(new Date(date), "d.M.yyyy h.mm");

const cols = [
  {
    key: "created_at",
    headerName: "Päivämäärä",
    transform: ({ created_at }: any) => formatDate(created_at),
  },
  {
    key: "location",
    headerName: "Toimipiste",
    transform: ({ location }: any) => location.name,
  },
  {
    key: "name",
    headerName: "Tila",
    transform: ({ name }: { name: EventName }) => {
      return nameMap[name] ?? name;
    },
  },
];

const Events = () => {
  const [events, setEvents] = useState<any>([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/api/event");
      const result = await response.json();
      setEvents(result);
    };

    fetchData();
  }, []);

  return <Table cols={cols} rows={events} indexKey="id" />;
};

export default Events;
