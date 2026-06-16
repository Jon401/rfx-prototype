import { BuyerListPage } from "@/components/rfx/buyer-list-page";

export default function BuyerRfisPage() {
  return (
    <BuyerListPage
      type="RFI"
      title="My RFIs"
      description="Request for Information — gather market intelligence via questionnaires"
      createHref="/buyer/rfis/new"
      basePath="/buyer/rfis"
    />
  );
}
