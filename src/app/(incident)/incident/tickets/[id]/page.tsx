"use client";
import { redirect, useParams } from "next/navigation";

const Page = () => {
  const { id } = useParams();
  redirect(`/incident/tickets?id=${id}`);
};

export default Page;
