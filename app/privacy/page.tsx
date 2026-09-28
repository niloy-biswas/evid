import type { Metadata } from "next";
import {
  LEGAL_UPDATED,
  LegalPage,
  SupportEmailLink,
  type LegalSection,
} from "@/components/legal/legal-page";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${BRAND.name} handles account data, chat history, and warehouse credentials.`,
  alternates: { canonical: "/privacy" },
};

const SECTIONS: LegalSection[] = [
  {
    heading: "What we collect",
    body: (
      <>
        <p>
          <strong className="text-foreground">Account data.</strong> Your name, email address, and
          sign-in details, provided through email and password or Google sign-in.
        </p>
        <p>
          <strong className="text-foreground">Usage content.</strong> The questions you ask, the
          answers returned, and the sessions and reactions saved with them.
        </p>
        <p>
          <strong className="text-foreground">Workspace configuration.</strong> Dashboards,
          business rules, approved table lists, and data source settings that administrators
          enter.
        </p>
        <p>
          <strong className="text-foreground">Credentials.</strong> Warehouse credentials and AI
          provider keys that administrators add. These are encrypted at rest.
        </p>
        <p>
          <strong className="text-foreground">Demo requests.</strong> Details you send when you
          book a demo or email us.
        </p>
      </>
    ),
  },
  {
    heading: "Your warehouse data",
    body: (
      <p>
        {BRAND.name} runs queries against the warehouse you connect. We do not copy your
        warehouse tables into our own storage. Query results are used to generate the answer you
        see and may be included in the saved conversation.
      </p>
    ),
  },
  {
    heading: "AI providers",
    body: (
      <p>
        To answer a question, your question, the applied business context, and the query results
        needed for the answer are sent to the AI model provider configured for your workspace.
        Each provider handles that data under its own terms.
      </p>
    ),
  },
  {
    heading: "How we use data",
    body: (
      <p>
        To run the service, authenticate users, show saved conversations, support your team,
        secure the product, and respond to your requests. We do not sell personal data.
      </p>
    ),
  },
  {
    heading: "Service providers",
    body: (
      <p>
        We rely on infrastructure providers for hosting, database storage, authentication, and
        AI model access. They process data only to provide those services to us.
      </p>
    ),
  },
  {
    heading: "Retention and deletion",
    body: (
      <p>
        We keep data while your account or workspace is active. Ask us to delete your account or
        workspace data at <SupportEmailLink /> and we will act on it within a reasonable time, subject to any
        legal obligations.
      </p>
    ),
  },
  {
    heading: "Security",
    body: (
      <p>
        Stored credentials are encrypted. Access to workspace features is controlled by roles.
        No system is perfectly secure, so we cannot guarantee absolute security.
      </p>
    ),
  },
  {
    heading: "Your choices",
    body: (
      <p>
        You can ask to access, correct, or delete your personal data by writing to <SupportEmailLink />.
      </p>
    ),
  },
  {
    heading: "Changes and contact",
    body: (
      <p>
        We may update this policy and will change the date above when we do. Questions:{" "}
        <SupportEmailLink />.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return <LegalPage title="Privacy Policy" updated={LEGAL_UPDATED} sections={SECTIONS} />;
}
