import React from 'react';

export const FormattedCaseContent = () => {
  return (
    <div className="w-full max-w-none text-gray-300 space-y-6 min-h-full">
      <div className="flex flex-wrap gap-4 mb-6">
        <span className="px-3 py-1 bg-blue-900/30 text-blue-300 rounded-full text-sm">Share Link</span>
        <span className="px-3 py-1 bg-blue-900/30 text-blue-300 rounded-full text-sm">Mobile View</span>
        <span className="px-3 py-1 bg-green-900/30 text-green-300 rounded-full text-sm">Free features</span>
        <span className="px-3 py-1 bg-purple-900/30 text-purple-300 rounded-full text-sm">Premium features</span>
        <span className="px-3 py-1 bg-red-900/30 text-red-300 rounded-full text-sm">Case removal</span>
      </div>

      <div className="bg-yellow-900/20 border-l-4 border-yellow-500 p-4 mb-6">
        <p className="text-yellow-200 font-medium">Warning on translation</p>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Get this document in PDF
        </button>
        <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print it on a file/printer
        </button>
      </div>

      <div className="mb-8">
        <div className="text-sm text-gray-400 mb-2">[Cites 0, Cited by 3924]</div>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">User Queries</h3>
          <div className="flex flex-wrap gap-2">
            {[
              "maharashtra co operative societies act 1960",
              "amendment in bye law of society",
              "amalgamation of banks",
              "amendment of bye-laws",
              "can societies amalgamate",
              "amalgamation of society",
              "maharashtra co-operative societies act,1960",
              "society bye laws",
              "Trust",
              "federal society",
              "co-operative court",
              "sec 20",
              "hindu adoption and maintenance act 1956",
              "co operative societies act",
              "co operative society",
              "criminal breach of trust",
              "insolvency act",
              "deemed member",
              "body corporate",
              "registration act 1908"
            ].map((query, index) => (
              <span key={index} className="px-3 py-1 bg-gray-800 rounded-full text-sm">
                {query}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-blue-900/10 border-l-4 border-blue-500 p-4 mb-6">
          <p className="text-blue-200">
            Take notes as you read a judgment using our Virtual Legal Assistant and get email alerts 
            whenever a new judgment matches your query (Query Alert Service). Try out our Premium 
            Member Services -- Sign up today and get free trial for one month.
          </p>
        </div>
      </div>

      <div className="w-full space-y-8">
        <div className="border-b border-gray-700 pb-4 mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">The Maharashtra Co-Operative Societies Act, 1960</h1>
          <div className="text-sm text-gray-400">
            <p>MAHARASHTRA India</p>
            <p>Act 24 of 1961</p>
            <p>Published on 4 May 1961</p>
            <p>Commended on 4 May 1961</p>
            <p className="text-yellow-400 mt-2">[This is the version of this document from 4 May 1961.]</p>
            <p className="text-yellow-400">[Note: The original publication document is not available and this content could not be verified.]</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">The Maharashtra Co-Operative Societies Act, 1960</h2>
          <p className="text-gray-300 mb-4">(Maharashtra Act No. 24 of 1961)</p>
          <p className="text-sm text-gray-400 mb-6">Last Updated 4th November, 2019</p>
          
          <p className="mb-4">
            For Statement and Reasons, see Maharashtra Government Gazette, 1960, Part 5, pages 270-273; 
            for Report of the Select Committee, see ibid., Part 5, pages 432-517.
          </p>
          
          <p className="mb-6 italic">
            (Received the assent of the President on the 4th May 1961; assent first published in the 
            Maharashtra Government Gazette, Part IV, on the 9th day of May 1961).
          </p>
          
          <p className="text-lg font-medium mb-4">
            An Act to consolidate and amend the law relating to Co-operative Societies in the State of Maharashtra
          </p>
          
          <p className="mb-6">
            WHEREAS, with a view to providing for the orderly development of the co-operative movement in 
            the State of Maharashtra in accordance with the relevant directive principles of State policy 
            enunciated in the Constitution of India, it is expedient to consolidate and amend the law 
            relating to co-operative societies in that State;
          </p>
          
          <p>It is hereby enacted in the Eleventh Year of the Republic of India as follows:-</p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 border-b border-gray-700 pb-2">Chapter I - Preliminary</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium text-white mb-2">1. Short title, extent and commencement.</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>This Act may be called the Maharashtra Co-operative Societies Act, 1960.</li>
              <li>It extends to the whole of the State of Maharashtra.</li>
              <li>
                It shall come into force on such [date] [26th day of January 1962, vide G.N., C. & R.D.D. No. SCL 1061/135-G, 
                dated 24th January 1962.] as the State Government may, by notification in the Official Gazette, appoint.
              </li>
            </ol>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium text-white mb-2">2. Definitions.</h3>
            <p className="mb-4">In this Act, unless the context otherwise requires,-</p>
            
            <ol className="list-decimal list-inside space-y-4">
              <li>
                <span className="font-medium">"agricultural marketing society"</span> means a society-
                <ol className="list-[lower-alpha] list-inside mt-2 space-y-1 pl-4">
                  <li>the object of which is the marketing of agricultural produce and the supply of implements and other requisites for agricultural production, and</li>
                  <li>not less than three-fourths of the members of which are agriculturists, or societies formed by agriculturists;</li>
                </ol>
              </li>
              
              <li>
                <span className="font-medium">"apex society"</span>, means a society,-
                <p className="text-xs text-gray-400 italic mt-1">[Clause (2) was inserted by Maharashtra 20 of 1986, Section 2(a).]</p>
                <ol className="list-[lower-alpha] list-inside mt-2 space-y-1 pl-4">
                  <li>the area of operation of which extends to the whole of the State of Maharashtra,</li>
                  <li>the main object of which is to promote the principal objects of the societies affiliated to it as members and to provide for the facilities and services to them, and</li>
                  <li>which has been classified as an apex society by the Registrars;</li>
                </ol>
              </li>
              
              <li>
                <span className="font-medium">"authorised person"</span> means any person duly authorised by the Registrar to take action under the provisions of this Act;
                <p className="text-xs text-gray-400 italic mt-1">[Clause (2A) was inserted by Maharashtra Act No. 16 of 2013 dated 13-8-2013, Section 2(a), (w.e.f. 14-2-2013).]</p>
              </li>
              
              <li className="text-gray-400">
                [Clause (3) was deleted by Maharashtra 20 of 1986, Section 2(b).]
              </li>
              
              <li>
                <span className="font-medium">"bonus"</span> means payment made in cash or kind out of the profits of a society to a member, or to a person who is not a member, on the basis of his contribution (including any contribution in the form of labour or service) to the business of the society, and in the case of a farming society, on the basis both of such contribution and also the value or income or as the case may be, the area of the lands of the members brought together for joint cultivation as may be decided by the society <span className="text-yellow-400">but does not include any sum paid or payable as bonus to any employee of the society under the payment of Bonus Act, 1965;</span>
                <p className="text-xs text-gray-400 italic mt-1">[This portion was added by Maharashtra 27 of 1969, Section 2(a).]</p>
              </li>
              
              <li>
                <span className="font-medium">"bye-laws"</span> means bye-laws registered under this Act and for the time being in force and includes registered amendments of such bye-laws;
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormattedCaseContent;
