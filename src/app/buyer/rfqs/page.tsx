import { BuyerListPage } from "@/components/rfx/buyer-list-page";

export default function BuyerRfqsPage() {
  return (
    <BuyerListPage
      type="RFQ"
      title="My RFQs"
      description="Request for Quotation — collect pricing on line items"
      createHref="/buyer/rfqs/new"
      basePath="/buyer/rfqs"
    />
  );
}
