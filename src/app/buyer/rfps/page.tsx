import { BuyerListPage } from "@/components/rfx/buyer-list-page";

export default function BuyerRfpsPage() {
  return (
    <BuyerListPage
      type="RFP"
      title="My RFPs"
      description="Request for Proposal — structured proposals with scoring criteria"
      createHref="/buyer/rfps/new"
      basePath="/buyer/rfps"
    />
  );
}
