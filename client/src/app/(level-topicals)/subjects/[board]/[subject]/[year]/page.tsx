import { BackButton } from "@/app/components/BackButton";
import { getApiUrl, isLocalhost } from "@/app/config";
// import QuestionLinks from "./questionLinksPage";
import { Metadata } from "next";
import { resolveViewport } from "next/dist/lib/metadata/resolve-metadata";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    board: string;
    subject: string;
    year: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  return {
    title: `Available papers for  ${decodeURIComponent(
      (await params).subject
    )} at ${decodeURIComponent((await params).year)} | Paper Guides`,

    description: `Explore the available papers for ${decodeURIComponent(
      (await params).subject
    )} at ${decodeURIComponent(
      (await params).year
    )}. Find past papers, notes, and resources to help you prepare for your exams.`,
    icons: "/images/logo.ico",
    openGraph: {
      title: `Available papers for  ${decodeURIComponent(
        (await params).subject
      )} at ${decodeURIComponent((await params).year)} | Paper Guides`,
      description: `Explore the available papers for ${decodeURIComponent(
        (await params).subject
      )} at ${decodeURIComponent(
        (await params).year
      )}. Find past papers, notes, and resources to help you prepare for your exams.`,
      url: `https://paperguides.org/subjects/${decodeURIComponent(
        (await params).subject
      )}/${decodeURIComponent((await params).year)}`,
      siteName: "Paper Guides",
      locale: "en_US",
      type: "website",
      images: [
        {
          url: "/images/past_papers.png",
          width: 1200,
          height: 720,
          alt: "Paper Guides Open Graph Image",
        },
      ],
    },
  };
}

export default async function getQuestionLinks({ params }: PageProps) {
  try {
    const resolved = await params;
    const { subject, year } = await params;

    const res = await fetch(
      getApiUrl(isLocalhost()) + `/getPapers/${subject}/${year}`,
      { cache: "default" }
    );
    const result = await res.json();
    const papers: [string, string][] = result[0]["components"];

    const grouped: Record<string, [string, string][]> = {
      "Feb / Mar": [],
      "May / June": [],
      "Oct / Nov": [],
      Other: [],
    };

    for (const item of papers) {
      const rawSession = item[0];
      const session = rawSession.toLowerCase();

      if (session.includes("feb") || session.includes("mar")) {
        grouped["Feb / Mar"].push(item);
      } else if (session.includes("may") || session.includes("jun")) {
        grouped["May / June"].push(item);
      } else if (session.includes("oct") || session.includes("nov")) {
        grouped["Oct / Nov"].push(item);
      } else {
        grouped["Other"].push(item);
      }
    }

    for (const sessionKey in grouped) {
      grouped[sessionKey].sort((a, b) => {
        const codeA = parseInt(a[1]);
        const codeB = parseInt(b[1]);
        return codeA - codeB;
      });
    }

    // return <QuestionLinks subject={subject} groupedPapers={grouped} {params} />;

    return QuestionLinks({
      subject,
      groupedPapers: grouped,
      pathParams: resolved,
    });
  } catch (err) {
    console.error("Failed to fetch or group papers:", err);
  }
}

interface QuestionLinksProps {
  subject: string;
  groupedPapers: {
    [sessionName: string]: [string, string][];
  };
  pathParams: { board: string; subject: string; year: string };
}

async function QuestionLinks({
  subject,
  groupedPapers,
  pathParams,
}: QuestionLinksProps) {
  // const pathname = usePathname();
  const pathname = `/subjects/${pathParams.board}/${pathParams.subject}/${pathParams.year}`;
  function encodeUrlSegment(
    subject: string,
    paperType: string,
    componentCode: string,
    session: string
  ): string {
    const cleanSubject = subject.toLowerCase().replace(/\s+/g, "-");
    const cleanType = paperType.toLowerCase().replace(/\s+/g, "-");
    const cleanCode = componentCode.toLowerCase();
    const cleanSession = session
      .toLowerCase()
      .replace(/\//g, " ")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    return `${cleanSubject}-${cleanType}-${cleanCode}-${cleanSession}`;
  }

  return (
    <div>
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <div className="flex justify-between border-b-2 border-[var(--blue-highlight)]">
        <h1 className="text-4xl font-bold mb-6">
          Available <span className="text-[var(--blue-highlight)]">Papers</span>{" "}
          for{" "}
          <span className="text-[var(--blue-highlight)]">
            {subject.replaceAll("%20", " ")}
          </span>
        </h1>
        <div>
          <BackButton />
        </div>
      </div>

      {Object.entries(groupedPapers).map(([sessionName, papers]) =>
        papers.length > 0 ? (
          <div key={sessionName}>
            <h2 className="text-3xl font-bold mt-6 underline">
              • {sessionName}
            </h2>
            <div className="animate-fade-in space-y-4 mt-2">
              {papers.map(([session, code], index) => (
                <div
                  className="flex w-full"
                  key={`${session}-${code}-${index}`}
                >
                  <Link
                    href={`${pathname.replace(/\/$/, "")}/${encodeUrlSegment(
                      subject,
                      "Question Paper",
                      code,
                      session
                    )}`}
                    className={`border block p-4 rounded-xl w-4/3 text-xl font-bold bg-[var(--color-nav)] text-[var(--font-color)] shadow-xl hover:scale-[1.01] hover:shadow-xl transition-all duration-200 ${
                      session.includes("Insert Paper")
                        ? "border-[var(--diff-three)]"
                        : "border-[var(--blue-highlight)]"
                    }`}
                  >
                    {subject.replaceAll("%20", " ")}, {code},{" "}
                    {session.includes("Insert Paper")
                      ? `Year: ${session}`
                      : `Year: ${session} Question Paper`}
                  </Link>
                  <Link
                    href={`${pathname.replace(/\/$/, "")}/${encodeUrlSegment(
                      subject,
                      "Mark Scheme",
                      code,
                      session
                    )}`}
                    className="ml-4 block p-4 rounded-xl text-xl font-bold bg-[var(--red)] text-white shadow-xl hover:scale-[1.01] hover:shadow-xl transition-all duration-200"
                    style={{ flexShrink: 0 }}
                  >
                    Mark Scheme
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ) : null
      )}
    </div>
  );
}
