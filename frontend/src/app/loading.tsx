export default function Loading() {
  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center bg-[#F5F5F5]">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-[#E30611] border-t-transparent"
        aria-hidden
      />
    </div>
  );
}
