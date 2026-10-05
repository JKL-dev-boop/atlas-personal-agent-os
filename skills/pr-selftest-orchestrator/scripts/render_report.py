#!/usr/bin/env python3
"""Render a self-contained HTML report from a structured run result."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser(description="Render PR self-test results as HTML.")
    parser.add_argument("result", help="Path to results.json")
    parser.add_argument("--output", help="Output HTML path; defaults beside results.json")
    args = parser.parse_args()

    result_path = Path(args.result).expanduser().resolve()
    if not result_path.is_file():
        parser.error(f"Result file does not exist: {result_path}")

    try:
        data = json.loads(result_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        parser.error(f"Invalid JSON at line {exc.lineno}: {result_path}")

    if not isinstance(data, dict):
        parser.error("The result root must be a JSON object")
    missing = [key for key in ("run_id", "summary", "cases") if key not in data]
    if missing:
        parser.error(f"Missing required field(s): {', '.join(missing)}")

    skill_root = Path(__file__).resolve().parent.parent
    template_path = skill_root / "assets" / "report-template.html"
    template = template_path.read_text(encoding="utf-8")
    if template.count("{{DATA_JSON}}") != 1:
        raise SystemExit("Report template must contain exactly one {{DATA_JSON}} placeholder")

    payload = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    # Keep user-controlled strings inside the script data literal.
    payload = payload.replace("</", "<\\/").replace("<!--", "<\\!--")
    payload = payload.replace("\u2028", "\\u2028").replace("\u2029", "\\u2029")
    html = template.replace("{{DATA_JSON}}", payload)

    output = (
        Path(args.output).expanduser().resolve()
        if args.output
        else result_path.with_name("report.html")
    )
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(html, encoding="utf-8")
    print(f"Report written: {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
