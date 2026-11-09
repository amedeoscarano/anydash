#!/usr/bin/env bash
# Install the anydash skills as dash-<name> into the user-level skills folder of each detected agent.
# Claude Code users: prefer the plugin (/plugin install dash@anydash). See docs/install.md.
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: scripts/install.sh [--tool claude|codex|cursor|gemini]... [--link] [--dry-run] [--uninstall]

  --tool <name>  Limit to one tool (repeatable). Default: every detected tool.
  --link         Symlink skill files to this repo instead of copying them.
                 SKILL.md is always written, because its name: field is rewritten.
  --dry-run      Print the actions, change nothing.
  --uninstall    Remove the dash-* skills this script installed (marker file .anydash).
EOF
}

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$ROOT/skills"
TOOLS=() LINK=0 DRY=0 UNINSTALL=0
while [ $# -gt 0 ]; do
  case "$1" in
    --tool) [ $# -ge 2 ] || { usage >&2; exit 2; }; TOOLS+=("$2"); shift 2 ;;
    --link) LINK=1; shift ;;
    --dry-run) DRY=1; shift ;;
    --uninstall) UNINSTALL=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "unknown option: $1" >&2; usage >&2; exit 2 ;;
  esac
done

# User-level skills folder each tool reads (sources in docs/install.md).
target_dir() {
  case "$1" in
    claude) echo "$HOME/.claude/skills" ;;
    codex)  echo "$HOME/.agents/skills" ;;
    cursor) echo "$HOME/.cursor/skills" ;;
    gemini) echo "$HOME/.gemini/skills" ;;
    *) return 1 ;;
  esac
}

# Claude Code frontmatter keys the target does not document, so they are removed there.
strip_keys() {
  case "$1" in
    claude) echo "" ;;
    cursor) echo "user-invocable argument-hint context" ;;  # Cursor documents disable-model-invocation
    *)      echo "disable-model-invocation user-invocable argument-hint context" ;;
  esac
}

detected() {
  local cfg="$HOME/.$1"
  command -v "$1" >/dev/null 2>&1 || [ -d "$cfg" ]
}

run() { if [ "$DRY" = 1 ]; then echo "would: $*"; else "$@"; fi; }

# Write SKILL.md with name: dash-<name>, sibling paths ../<name>/ -> ../dash-<name>/, and stripped keys.
write_skill_md() { # <src SKILL.md> <dest SKILL.md> <keys to strip>
  awk -v strip=" $3 " '
    NR == 1 && $0 == "---" { fm = 1; print; next }
    fm && $0 == "---" { fm = 0; skip = 0; print; next }
    fm {
      if (skip && $0 ~ /^[ \t]/) next
      skip = 0
      key = $0; sub(/:.*/, "", key)
      if (index(strip, " " key " ")) { skip = 1; next }
      if (key == "name") { sub(/^name:[ \t]*/, ""); print "name: dash-" $0; next }
      print; next
    }
    { gsub(/\.\.\/<name>\//, "../dash-<name>/"); print gensub_siblings($0) }
    function gensub_siblings(s,   out, m) {
      out = ""
      while (match(s, /\.\.\/[a-z0-9-]+\/SKILL\.md/)) {
        m = substr(s, RSTART, RLENGTH)
        if (m !~ /^\.\.\/dash-/) m = "../dash-" substr(m, 4)
        out = out substr(s, 1, RSTART - 1) m
        s = substr(s, RSTART + RLENGTH)
      }
      return out s
    }
  ' "$1" > "$2"
}

install_skill() { # <tool> <skill dir> <dest root>
  local name dest entry
  name="$(basename "$2")"
  dest="$3/dash-$name"
  if [ -e "$dest" ] && [ ! -f "$dest/.anydash" ]; then
    echo "skip $dest: exists and was not installed by anydash" >&2
    return
  fi
  [ -e "$dest" ] && run rm -rf "$dest"
  run mkdir -p "$dest"
  for entry in "$2"/*; do
    [ "$(basename "$entry")" = SKILL.md ] && continue
    if [ "$LINK" = 1 ]; then run ln -s "$entry" "$dest/"; else run cp -R "$entry" "$dest/"; fi
  done
  if [ "$DRY" = 1 ]; then echo "would: write $dest/SKILL.md (name: dash-$name)"
  else write_skill_md "$2/SKILL.md" "$dest/SKILL.md" "$(strip_keys "$1")"; echo "$1" > "$dest/.anydash"; fi
}

uninstall_tool() { # <dest root>
  local skill dest
  for skill in "$SRC"/*/; do
    dest="$1/dash-$(basename "$skill")"
    if [ -f "$dest/.anydash" ]; then run rm -rf "$dest"
    elif [ -e "$dest" ]; then echo "skip $dest: not installed by anydash" >&2; fi
  done
}

if [ ${#TOOLS[@]} -eq 0 ]; then
  for t in claude codex cursor gemini; do detected "$t" && TOOLS+=("$t"); done
  # Cursor also reads ~/.claude/skills and ~/.agents/skills: a third copy would show twice.
  case " ${TOOLS[*]:-} " in *" cursor "*)
    case " ${TOOLS[*]} " in *" claude "*|*" codex "*)
      echo "cursor: reads ~/.claude/skills and ~/.agents/skills already, skipped (use --tool cursor to force)"
      kept=(); for t in "${TOOLS[@]}"; do [ "$t" = cursor ] || kept+=("$t"); done; TOOLS=("${kept[@]}") ;;
    esac ;;
  esac
fi
[ ${#TOOLS[@]} -gt 0 ] || { echo "no supported tool found (claude, codex, cursor, gemini); use --tool" >&2; exit 1; }

for t in "${TOOLS[@]}"; do
  root="$(target_dir "$t")" || { echo "unknown tool: $t" >&2; exit 2; }
  echo "$t: $root"
  if [ "$UNINSTALL" = 1 ]; then uninstall_tool "$root"; continue; fi
  run mkdir -p "$root"
  for skill in "$SRC"/*/; do install_skill "$t" "${skill%/}" "$root"; done
done
