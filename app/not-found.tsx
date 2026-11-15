export default function NotFound() {
  return (
    <div className="hs-paper min-h-screen flex flex-col justify-center hos-gutter py-16 text-center">
      <p className="hs-note mb-6">404</p>
      <h1 className="hs-hero mx-auto max-w-[12ch]">this page wandered off.</h1>
      <p className="hs-lead mt-8 mx-auto">The link may be old, or the page has moved.</p>
      <p className="mt-9">
        <a href="/" className="hs-btn hs-btn-solid">
          Back to the start
        </a>
      </p>
    </div>
  );
}
