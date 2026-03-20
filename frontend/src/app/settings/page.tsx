export default function SettingsPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] text-center max-w-md mx-auto animate-fade-in p-6">
      <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mb-8 border border-gray-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-400"
        >
          <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Settings</h2>
      <p className="text-gray-500 mb-10 leading-relaxed">
        Account and preference settings are coming soon. We&apos;re working on bringing you a better experience!
      </p>
      <a href="/">
        <button className="flex items-center gap-2 bg-[#1A1A1A] hover:bg-black text-white px-8 py-3.5 rounded-full font-medium transition-all shadow-lg hover:shadow-xl active:scale-[0.98]">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          Back to Assignments
        </button>
      </a>
    </div>
  );
}
