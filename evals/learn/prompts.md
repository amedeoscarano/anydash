# /dash:learn eval prompt (dry run)

Target: the same local copy of `examples/flawed-dashboard` on `http://127.0.0.1:3103`, treated as a new portal named `localship`. Same Chrome setup as the clone eval.

## Prompt, verbatim

> /dash:learn http://127.0.0.1:3103/
> Treat it as a new portal called localship. It is our own local app, I have full access. Chrome with CDP runs on 127.0.0.1:9334. The repo checkout is <path to anydash>.

Content quality is secondary; the format must be valid. Expected: [EXPECTED.md](EXPECTED.md). Last run: [RESULTS.md](RESULTS.md), outputs in `run/`.
