#!/usr/bin/env python3
"""House rules for this project, checked mechanically.

Run it before you push:

    python3 scripts/check.py

The same script runs in CI, so if it passes here it passes there. Every rule
below exists because breaking it produces a bug that is hard to see in review:
a page that drifts from the others, a control a keyboard cannot reach, or a
request that dies silently when a token expires.

Comments are stripped before anything is checked. A rule that fires on the
sentence describing it is a rule nobody trusts.
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKIP = {".git", "node_modules", ".vercel", "scripts"}

failures = []


def files(suffix):
    for p in sorted(ROOT.rglob("*" + suffix)):
        if not any(part in SKIP for part in p.parts):
            yield p


def strip_comments(text, kind):
    """Remove comments so a rule never fires on prose describing it."""
    if kind == "css":
        return re.sub(r"/\*.*?\*/", "", text, flags=re.S)
    return re.sub(r"<!--.*?-->", "", text, flags=re.S)


def report(path, line_no, message):
    failures.append(f"{path.relative_to(ROOT)}:{line_no}: {message}")


def scan(path, kind, pattern, message, exclude=None):
    text = strip_comments(path.read_text(encoding="utf-8"), kind)
    for i, line in enumerate(text.splitlines(), 1):
        if exclude and exclude in line:
            continue
        if re.search(pattern, line):
            report(path, i, message)


for html in files(".html"):
    template = html.name == "_template.html"

    # An <img> with no alt at all is invisible to a screen reader. alt="" is
    # allowed: it means "decorative, skip me", which is a decision. A missing
    # attribute is not a decision.
    text = strip_comments(html.read_text(encoding="utf-8"), "html")
    for i, line in enumerate(text.splitlines(), 1):
        for tag in re.findall(r"<img\b[^>]*>", line):
            if not re.search(r"\balt\s*=", tag):
                report(html, i, "<img> has no alt attribute")

    if not template:
        # A style attribute cannot be reused and ignores the tokens. If a
        # component is missing, add it to components.css so everyone gets it.
        scan(html, "html", r'\sstyle\s*=\s*"', "inline style; use a class from components.css")

        # A <style> block in a page is the same problem wearing a hat, and it
        # was not being checked. A submitted screen arrived with 22 hardcoded
        # colours inside one, none of them from the tokens and one of them a
        # near-miss of the brand indigo. The rule is the same wherever CSS is
        # written: if nobody can name a colour, no two screens can drift apart.
        for i, line in enumerate(text.splitlines(), 1):
            if re.search(r"<style\b", line):
                report(html, i, "<style> block in a page; put styles in css/components.css")

        # Colours anywhere in the page, including inside a <style> block.
        #
        # theme-color is the one honest exception: the browser reads it out of
        # the markup before any stylesheet is parsed, so it cannot be a
        # variable. Anything else naming a colour in a page is drift.
        for i, line in enumerate(text.splitlines(), 1):
            if "theme-color" in line:
                continue
            if re.search(r"#[0-9a-fA-F]{3,8}\b", line):
                report(html, i, "raw colour in a page; use a var(--token) from tokens.css")

        # api.js owns the Authorization header, the refresh-and-replay and the
        # error shape. A bare fetch bypasses all three.
        scan(html, "html", r"\bfetch\s*\(", "direct fetch(); use api.get / api.post")

    # Every page needs the skip link as its first focusable element.
    if "skip-link" not in text:
        report(html, 1, "no skip link; a keyboard user cannot pass the navigation")

for css in files(".css"):
    if css.name != "tokens.css":
        # Every colour lives in tokens.css. Two screens cannot drift apart if
        # neither is allowed to name a colour.
        scan(css, "css", r"#[0-9a-fA-F]{3,8}\b", "raw colour; use a var(--token) from tokens.css")

    # Removing the focus ring makes the page unusable by keyboard (WCAG 2.4.7).
    scan(css, "css", r"outline\s*:\s*(none|0)\b", "outline removed; keyboard focus becomes invisible")

if failures:
    print(f"{len(failures)} problem(s):\n")
    for f in failures:
        print("  " + f)
    print("\nEach line names the file, the line and the rule. Fix and run again.")
    sys.exit(1)

print("All house rules pass.")
