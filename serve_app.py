import http.server
import socketserver
import os
import sys

PORT = 5173
DIRECTORY = os.path.abspath(os.path.join(os.path.dirname(__file__), "dist"))

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        # Resolve full path of the request
        path = self.translate_path(self.path)
        if not os.path.exists(path) or os.path.isdir(path):
            self.path = "/index.html"
        return super().do_GET()

class ThreadedTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    daemon_threads = True
    allow_reuse_address = True

if __name__ == "__main__":
    with ThreadedTCPServer(("127.0.0.1", PORT), SPAHandler) as httpd:
        print(f"Serving SPA from {DIRECTORY} at http://127.0.0.1:{PORT}", flush=True)
        httpd.serve_forever()
