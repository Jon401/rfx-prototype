import { CreateRfqForm } from "@/components/rfx/forms/create-rfq-form";

export default function CreateRfqPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create RFQ</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Define line items and request pricing from suppliers
        </p>
      </div>
      <CreateRfqForm />
    </div>
  );
}
