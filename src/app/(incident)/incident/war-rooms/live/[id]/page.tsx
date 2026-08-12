"use client";

import { useParams } from "next/navigation";
import LiveWarRoom from "./_modules/components/LiveWarRoom";

export default function Page() {
  const params = useParams();
  const id = params.id as string;
  return <LiveWarRoom incidentId={id} />;
}
