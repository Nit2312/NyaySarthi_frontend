"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { CaseService } from "@/lib/case-service"
import { CaseDoc } from "@/lib/types/case"
import { ArrowLeft, FileText, Printer, ChevronDown } from "lucide-react"
import FormattedCaseContent from "./formatted-content"

// Extended type to handle the response format
interface CaseResponse {
  case?: CaseDoc;
  case_details?: CaseDoc;
  similar_points?: string[];
  similarity_score?: number;
  analysis_status?: string;
  cache_status?: string;
  success: boolean;
  error?: string;
  [key: string]: any;
}

// Type-safe case data access helper
const getCaseField = (data: any, field: string): any => {
  if (!data) return '';
  if (data[field] !== undefined) return data[field];
  if (data.case?.[field] !== undefined) return data.case[field];
  if (data.case_details?.[field] !== undefined) return data.case_details[field];
  return '';
};

function formatDate(dateString?: string) {
  if (!dateString) return 'Date not available';
  try {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (e) {
    return dateString;
  }
}

function formatJudges(judges?: string | string[]) {
  if (!judges) return 'Not specified';
  if (Array.isArray(judges)) {
    return judges.join(', ');
  }
  return judges;
}

export default function CaseDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [data, setData] = useState<CaseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const description = searchParams?.get('description') || undefined;

  useEffect(() => {
    if (!id) {
      setError('No case ID provided');
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const resp = await CaseService.getCaseDetails(String(id), description, undefined, 30000, 0, 3, false);
        if (!resp || (resp as any).success === false) throw new Error((resp as any)?.error || 'Failed to fetch case details');
        setData(resp as any);
      } catch (e: any) {
        setError(e?.message || 'Failed to load case details');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, description]);

  if (loading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-gray-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-white">Loading case details...</h1>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-gray-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-white">{error ? 'Error' : 'Case Not Found'}</h1>
        </div>
        {error && <div className="bg-red-900/20 border border-red-800 rounded p-4 text-red-200 text-sm">{error}</div>}
      </div>
    );
  }

  const responseData = data as CaseResponse;
  const caseData = responseData.case || responseData.case_details || (responseData as any);
  const plainText = (
    getCaseField(responseData, 'full_text') ||
    getCaseField(responseData, 'case.full_text') ||
    getCaseField(responseData, 'case_details.full_text') ||
    ''
  );

  return (
    <>
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold mt-4 mb-2">{caseData?.title || 'Case Details'}</h1>
          <div className="text-sm text-gray-400 mb-4 flex flex-wrap gap-3">
            {caseData?.court && <span>{caseData.court}</span>}
            {caseData?.date && <span>{formatDate(caseData.date)}</span>}
            {caseData?.citation && <span>{caseData.citation}</span>}
            {caseData?.url && <a className="text-blue-400 hover:text-blue-300" href={caseData.url} target="_blank" rel="noopener noreferrer">Source</a>}
          </div>
          <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
            {caseData?.full_text_html && String(caseData.full_text_html).trim().length > 0 ? (
              <div className="case-html-content" dangerouslySetInnerHTML={{ __html: caseData.full_text_html as any }} />
            ) : (
              <pre className="whitespace-pre-wrap leading-relaxed">{plainText}</pre>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
