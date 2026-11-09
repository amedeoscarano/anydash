# /dash:clone eval prompt

Target: a copy of `examples/flawed-dashboard` served on `http://127.0.0.1:3103` (own app, legitimate access).

## Setup

1. Copy `examples/flawed-dashboard` to a scratch folder (not inside the repo) and run `npx next dev -H 127.0.0.1 -p 3103` there.
2. Start Chrome with a temporary profile: `--user-data-dir=<scratch>/chrome-profile --remote-debugging-port=9334 --remote-debugging-address=127.0.0.1 --window-size=1440,900`, open `http://127.0.0.1:3103/`.
3. Afterwards: stop both, check that ports 3103 and 9334 are free, delete the profile folder.

## Prompt, verbatim

> /dash:clone http://127.0.0.1:3103/
> This is a local copy of our own shipping admin; I have full access and want a rebuild spec. Chrome with CDP runs on 127.0.0.1:9334. Work in this folder.

Expected answers and checks: [EXPECTED.md](EXPECTED.md). Last run: [RESULTS.md](RESULTS.md). Outputs of that run: `run/`.
