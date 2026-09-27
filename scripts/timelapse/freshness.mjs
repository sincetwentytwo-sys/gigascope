// Shared "does this derived file need regenerating?" check for the weekly
// timelapse job (hero variants + before/after thumbnails).
//
// mtime alone is useless in CI: a fresh checkout stamps every file with the
// same-ish time in arbitrary order, so "source newer than derivative" came out
// true at random and the job re-encoded + committed the hero -mobile.mp4s on
// runs where no timelapse had changed (2026-09-27). In a git work tree the
// real question is "did this run rewrite the source?" — i.e. is it modified or
// untracked relative to HEAD. Outside git, fall back to mtime.
import { execFileSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";

let inGit = null;
function gitAvailable() {
  if (inGit === null) {
    try {
      execFileSync("git", ["rev-parse", "--is-inside-work-tree"], { stdio: ["ignore", "pipe", "ignore"] });
      inGit = true;
    } catch {
      inGit = false;
    }
  }
  return inGit;
}

export function needsRegen(src, dsts) {
  if (dsts.some((d) => !existsSync(d))) return true;
  if (gitAvailable()) {
    const out = execFileSync("git", ["status", "--porcelain", "--", src], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return out.trim().length > 0;
  }
  const srcM = statSync(src).mtimeMs;
  return dsts.some((d) => statSync(d).mtimeMs < srcM);
}
