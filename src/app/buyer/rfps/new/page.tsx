import { CreateRfpForm } from "@/components/rfx/forms/create-rfp-form";

export default function CreateRfpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create RFP</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Define proposal sections and scoring criteria for vendor evaluation
        </p>
      </div>
      <CreateRfpForm />
    </div>
  );
}
