export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <a href="/" className="flex items-center">
          <img
            src="/interviewprep-small-logo.svg"
            alt="Interview Prep"
            className="h-7 w-auto"
          />
        </a>
      </div>
    </header>
  );
}
