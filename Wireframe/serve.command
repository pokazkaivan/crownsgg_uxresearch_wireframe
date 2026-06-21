#!/bin/bash
# Double-click to run the Crowns V2 wireframe on a local server.
cd "$(dirname "$0")" || exit 1
PORT=8000
echo "Serving Crowns V2 wireframe at http://localhost:$PORT  (press Ctrl+C to stop)"
# open the browser shortly after the server starts
( sleep 1; open "http://localhost:$PORT/" ) &
python3 -m http.server "$PORT"
