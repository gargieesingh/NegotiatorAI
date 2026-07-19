import json
import re
import sys

def extract_text(pdf_path: str) -> str:
    try:
        import fitz
        document = fitz.open(pdf_path)
        return "\n".join(page.get_text() for page in document)
    except Exception:
        import pdfplumber
        with pdfplumber.open(pdf_path) as document:
            return "\n".join(page.extract_text() or "" for page in document.pages)

def labelled_value(text: str, labels: list[str]) -> str | None:
    for label in labels:
        match = re.search(rf"(?im)^\s*{re.escape(label)}\s*[:\-]\s*(.+)$", text)
        if match:
            return match.group(1).strip()
    return None

def parse_events(text: str) -> list[dict]:
    names = ["Haldi", "Mehendi", "Sangeet", "Wedding Ceremony", "Wedding", "Reception"]
    result = []
    for name in names:
        match = re.search(rf"(?i)\b{name}\b(?:[^\n]*?(\d+)\s*(?:hours?|hrs?))?", text)
        if match:
            result.append({"name": name, "coverage_hours": int(match.group(1) or 0)})
    return result

def main() -> None:
    text = extract_text(sys.argv[1])
    date_match = re.search(r"\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})\b", text, re.I)
    venue = labelled_value(text, ["Venue", "Location", "Venue Name"]) or ""
    city = labelled_value(text, ["City", "Location City"]) or ""
    spec = {
        "wedding_date": date_match.group(0) if date_match else "",
        "venue": {"name": venue, "city": city},
        "events": parse_events(text),
        "coverage_type": "photography_plus_videography" if re.search(r"(?i)videography|video", text) else "photography_only",
        "drone_coverage_required": bool(re.search(r"(?i)drone", text)),
        "albums_required": bool(re.search(r"(?i)album", text)),
        "special_requests": []
    }
    print(json.dumps({"job_spec": spec, "text": text[:2000]}))

if __name__ == "__main__":
    main()
