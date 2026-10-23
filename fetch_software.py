"""
fetch_software.py
-----------------
Fetches open-source self-hosted alternatives from GitHub and outputs ./data/software.json

Usage:
    python fetch_software.py                        # anonymous (60 req/hr)
    GITHUB_TOKEN=ghp_xxx python fetch_software.py  # authenticated (5000 req/hr)
"""

import os
import re
import json
import time
import logging
from datetime import datetime, timezone
from pathlib import Path

import requests

# ── Config ────────────────────────────────────────────────────────────────────

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")
OUTPUT_PATH  = Path("./data/software.json")
PER_PAGE     = 100          # max allowed by GitHub
MAX_PAGES    = 5            # per topic  → up to 500 repos per topic
SLEEP_BETWEEN = 1.2         # seconds between API calls (stay well under rate limits)

TOPICS = [
    "self-hosted",
    "open-source-alternative",
    "awesome-selfhosted",
]

# ── SaaS mapping  (repo-name fragment → well-known SaaS brand) ───────────────

SAAS_MAP: dict[str, str] = {
    # Analytics
    "plausible":      "Google Analytics",
    "matomo":         "Google Analytics",
    "umami":          "Google Analytics",
    "fathom":         "Google Analytics",
    "countly":        "Google Analytics",
    "posthog":        "Mixpanel / Amplitude",
    "ackee":          "Google Analytics",
    # Chat / Messaging
    "mattermost":     "Slack",
    "rocket.chat":    "Slack",
    "zulip":          "Slack",
    "matrix":         "Discord",
    "element":        "Discord",
    "chatwoot":       "Intercom",
    "papercups":      "Intercom",
    # CMS / Blogging
    "ghost":          "Medium / Substack",
    "strapi":         "Contentful",
    "directus":       "Airtable",
    "payload":        "Contentful",
    "keystatic":      "Contentful",
    "wordpress":      "Wix / Squarespace",
    "keystonejs":     "Contentful",
    # CRM / Support
    "twenty":         "Salesforce",
    "erxes":          "HubSpot",
    "monica":         "HubSpot",
    "espocrm":        "Salesforce",
    # Storage / Files
    "nextcloud":      "Google Drive / Dropbox",
    "owncloud":       "Google Drive / Dropbox",
    "seafile":        "Dropbox",
    "minio":          "Amazon S3",
    "garage":         "Amazon S3",
    "filebrowser":    "Google Drive",
    # Dev / Backend
    "appwrite":       "Firebase",
    "supabase":       "Firebase",
    "pocketbase":     "Firebase",
    "nhost":          "Firebase",
    "hasura":         "Firebase",
    # CI/CD / DevOps
    "gitea":          "GitHub",
    "gogs":           "GitHub",
    "forgejo":        "GitHub",
    "gitlab":         "GitHub",
    "drone":          "GitHub Actions",
    "woodpecker":     "GitHub Actions",
    "jenkins":        "CircleCI",
    "concourse":      "CircleCI",
    # Email
    "mailu":          "Google Workspace",
    "mailcow":        "Google Workspace",
    "listmonk":       "Mailchimp",
    "keila":          "Mailchimp",
    "mautic":         "Mailchimp / HubSpot",
    # Password / Auth
    "vaultwarden":    "1Password / LastPass",
    "bitwarden":      "1Password",
    "authelia":       "Okta",
    "authentik":      "Okta",
    "keycloak":       "Okta / Auth0",
    # Project Management
    "plane":          "Jira",
    "linear":         "Jira",
    "taiga":          "Jira / Trello",
    "leantime":       "Jira",
    "vikunja":        "Todoist / Jira",
    # Notes / Docs
    "outline":        "Notion",
    "bookstack":      "Confluence",
    "wiki.js":        "Confluence",
    "hedgedoc":       "Google Docs",
    "affine":         "Notion",
    "silverbullet":   "Notion",
    # Video / Media
    "peertube":       "YouTube",
    "jellyfin":       "Plex / Netflix",
    "navidrome":      "Spotify",
    "airsonic":       "Spotify",
    "immich":         "Google Photos",
    "photoprism":     "Google Photos",
    "piwigo":         "Google Photos",
    # Monitoring
    "grafana":        "Datadog",
    "netdata":        "Datadog",
    "prometheus":     "Datadog",
    "uptime-kuma":    "Pingdom",
    "healthchecks":   "PagerDuty",
    # E-commerce
    "medusajs":       "Shopify",
    "saleor":         "Shopify",
    "solidus":        "Shopify",
    "erpnext":        "SAP / QuickBooks",
    "dolibarr":       "QuickBooks",
}

# ── Category mapping (language / topics → category) ──────────────────────────

CATEGORY_KEYWORDS: list[tuple[list[str], str]] = [
    (["analytic", "statistic", "tracking", "metric", "insight"],          "Analytics"),
    (["chat", "messaging", "slack", "matrix", "mattermost", "discord"],   "Chat & Messaging"),
    (["cms", "content", "blog", "headless", "strapi", "ghost"],           "CMS & Blogging"),
    (["crm", "customer", "marketing", "lead", "salesforce", "hubspot"],   "CRM & Marketing"),
    (["storage", "file", "s3", "drive", "dropbox", "cloud"],              "File Storage"),
    (["database", "db", "sql", "postgresql", "mysql", "mongo"],           "Database"),
    (["backend", "baas", "firebase", "supabase", "api", "serverless"],    "Backend / BaaS"),
    (["git", "ci", "cd", "devops", "pipeline", "registry", "drone"],      "DevOps & Git"),
    (["email", "mail", "smtp", "newsletter", "listmonk"],                  "Email"),
    (["password", "vault", "secret", "auth", "sso", "oauth", "ldap"],     "Auth & Security"),
    (["project", "task", "kanban", "board", "issue", "ticket", "jira"],   "Project Management"),
    (["note", "wiki", "doc", "knowledge", "notion", "confluence"],        "Notes & Docs"),
    (["video", "media", "stream", "photo", "gallery", "music"],           "Media & Photos"),
    (["monitor", "alert", "uptime", "metric", "log", "observ"],           "Monitoring"),
    (["ecommerce", "shop", "store", "payment", "erp", "accounting"],      "E-commerce & ERP"),
    (["vpn", "proxy", "network", "dns", "firewall", "tunnel"],            "Networking"),
    (["home", "automation", "iot", "smart", "assistant", "dashboard"],    "Home Automation"),
    (["bookmark", "rss", "feed", "read", "browser", "search"],            "Productivity"),
]

# ── Helpers ───────────────────────────────────────────────────────────────────

logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(message)s")
log = logging.getLogger(__name__)


def get_headers() -> dict:
    h = {"Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28"}
    if GITHUB_TOKEN:
        h["Authorization"] = f"Bearer {GITHUB_TOKEN}"
    return h


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    text = re.sub(r"-+", "-", text)
    return text.strip("-")


def infer_saas(name: str, description: str) -> str:
    combined = (name + " " + (description or "")).lower()
    for keyword, saas in SAAS_MAP.items():
        if keyword in combined:
            return saas
    return ""


def infer_category(name: str, description: str, topics: list[str]) -> str:
    combined = " ".join([name, description or "", *topics]).lower()
    for keywords, category in CATEGORY_KEYWORDS:
        if any(kw in combined for kw in keywords):
            return category
    return "Other"


def check_has_docker(topics: list[str]) -> bool:
    docker_topics = {"docker", "docker-compose", "dockerfile", "container", "kubernetes", "helm"}
    return bool(docker_topics & set(topics))


def safe_get(url: str, params: dict | None = None, retries: int = 3) -> dict | None:
    """GET with automatic retry on rate-limit (429/403) and transient errors."""
    headers = get_headers()
    for attempt in range(retries):
        try:
            resp = requests.get(url, headers=headers, params=params, timeout=15)
            if resp.status_code == 200:
                return resp.json()
            if resp.status_code in (403, 429):
                reset = int(resp.headers.get("X-RateLimit-Reset", time.time() + 60))
                wait  = max(reset - int(time.time()), 10)
                log.warning("Rate limited – sleeping %ds …", wait)
                time.sleep(wait)
                continue
            log.warning("HTTP %s for %s", resp.status_code, url)
            return None
        except requests.RequestException as exc:
            log.warning("Request error (%s) – retry %d/%d", exc, attempt + 1, retries)
            time.sleep(3 * (attempt + 1))
    return None


def fetch_topic_repos(topic: str) -> list[dict]:
    """Search GitHub for repos by topic, returning raw API items."""
    results: list[dict] = []
    for page in range(1, MAX_PAGES + 1):
        log.info("  topic=%s  page=%d", topic, page)
        data = safe_get(
            "https://api.github.com/search/repositories",
            params={
                "q":        f"topic:{topic}",
                "sort":     "stars",
                "order":    "desc",
                "per_page": PER_PAGE,
                "page":     page,
            },
        )
        if not data or not data.get("items"):
            break
        results.extend(data["items"])
        # Stop if we've consumed all results
        if len(data["items"]) < PER_PAGE:
            break
        time.sleep(SLEEP_BETWEEN)
    return results


def normalise(raw: dict) -> dict:
    """Convert a raw GitHub repo item into our clean schema."""
    name        = raw.get("name", "")
    description = (raw.get("description") or "").strip()
    topics      = raw.get("topics") or []
    license_obj = raw.get("license") or {}
    updated_raw = raw.get("updated_at") or raw.get("pushed_at") or ""

    # Normalise date to ISO date-only (YYYY-MM-DD)
    try:
        last_updated = datetime.fromisoformat(
            updated_raw.replace("Z", "+00:00")
        ).date().isoformat()
    except (ValueError, AttributeError):
        last_updated = ""

    return {
        "name":            name,
        "slug":            slugify(name),
        "description":     description,
        "github_url":      raw.get("html_url", ""),
        "stars":           raw.get("stargazers_count", 0),
        "language":        raw.get("language") or "",
        "last_updated":    last_updated,
        "license":         license_obj.get("spdx_id") or license_obj.get("name") or "",
        "saas_alternative": infer_saas(name, description),
        "category":        infer_category(name, description, topics),
        "has_docker":      check_has_docker(topics),
        "topics":          topics,
    }


# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> None:
    if not GITHUB_TOKEN:
        log.warning("No GITHUB_TOKEN set – using anonymous rate limit (60 req/hr).")
    else:
        log.info("Using authenticated requests (5 000 req/hr).")

    seen_ids: set[str] = set()
    all_repos: list[dict] = []

    for topic in TOPICS:
        log.info("Fetching topic: %s", topic)
        raw_items = fetch_topic_repos(topic)
        log.info("  → %d raw items", len(raw_items))

        for item in raw_items:
            repo_id = str(item.get("id", ""))
            if repo_id in seen_ids:
                continue
            seen_ids.add(repo_id)

            # Skip forks and archived repos
            if item.get("fork") or item.get("archived"):
                continue
            # Skip tiny repos (likely spam / placeholders)
            if item.get("stargazers_count", 0) < 10:
                continue

            all_repos.append(normalise(item))

        time.sleep(SLEEP_BETWEEN)

    # Sort by stars descending
    all_repos.sort(key=lambda r: r["stars"], reverse=True)

    log.info("Total unique repos collected: %d", len(all_repos))

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(
        json.dumps(
            {
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "total":        len(all_repos),
                "software":     all_repos,
            },
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )
    log.info("Saved → %s", OUTPUT_PATH)


if __name__ == "__main__":
    main()
