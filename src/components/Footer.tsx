export function Footer() {
  return (
    <footer id="contact" className="w-full border-t border-black/10 px-8 py-16">
      <div className="flex w-full flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-black">Velo</p>
          <p className="mt-2 max-w-sm text-sm text-black/60">
            Agentic operations for enterprise systems — governed by human approval.
          </p>
        </div>
        <div className="text-left sm:text-right">
          <a
            href="mailto:hello@velo.ai"
            className="text-sm text-black/60 transition-opacity hover:text-black hover:opacity-100"
          >
            hello@velo.ai
          </a>
          <p className="mt-3 text-xs text-black/40">
            &copy; {new Date().getFullYear()} Velo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
