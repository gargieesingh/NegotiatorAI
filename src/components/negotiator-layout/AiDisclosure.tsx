export function AiDisclosure() {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3.5 py-2 rounded-full border border-stroke-soft-200 bg-white-0 text-xs font-medium text-sub-600 shadow-[0_0_1.25rem_0_rgba(0,0,0,0.03)] backdrop-blur-sm max-md:hidden">
      <span className="h-2 w-2 rounded-full animate-pulse bg-blue-500" />
      <span>AI Agent Operating on Your Behalf</span>
    </div>
  );
}
