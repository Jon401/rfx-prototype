"use client";

import { use, useState } from "react";
import { LinkButton } from "@/components/ui/link-button";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge, TypeBadge } from "@/components/rfx/rfx-badges";
import { SupplierSubmissionForm } from "@/components/supplier/submission-form";
import {
  useStore,
} from "@/lib/store";
import { formatDate, formatRelative } from "@/lib/format";
import { isRfxLive } from "@/lib/rfx-workflow";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function SupplierSolicitationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const state = useStore();
  const rfx = state.rfxRecords.find((r) => r.id === id);
  const currentUserId = useStore((s) => s.currentUserId);
  const users = useStore((s) => s.users);
  const qaThreadsAll = useStore((s) => s.qaThreads);
  const invitationsAll = useStore((s) => s.invitations);
  const notificationsAll = useStore((s) => s.notifications);
  const askQuestion = useStore((s) => s.askQuestion);
  const respondInvitation = useStore((s) => s.respondInvitation);
  const markNotificationRead = useStore((s) => s.markNotificationRead);

  const [question, setQuestion] = useState("");

  if (!rfx) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Solicitation not found</p>
        <LinkButton href="/supplier/solicitations" variant="link" className="mt-2">
          Back to dashboard
        </LinkButton>
      </div>
    );
  }

  const qaThreads = qaThreadsAll.filter(
    (q) => q.rfxId === id && (q.supplierId === currentUserId || q.isPublic)
  );
  const myQa = qaThreadsAll.filter(
    (q) => q.rfxId === id && q.supplierId === currentUserId
  );
  const notifications = notificationsAll
    .filter((n) => n.userId === currentUserId && n.rfxId === id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const invitation = invitationsAll.find(
    (i) => i.rfxId === id && i.supplierId === currentUserId
  );
  const buyer = users.find((u) => u.id === rfx.buyerId);
  const isLive = isRfxLive(rfx);
  const isClosed = rfx.status === "closed" || rfx.status === "awarded";

  const handleAsk = () => {
    if (!question.trim()) return;
    askQuestion(id, currentUserId, question);
    toast.success("Question submitted");
    setQuestion("");
  };

  const handleInvitation = (status: "accepted" | "declined") => {
    if (!invitation) return;
    respondInvitation(invitation.id, status);
    toast.success(status === "accepted" ? "Invitation accepted" : "Invitation declined");
  };

  return (
    <div>
      <LinkButton href="/supplier/solicitations" variant="ghost" size="sm" className="mb-4 -ml-2">
          <ArrowLeft className="mr-1.5 h-4 w-4" /> My Solicitations
        </LinkButton>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <TypeBadge type={rfx.type} />
          <StatusBadge rfx={rfx} state={state} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{rfx.title}</h1>
        <p className="text-muted-foreground">{rfx.description}</p>
        <p className="text-sm text-muted-foreground">
          Due {formatDate(rfx.dueDate)} · {buyer?.organization}
        </p>
      </div>

      {invitation?.status === "pending" && (
        <Card className="mt-4 stim-surface-banner-warning">
          <CardContent className="flex items-center justify-between py-4">
            <p className="text-sm font-medium">You have a pending invitation</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleInvitation("declined")}>
                Decline
              </Button>
              <Button size="sm" onClick={() => handleInvitation("accepted")}>
                Accept
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="qa">Ask a Question</TabsTrigger>
          <TabsTrigger value="submit">Submit Response</TabsTrigger>
          <TabsTrigger value="notifications">
            Notifications
            {notifications.filter((n) => !n.read).length > 0 && (
              <Badge className="ml-1.5 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {notifications.filter((n) => !n.read).length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm">{rfx.description}</p>
              <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                <p>Type: {rfx.type}</p>
                <p>Status: {rfx.status}</p>
                <p>Due: {formatDate(rfx.dueDate)}</p>
                <p>Buyer: {buyer?.name} ({buyer?.organization})</p>
              </div>
            </CardContent>
          </Card>

          {qaThreads.length > 0 && (
            <div>
              <h3 className="font-medium text-sm mb-3">Public Q&A</h3>
              {qaThreads
                .filter((q) => q.isPublic && q.answer)
                .map((qa) => (
                  <Card key={qa.id} className="mb-2">
                    <CardContent className="pt-4 space-y-2">
                      <p className="text-sm font-medium">{qa.question}</p>
                      <p className="text-sm text-muted-foreground">{qa.answer}</p>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="qa" className="mt-4 space-y-4">
          {!isLive ? (
            <p className="text-muted-foreground text-sm py-8 text-center">
              Q&amp;A will open when the buyer opens this solicitation.
            </p>
          ) : (
          <div className="space-y-3 max-w-lg">
            <Textarea
              placeholder="Type your question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              disabled={isClosed}
            />
            <Button onClick={handleAsk} disabled={isClosed}>
              Submit Question
            </Button>
          </div>
          )}

          {myQa.length > 0 && (
            <div className="space-y-3 mt-6">
              <h3 className="font-medium text-sm">Your Questions</h3>
              {myQa.map((qa) => (
                <Card key={qa.id}>
                  <CardContent className="pt-4 space-y-2">
                    <p className="text-sm">{qa.question}</p>
                    {qa.answer ? (
                      <div className="rounded-md bg-muted p-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Answer</p>
                        <p className="text-sm">{qa.answer}</p>
                      </div>
                    ) : (
                      <Badge variant="outline">Awaiting answer</Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="submit" className="mt-4">
          {!isLive ? (
            <p className="text-muted-foreground text-sm py-8 text-center">
              Submissions open when the buyer publishes and invites suppliers.
            </p>
          ) : invitation?.status !== "accepted" ? (
            <p className="text-muted-foreground text-sm py-8 text-center">
              Accept the invitation to submit your response.
            </p>
          ) : (
            <SupplierSubmissionForm rfx={rfx} supplierId={currentUserId} />
          )}
        </TabsContent>

        <TabsContent value="notifications" className="mt-4 space-y-3">
          {notifications.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">No notifications.</p>
          ) : (
            notifications.map((n) => (
              <Card
                key={n.id}
                className={n.read ? "opacity-60" : ""}
                onClick={() => markNotificationRead(n.id)}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{n.title}</p>
                      <p className="text-muted-foreground text-sm mt-0.5">{n.message}</p>
                    </div>
                    <span className="text-muted-foreground text-xs shrink-0">
                      {formatRelative(n.createdAt)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
