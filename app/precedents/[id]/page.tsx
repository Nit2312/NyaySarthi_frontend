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
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const resp = await CaseService.getCaseDetails(
          String(id), 
          description
        ) as CaseResponse;
        
        console.log('API Response:', resp); // Debug log
        
        if (!resp || !resp.success) {
          throw new Error(resp?.error || 'Failed to fetch case details');
        }
        
        // Handle different response structures
        let caseData: CaseResponse;
        if (resp.case) {
          // If response already has a case property
          caseData = {
            ...resp,
            case: {
              id: resp.case.id || String(id),
              title: resp.case.title || 'Untitled Case',
              full_text: resp.case.full_text || '',
              full_text_html: resp.case.full_text_html || '',
              judges: resp.case.judges || [],
              court: resp.case.court,
              date: resp.case.date,
              citation: resp.case.citation,
              url: resp.case.url,
              summary: resp.case.summary
            }
          };
        } else if (resp.case_details) {
          // If response has case_details property
          caseData = {
            ...resp,
            case: {
              id: resp.case_details.id || String(id),
              title: resp.case_details.title || 'Untitled Case',
              full_text: resp.case_details.full_text || '',
              full_text_html: resp.case_details.full_text_html || '',
              judges: resp.case_details.judges || [],
              court: resp.case_details.court,
              date: resp.case_details.date,
              citation: resp.case_details.citation,
              url: resp.case_details.url,
              summary: resp.case_details.summary
            }
          };
        } else {
          // If response is the case data directly
          // Create a new object without the success property from resp if it exists
          const { success: _, ...restResp } = resp;
          caseData = {
            success: true,
            case: {
              id: String(id),
              title: resp.title || 'Untitled Case',
              full_text: resp.full_text || '',
              full_text_html: resp.full_text_html || '',
              judges: resp.judges || [],
              court: resp.court,
              date: resp.date,
              citation: resp.citation,
              url: resp.url,
              summary: resp.summary
            },
            ...restResp
          };
        }
        
        // Ensure we have all required fields
        const finalData: CaseResponse = {
          ...caseData,
          case: {
            id: caseData.case?.id || String(id),
            title: caseData.case?.title || 'Untitled Case',
            full_text: caseData.case?.full_text || '',
            full_text_html: caseData.case?.full_text_html || '',
            judges: caseData.case?.judges || [],
            court: caseData.case?.court,
            date: caseData.case?.date,
            citation: caseData.case?.citation,
            url: caseData.case?.url,
            summary: caseData.case?.summary,
            ...caseData.case
          },
          similar_points: caseData.similar_points || [],
          similarity_score: caseData.similarity_score || 0,
          analysis_status: caseData.analysis_status || 'partial',
          cache_status: caseData.cache_status || 'miss',
          success: caseData.success !== false,
          error: caseData.error
        };
        
        setData(finalData);
      } catch (err: any) {
        console.error('Error fetching case details:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load case details';
        setError(errorMessage);
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
  
  if (!data) {
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
          <p className="text-gray-400">The requested case could not be found or is not available.</p>
          {error && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-800 rounded text-red-200 text-sm">
              {error}
            </div>
          )}
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
  
  // Type assertion to handle the response format
  const responseData = data as CaseResponse;
  
  // Get case data with proper fallbacks
  const caseData = responseData.case || responseData.case_details || responseData;
  
  // Extract the full text with proper fallbacks - try to get the most complete content available
  const fullText = (() => {
    // First try to get the full text from various possible fields
    const possibleContentFields = [
      getCaseField(responseData, 'full_text'),
      getCaseField(responseData, 'content'),
      getCaseField(responseData, 'case.full_text'),
      getCaseField(responseData, 'case.content'),
      getCaseField(responseData, 'case_details.full_text'),
      getCaseField(responseData, 'case_details.content')
    ];
    
    // Find the longest non-empty content
    const validContents = possibleContentFields.filter(Boolean);
    if (validContents.length > 0) {
      // Return the longest content string
      return validContents.reduce((longest, current) => 
        current.length > longest.length ? current : longest, '');
    }
    
    // If no content found, fall back to stringifying the whole response
    return JSON.stringify(caseData, null, 2);
  })();
  
  // Process the full text for better readability
  const processContent = (text: string) => {
    if (!text) return '<p class="text-gray-400 italic">No content available</p>';
    
    // First, try to split by double newlines for paragraphs
    const paragraphs = text.split(/\n\s*\n/);
    
    // If that doesn't give us good results, try splitting by sentence boundaries
    if (paragraphs.length <= 1) {
      // Split by sentences (period followed by space or end of string)
      const sentences = text.split(/(?<=\.)\s+/);
      return `
        <div class="case-content space-y-4">
          ${sentences.filter(s => s.trim().length > 0).map(sentence => 
            `<p class="text-gray-300 leading-relaxed">${sentence.trim()}</p>`
          ).join('\n')}
        </div>
      `;
    }
    
    // Process paragraphs
    return `
      <div class="case-content space-y-4">
        ${paragraphs.map(para => {
          const trimmed = para.trim();
          if (!trimmed) return '';
          return `<p class="text-gray-300 leading-relaxed">${trimmed}</p>`;
        }).join('\n')}
      </div>
    `;
  };
  
  // Generate HTML content with proper formatting
  const fullTextHtml = processContent(String(fullText));
  
  // Helper function to escape HTML for safe rendering
  function escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  
  // Similar cases or related information
  const similarCases = Array.isArray(data.similar_points) ? data.similar_points : [];
  
  // Get the case title with fallback
  const caseTitle = caseData?.title || 'Case Details';
  const caseCitation = caseData?.citation ? `Citation: ${caseData.citation}` : '';
  const caseCourt = caseData?.court ? `Court: ${caseData.court}` : '';
  const caseDate = caseData?.date ? `Date: ${caseData.date}` : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-900 text-gray-100 flex flex-col">
      {/* Header with back button and actions */}
      <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Case Details
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="text-xs bg-gray-700/50 border-gray-600 hover:bg-gray-600/50 text-gray-100">
                <FileText className="h-4 w-4 mr-2" />
                Save Case
              </Button>
              <Button variant="outline" size="sm" className="text-xs bg-gray-700/50 border-gray-600 hover:bg-gray-600/50 text-gray-100">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-7xl flex-1 flex flex-col min-h-0">
        {/* Case Metadata Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-2xl overflow-hidden mb-6 transform transition-all hover:shadow-purple-500/10">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between md:space-x-8">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white mb-2 leading-tight">{caseData.title}</h1>

                <div className="flex flex-wrap items-center gap-2 mt-3 mb-4">
                  {caseData.court && (
                    <span className="px-3 py-1 bg-blue-900/30 text-blue-300 text-xs font-medium rounded-full">
                      {caseData.court}
                    </span>
                  )}
                  {caseData.date && (
                    <span className="px-3 py-1 bg-purple-900/30 text-purple-300 text-xs font-medium rounded-full">
                      {formatDate(caseData.date)}
                    </span>
                  )}
                  {caseData.citation && (
                    <span className="px-3 py-1 bg-emerald-900/30 text-emerald-300 text-xs font-medium rounded-full">
                      {caseData.citation}
                    </span>
                  )}
                </div>

                {caseData.judges && caseData.judges.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-400 mb-1">
                      {caseData.judges.length > 1 ? 'Judges' : 'Judge'}:
                    </p>
                    <p className="text-gray-300 font-medium">{formatJudges(caseData.judges)}</p>
                  </div>
                )}
              </div>

              <div className="mt-4 md:mt-0">
                {caseData.url && (
                  <a
                    href={caseData.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View Original Source
                  </a>
                )}
              </div>
            </div>

            {caseData.summary && (
              <div className="mt-6 pt-5 border-t border-gray-700/50">
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3 flex items-center">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                  Case Summary
                </h3>
                <p className="text-gray-300 leading-relaxed">{caseData.summary}</p>
              </div>
            )}
          </div>
        </div>

        {/* Case Content Card - Takes remaining space */}
        <div className="flex-1 flex flex-col bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-2xl overflow-hidden min-h-0">
          {/* Card Header */}
          <div className="px-6 py-4 border-b border-gray-700/50 flex items-center justify-between bg-gray-800/30">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Full Judgment Text
            </h2>
            <div className="flex items-center space-x-2">
              <button className="text-xs px-3 py-1.5 rounded-md bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 transition-colors">
                <span className="flex items-center">
                  <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </span>
              </button>
              <button className="text-xs px-3 py-1.5 rounded-md bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 transition-colors">
                <span className="flex items-center">
                  <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                  Copy Text
                </span>
              </button>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto" style={{ minHeight: '0' }}>
            <div className="p-6 md:p-8">
              <div className="prose prose-invert max-w-none text-gray-300">
                {caseData.full_text ? (
                  <div className="text-gray-300 space-y-4">
                    {(() => {
                      // First, split the text into logical sections
                      const sections = caseData.full_text
                        .split(/(?=\n\d+\.\s|\n\[\d+\]|\n[•*+-]\s|\n\d+\)\s|\n[A-Z][A-Z\s]+:)/g)
                        .filter(Boolean);
                      
                      return sections.map((section: string, index: number) => {
                        const trimmed = section.trim();
                        if (!trimmed) return null;

                        // Format as a point
                        return (
                          <div key={index} className="flex items-start">
                            <span className="text-gray-400 font-medium mr-3 mt-1">
                              {index + 1}.
                            </span>
                            <div className="flex-1">
                              {trimmed.split('\n').map((line, i) => (
                                <p key={i} className="mb-2 text-justify">
                                  {line.trim()}
                                </p>
                              ))}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                ) : (
                  <FormattedCaseContent />
                )}
              </div>
            </div>
          </div>

          {/* Footer with raw content toggle */}
          <div className="border-t border-gray-700/50 bg-gray-800/30 p-4">
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer text-sm text-gray-400 hover:text-gray-300 transition-colors">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  View Raw Content
                </span>
              </summary>
              <div className="mt-3 p-4 bg-gray-800/50 rounded-lg overflow-hidden">
                <pre className="text-xs text-gray-300 overflow-x-auto p-4 bg-gray-900/30 rounded">
                  {typeof fullText === 'string' ? fullText : JSON.stringify(fullText, null, 2)}
                </pre>
              </div>
            </details>
          </div>
        </div>

        {/* Similar Cases Section */}
        {similarCases.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold text-white mb-5 flex items-center">
              <svg className="w-5 h-5 text-purple-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Related Cases
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {similarCases.slice(0, 3).map((caseItem, index) => (
                <div key={index} className="bg-gray-800/50 hover:bg-gray-700/50 rounded-lg border border-gray-700/50 p-5 transition-all hover:shadow-lg hover:shadow-purple-500/5">
                  <h3 className="font-medium text-gray-200 mb-2 line-clamp-2">
                    {caseItem.split('\n')[0] || 'Untitled Case'}
                  </h3>
                  <p className="text-sm text-gray-400 line-clamp-3">
                    {caseItem.length > 100 ? caseItem.substring(0, 200) + '...' : caseItem}
                  </p>
                  <button className="mt-3 text-xs text-blue-400 hover:text-blue-300 flex items-center transition-colors">
                    View Details
                    <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
