#!/usr/bin/env python3
"""Local development server.

    python3 scripts/serve.py

Then open http://localhost:8899

Use this rather than opening the files directly. Two reasons:

1. Opening index.html from your file system gives the page an origin of
   "null", which the API refuses. Requests will fail and the reason will not
   be obvious. Served over http://localhost the API accepts you.

2. It sends no-cache headers. A browser will happily keep serving you the
   stylesheet you edited five minutes ago, and you will spend an afternoon
   fixing CSS that was never broken. This stops that.

Stop it with Ctrl+C.
"""

import functools
import http.server
import socketserver

PORT = 8899


class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, fmt, *args):
        # One quiet line per request; the default logs the whole request line.
        print("  %s %s" % (self.command, self.path.split("?")[0]))


if __name__ == "__main__":
    socketserver.TCPServer.allow_reuse_address = True
    handler = functools.partial(NoCache, directory=str(__import__("pathlib").Path(__file__).parent.parent))
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print("Serving the library at http://localhost:%d  (Ctrl+C to stop)\n" % PORT)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nStopped.")
