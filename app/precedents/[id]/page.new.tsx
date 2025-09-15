"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import ApiService from "@/lib/api-service"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface CaseDetailsResponse {
  case: {
    id: string;
    title: string;
    full_text?: string;
    full_text_html?: string;
    judges?: string | string[];
    court?: string;
    date?: string;
    citation?: string;
    url?: string;
    summary?: string;
  };
  similarity_score?: number;
  similar_points?: string[];
  cache_status?: string;
}

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
  const [data, setData] = useState<CaseDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const description = searchParams?.get('description') || undefined;
  
  useEffect(() => {
    if (!id) {
      setError('No case ID provided');
      setLoading(false);
      return;
    }
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const resp = await ApiService.getCaseDetails(
          String(id), 
          description
        );
        
        setData(resp);
      } catch (err: any) {
        console.error('Error fetching case details:', err);
        setError(err.message || 'Failed to load case details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, description]);
  
  if (loading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-white">Loading case details...</h1>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-6">
          <div className="space-y-4">
            <div className="h-8 bg-gray-700/50 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-gray-700/50 rounded w-1/2 animate-pulse"></div>
            <div className="space-y-2 mt-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-700/50 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-white">Error</h1>
        </div>
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="text-red-400 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-red-100">Error Loading Case</h3>
              <p className="text-red-200 mt-2">{error}</p>
              <div className="mt-4">
                <Button 
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="bg-red-900/50 border-red-700 text-red-100 hover:bg-red-800/50"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!data?.case) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-white">Case Not Found</h1>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-6 text-center">
          <p className="text-gray-400">The requested case could not be found.</p>
          <Button 
            onClick={() => router.back()}
            variant="outline"
            className="mt-4"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }
  
  const { case: caseData } = data;
  
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="container mx-auto p-4 max-w-4xl">
        {/* Back button and title */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-white">Case Details</h1>
        </div>
        
        {/* Case metadata */}
        <div className="bg-gray-800/50 rounded-lg p-6 mb-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">{caseData.title}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            {caseData.court && (
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Court</p>
                <p>{caseData.court}</p>
              </div>
            )}
            
            {caseData.date && (
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Date</p>
                <p>{formatDate(caseData.date)}</p>
              </div>
            )}
            
            {caseData.judges && (
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Judges</p>
                <p>{formatJudges(caseData.judges)}</p>
              </div>
            )}
            
            {caseData.citation && (
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Citation</p>
                <p className="font-mono">{caseData.citation}</p>
              </div>
            )}
            
            {caseData.url && (
              <div className="md:col-span-2">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Source</p>
                <a 
                  href={caseData.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline break-all"
                >
                  {caseData.url}
                </a>
              </div>
            )}
          </div>
          
          {caseData.summary && (
            <div className="mt-6 pt-4 border-t border-gray-700">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Summary</h3>
              <p className="text-gray-300">{caseData.summary}</p>
            </div>
          )}
        </div>
        
        {/* Case content */}
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Case Content</h2>
            {data.cache_status && (
              <span className="text-xs px-2 py-1 rounded-full bg-blue-900/30 text-blue-300 border border-blue-800">
                {data.cache_status}
              </span>
            )}
          </div>
          
          <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-p:my-4">
            {caseData.full_text_html ? (
              <div dangerouslySetInnerHTML={{ __html: caseData.full_text_html }} />
            ) : caseData.full_text ? (
              <div className="whitespace-pre-line">{caseData.full_text}</div>
            ) : (
              <p className="text-gray-400 italic">No content available for this case.</p>
            )}
          </div>
        </div>
        
        {/* Similar points */}
        {data.similar_points && data.similar_points.length > 0 && (
          <div className="mt-6 bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Similar Points</h3>
            <div className="space-y-4">
              {data.similar_points.map((point, idx) => (
                <div key={idx} className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
                  <p className="text-gray-300">{point}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
