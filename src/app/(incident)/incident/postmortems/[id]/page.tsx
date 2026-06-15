import PostmortemDetailPage from "@/components/postmortems/PostmortemDetails";
import React from "react";

const page = ({ params }: { params: { id: string } }) => {
  return <PostmortemDetailPage incidentId={params.id} />;
};

export default page;
