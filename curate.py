"""
curate.py
---------
Cleans up `category` and `saas_alternative` in data/software.json.

Order of precedence for every tool:
  1. data/overrides.json (hand-checked, always wins)
  2. Automatic rules based on GitHub topics first, then whole-word matches in the
     name/description. No loose substring matching.
  3. An existing `saas_alternative` is kept only if that SaaS brand is actually
     mentioned in the tool's name, description or topics.

Usage:
    python curate.py                 # curate ./data/software.json in place
    python curate.py path/to/file    # curate another file

fetch_software.py calls curate_file() automatically after each refresh.
"""

import json
import re
import sys
from pathlib import Path

DATA_PATH = Path("./data/software.json")
OVERRIDES_PATH = Path("./data/overrides.json")

# ── Merge near-duplicate alternative names so each SaaS has one page ──────────

ALT_ALIASES = {
    "Pocket / Instapaper": "Pocket",
    "Heroku": "Heroku / Vercel",
    "Google Drive": "Google Drive / Dropbox",
    "Todoist / Jira": "Jira",
    "SAP / QuickBooks": "QuickBooks",
}

# ── Brands we recognise, with the words that prove a tool really targets them ─
# alt name -> phrases (lowercase) that must appear in name/description/topics

BRAND_TOKENS = {
    "Google Analytics": ["google analytics", "google-analytics"],
    "Google Photos": ["google photos", "google-photos"],
    "Google Docs": ["google docs", "google-docs"],
    "Google Drive / Dropbox": ["google drive", "dropbox", "google-drive", "owncloud"],
    "Plex / Netflix": ["plex", "netflix", "jellyfin", "emby"],
    "NordVPN": ["vpn", "nordvpn", "wireguard"],
    "Zapier": ["zapier", "n8n", "workflow automation"],
    "Jira": ["jira", "issue tracker", "issue-tracker"],
    "GitHub": ["github alternative", "git hosting", "git server", "self-hosted git", "gitea", "forgejo", "gogs"],
    "GitHub Actions": ["github actions", "github-actions", "ci/cd runner"],
    "Evernote": ["evernote"],
    "Heroku / Vercel": ["heroku", "vercel", "netlify", "paas"],
    "Firebase": ["firebase", "backend-as-a-service", "baas"],
    "Docker Hub": ["docker hub", "docker registry", "container registry"],
    "DocuSign": ["docusign", "e-signature", "esign", "document signing", "document-signing"],
    "Trello": ["trello", "kanban"],
    "Datadog": ["datadog"],
    "Adobe Acrobat": ["adobe acrobat", "adobe-acrobat", "pdf editor", "pdf-editor"],
    "Pingdom": ["pingdom", "uptime monitoring", "uptime"],
    "Spotify": ["spotify", "music streaming", "music server", "music-server"],
    "Mailchimp": ["mailchimp", "newsletter", "mailing list"],
    "Feedly": ["feedly", "rss reader", "rss-reader", "news aggregator", "news-aggregator"],
    "Tableau / Looker": ["tableau", "looker", "business intelligence", "business-intelligence"],
    "Pocket": ["pocket", "instapaper", "read-it-later", "read it later", "bookmark"],
    "Bugsnag / Rollbar": ["bugsnag", "rollbar", "sentry", "error tracking", "error-tracking"],
    "1Password": ["1password", "lastpass", "bitwarden", "password manager", "password-manager"],
    "Zoom": ["zoom", "video conferencing", "video-conferencing", "jitsi"],
    "Intercom": ["intercom", "live chat", "customer support", "helpdesk", "help desk"],
    "Braze / Klaviyo": ["braze", "klaviyo"],
    "QuickBooks": ["quickbooks", "accounting", "invoicing", "erp"],
    "Contentful": ["contentful", "headless cms", "headless-cms"],
    "Medium / Substack": ["medium", "substack", "blogging platform"],
    "Okta / Auth0": ["okta", "auth0", "identity provider", "sso"],
    "Pushover": ["pushover", "push notification", "push-notification"],
    "Notion": ["notion"],
    "Slack": ["slack alternative", "alternative to slack", "slack-alternative", "replacement for slack", "open source slack"],
    "Retool": ["retool"],
    "Tailscale": ["tailscale", "zerotier"],
    "ngrok": ["ngrok"],
    "ChatGPT": ["chatgpt", "openai"],
    "NotebookLM": ["notebooklm"],
    "Airtable": ["airtable"],
    "Calendly": ["calendly", "cal.com"],
    "Confluence": ["confluence"],
    "Shopify": ["shopify alternative", "alternative to shopify", "shopify-alternative", "replacement for shopify", "open source shopify"],
}

# topic slug (without "-alternative") -> brand, for tools that tag themselves
TOPIC_BRANDS = {
    "google-analytics": "Google Analytics", "google-photos": "Google Photos", "google-docs": "Google Docs",
    "google-drive": "Google Drive / Dropbox", "dropbox": "Google Drive / Dropbox",
    "notion": "Notion", "slack": "Slack", "trello": "Trello", "jira": "Jira", "zapier": "Zapier",
    "heroku": "Heroku / Vercel", "vercel": "Heroku / Vercel", "netlify": "Heroku / Vercel",
    "firebase": "Firebase", "mailchimp": "Mailchimp", "evernote": "Evernote", "pocket": "Pocket",
    "docusign": "DocuSign", "airtable": "Airtable", "calendly": "Calendly", "zoom": "Zoom",
    "1password": "1Password", "lastpass": "1Password", "okta": "Okta / Auth0", "auth0": "Okta / Auth0",
    "intercom": "Intercom", "datadog": "Datadog", "pingdom": "Pingdom", "sentry": "Bugsnag / Rollbar",
    "github": "GitHub", "retool": "Retool", "chatgpt": "ChatGPT", "notebooklm": "NotebookLM",
    "ngrok": "ngrok", "tailscale": "Tailscale", "nordvpn": "NordVPN", "spotify": "Spotify",
    "feedly": "Feedly", "shopify": "Shopify", "confluence": "Confluence", "quickbooks": "QuickBooks",
    "adobe-acrobat": "Adobe Acrobat", "tableau": "Tableau / Looker", "plex": "Plex / Netflix",
    "netflix": "Plex / Netflix", "medium": "Medium / Substack", "substack": "Medium / Substack",
}

# ── Category rules: (category, topics that qualify, whole-word text patterns) ─
# Checked in order; first match wins.

RULES = [
    ("Resource Lists", {"awesome", "awesome-list", "awesome-lists", "list", "curated-list", "resources"},
     [r"^a (curated )?list of", r"^list of", r"\bcurated list\b", r"\bcollection of resources\b"]),
    ("Git & Code Hosting", {"git-server", "git-hosting", "gitea", "forgejo", "gitlab", "self-hosted-git", "code-hosting"},
     [r"\bgit (service|server|hosting)\b", r"\bself-hosted git\b"]),
    ("AI & LLMs", {"llm", "llms", "chatgpt", "openai", "ollama", "llama", "llamacpp", "rag", "ai-agent", "ai-agents",
                   "agents", "agent", "chatbot", "gpt", "local-llm", "genai", "langchain", "generative-ai",
                   "large-language-models", "ai-assistant", "machine-learning", "mcp", "deepseek", "ai-chat"},
     [r"\bllms?\b", r"\bchatgpt\b", r"\bai (agent|assistant|chat|platform)\b", r"\bopenai\b", r"\bollama\b"]),
    ("Automation", {"automation", "workflow", "workflow-automation", "zapier-alternative", "ipaas", "n8n",
                    "web-scraping", "scraper", "crawler", "rpa"},
     [r"\bworkflow automation\b", r"\bweb scraper\b"]),
    ("Low-Code & Internal Tools", {"low-code", "no-code", "internal-tools", "internal-tool", "app-builder", "admin-panel", "admin-panels"},
     [r"\blow-code\b", r"\bno-code\b", r"\binternal tools?\b"]),
    ("Monitoring", {"monitoring", "uptime", "status-page", "observability", "alerting", "apm", "tracing",
                    "opentelemetry", "healthcheck", "uptime-monitoring", "log-management", "logging", "error-tracking"},
     [r"\bmonitoring\b", r"\buptime\b", r"\bstatus page\b", r"\bobservability\b"]),
    ("Analytics", {"analytics", "web-analytics", "product-analytics", "business-intelligence", "bi", "data-visualization"},
     [r"\banalytics\b", r"\bbusiness intelligence\b"]),
    ("Auth & Security", {"authentication", "sso", "oidc", "oauth2", "idp", "identity", "password-manager", "2fa", "vault",
                         "secrets", "waf", "firewall", "pentest", "passkeys", "iam", "ssl", "acme"},
     [r"\bpassword manager\b", r"\bidentity provider\b", r"\bsingle sign-on\b", r"\bfirewall\b"]),
    ("Networking", {"vpn", "wireguard", "tunnel", "tunneling", "reverse-proxy", "proxy", "dns", "networking",
                    "nat-traversal", "ngrok-alternative", "tailscale", "zerotier", "nginx", "traefik", "caddy"},
     [r"\bvpn\b", r"\breverse proxy\b", r"\btunnels?\b"]),
    ("Deployment & Hosting", {"paas", "deployment", "heroku-alternative", "vercel-alternative", "netlify-alternative",
                              "ci-cd", "cicd", "devops", "docker-compose", "containers", "kubernetes", "container-management"},
     [r"\bpaas\b", r"\bdeployment platform\b", r"\bci/cd\b"]),
    ("Backend / BaaS", {"baas", "backend-as-a-service", "backend", "firebase-alternative", "supabase-alternative", "headless-backend"},
     [r"\bbackend as a service\b", r"\bbackend-as-a-service\b"]),
    ("Database", {"database", "databases", "postgresql", "mysql", "sqlite", "nosql", "vector-database", "redis",
                  "mongodb", "database-backup", "time-series-database", "etl", "data-pipeline"},
     [r"\bdatabase\b", r"\bpostgres(ql)?\b", r"\bsql\b"]),
    ("Chat & Messaging", {"chat", "messaging", "matrix", "xmpp", "slack-alternative", "discord-alternative", "mattermost",
                          "team-chat", "instant-messaging", "irc", "video-conferencing", "jitsi", "webrtc"},
     [r"\bteam chat\b", r"\bmessaging (platform|app|server)\b", r"\bvideo conferenc"]),
    ("Email", {"email", "smtp", "mail-server", "mailserver", "newsletter", "mailing-list", "email-marketing", "imap"},
     [r"\bmail server\b", r"\bnewsletter\b", r"\bmailing list\b"]),
    ("CRM & Marketing", {"crm", "marketing", "sales", "customer-support", "helpdesk", "livechat", "live-chat", "support"},
     [r"\bcrm\b", r"\bhelp ?desk\b", r"\blive chat\b"]),
    ("CMS & Blogging", {"cms", "blog", "blogging", "headless-cms", "static-site-generator", "website-builder", "ghost", "wordpress"},
     [r"\bcms\b", r"\bblogging platform\b", r"\bwebsite builder\b"]),
    ("Forms & Documents", {"forms", "form-builder", "survey", "surveys", "e-signature", "document-signing", "pdf", "pdf-editor", "docusign-alternative"},
     [r"\bpdf\b", r"\bsurvey\b", r"\bform builder\b", r"\be-?signature\b"]),
    ("Notes & Docs", {"notes", "note-taking", "knowledge-base", "wiki", "markdown", "documentation", "notion-alternative",
                      "pkm", "obsidian", "notebook", "second-brain", "memo", "collaborative-editing"},
     [r"\bnote[- ]taking\b", r"\bknowledge base\b", r"\bwiki\b", r"\bnotes? app\b"]),
    ("File Storage", {"file-sharing", "file-sync", "storage", "nextcloud", "cloud-storage", "s3", "object-storage",
                      "file-manager", "webdav", "dropbox-alternative", "file-hosting", "backup", "backups"},
     [r"\bfile (sharing|sync|storage|manager|hosting)\b", r"\bobject storage\b", r"\bcloud storage\b"]),
    ("Media & Photos", {"media-server", "music", "music-server", "photos", "photo-gallery", "video", "streaming", "podcast",
                        "audiobooks", "ebook", "ebooks", "jellyfin", "plex-alternative", "gallery", "music-player",
                        "video-editor", "comics", "manga", "emulation", "youtube", "ebook-reader",
                        "digital-library", "audiobook-player", "torrent", "torrent-client", "stremio"},
     [r"\bmedia server\b", r"\bmusic\b", r"\bphoto (management|gallery|library)\b", r"\bvideo (player|editor|downloader)\b"]),
    ("Project Management", {"project-management", "kanban", "task-management", "todo", "issue-tracker", "time-tracking",
                            "trello-alternative", "jira-alternative", "gantt", "agile", "scrum"},
     [r"\bproject management\b", r"\bkanban\b", r"\btask manage", r"\btime[- ]track"]),
    ("Productivity", {"bookmark", "bookmarks", "bookmark-manager", "rss", "rss-reader", "read-it-later", "news-aggregator",
                      "productivity", "recipe", "recipes", "calendar", "scheduling", "booking", "habit-tracker",
                      "office", "office-suite", "spreadsheet", "event-management", "linktree", "fitness",
                      "warranty-tracker", "price-tracker"},
     [r"\bbookmark\b", r"\brss\b", r"\brecipe\b", r"\bcalendar\b", r"\bbooking\b"]),
    ("Finance & ERP", {"finance", "accounting", "erp", "invoicing", "budgeting", "personal-finance", "ecommerce",
                       "e-commerce", "billing", "portfolio-tracker", "expense-tracker", "inventory", "pos"},
     [r"\bpersonal finance\b", r"\baccounting\b", r"\binvoic", r"\be-?commerce\b", r"\berp\b"]),
    ("Developer Tools", {"feature-flag", "feature-flags", "feature-flaggers", "feature-toggle", "i18n", "localization",
                         "internationalization", "package-management", "pypi-server", "pypi", "ab-testing", "sdk",
                         "cookie-banner", "consent-management", "ota", "code-push"},
     [r"\bfeature flags?\b", r"\bpypi\b"]),
    ("Homelab & Dashboards", {"homelab", "dashboard", "dashboards", "home-assistant", "home-automation", "iot",
                              "homeserver", "home-server", "smart-home", "startpage", "self-hosted-dashboard"},
     [r"\bhomelab\b", r"\bhome server\b", r"\bsmart home\b", r"\bstart ?page\b"]),
]



# Unambiguous topics that decide the category on their own (checked first,
# so e.g. a CRM with AI features is still filed under CRM).
STRONG_TOPICS = {
    "crm": "CRM & Marketing", "helpdesk": "CRM & Marketing",
    "accounting": "Finance & ERP", "invoicing": "Finance & ERP", "personal-finance": "Finance & ERP",
    "erp": "Finance & ERP", "ecommerce": "Finance & ERP", "e-commerce": "Finance & ERP", "budgeting": "Finance & ERP",
    "web-analytics": "Analytics", "product-analytics": "Analytics",
    "password-manager": "Auth & Security", "sso": "Auth & Security", "oidc": "Auth & Security",
    "idp": "Auth & Security", "captcha": "Auth & Security", "2fa": "Auth & Security",
    "cms": "CMS & Blogging", "headless-cms": "CMS & Blogging", "comments": "CMS & Blogging",
    "comment-system": "CMS & Blogging", "blogging": "CMS & Blogging",
    "mail-server": "Email", "mailserver": "Email", "smtp": "Email", "newsletter": "Email",
    "rss-reader": "Productivity", "bookmark-manager": "Productivity", "read-it-later": "Productivity",
    "music-server": "Media & Photos", "media-server": "Media & Photos", "photos": "Media & Photos",
    "photo-gallery": "Media & Photos", "jellyfin": "Media & Photos",
    "kanban": "Project Management", "project-management": "Project Management", "issue-tracker": "Project Management",
    "vpn": "Networking", "wireguard": "Networking", "reverse-proxy": "Networking", "ddns": "Networking",
    "dynamic-dns": "Networking", "dns": "Networking", "tunnel": "Networking", "tunneling": "Networking",
    "note-taking": "Notes & Docs", "pastebin": "Notes & Docs", "snippets": "Notes & Docs",
    "file-sharing": "File Storage", "file-sync": "File Storage", "cloud-storage": "File Storage",
    "status-page": "Monitoring", "uptime-monitoring": "Monitoring", "uptime": "Monitoring",
    "pdf": "Forms & Documents", "e-signature": "Forms & Documents", "form-builder": "Forms & Documents",
    "home-server": "Homelab & Dashboards", "homeserver": "Homelab & Dashboards", "homelab": "Homelab & Dashboards",
    "game-server": "Homelab & Dashboards", "home-assistant": "Homelab & Dashboards",
    "git-server": "Git & Code Hosting", "gitea": "Git & Code Hosting", "forgejo": "Git & Code Hosting",
}

def _norm(text):
    return re.sub(r"[-_/]+", " ", (text or "").lower())


def _haystack(tool):
    return _norm(" ".join([tool.get("name", ""), tool.get("description", ""), " ".join(tool.get("topics", []))]))


def classify(tool):
    topics = {t.lower() for t in tool.get("topics", [])}
    name = tool.get("name", "")
    desc = (tool.get("description") or "").lower()
    text = f"{_norm(name)} {desc}"

    # awesome-* repositories are lists
    if name.lower().startswith("awesome"):
        return "Resource Lists"

    for t in tool.get("topics", []):
        if t.lower() in STRONG_TOPICS:
            return STRONG_TOPICS[t.lower()]

    for category, topic_set, patterns in RULES:
        if topics & topic_set:
            return category
    for category, _topic_set, patterns in RULES:
        if any(re.search(p, text) for p in patterns):
            return category
    return "Other"


def phrase_in(haystack, phrase):
    phrase = _norm(phrase)
    return re.search(rf"(?<![a-z0-9]){re.escape(phrase)}(?![a-z0-9])", haystack) is not None


def infer_alternative(tool, existing):
    hay = _haystack(tool)

    # 1) keep the existing mapping only if the brand is genuinely mentioned
    existing = ALT_ALIASES.get(existing, existing)
    if existing and any(phrase_in(hay, p) for p in BRAND_TOKENS.get(existing, [])):
        return existing

    # 2a) self-hosted VPN servers are alternatives to commercial VPN services
    if any(t.lower() == "vpn" for t in tool.get("topics", [])):
        return "NordVPN"

    # 2) explicit "<brand>-alternative" topics
    for t in tool.get("topics", []):
        m = re.match(r"^(.+?)-alternatives?$", t.lower())
        if m and m.group(1) in TOPIC_BRANDS:
            return TOPIC_BRANDS[m.group(1)]

    # 3) description says "alternative to <brand>"
    desc = (tool.get("description") or "").lower()
    m = re.search(r"(?:alternative|replacement) (?:to|for) ([a-z0-9. ]+)", desc)
    if m:
        for key, brand in TOPIC_BRANDS.items():
            if phrase_in(_norm(m.group(1)), key):
                return brand
    return ""


def _slugify(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def _owner(tool):
    parts = tool.get("github_url", "").rstrip("/").split("/")
    return parts[-2] if len(parts) >= 2 else ""


def curate(software):
    overrides = {}
    if OVERRIDES_PATH.exists():
        overrides = json.loads(OVERRIDES_PATH.read_text(encoding="utf-8")).get("overrides", {})

    for tool in software:
        repo = "/".join(tool.get("github_url", "").rstrip("/").split("/")[-2:])
        ov = overrides.get(repo) or overrides.get(tool["name"])
        if ov and "category" in ov:
            tool["category"] = ov["category"]
            tool["saas_alternative"] = ALT_ALIASES.get(ov["saas_alternative"], ov["saas_alternative"])
            if ov.get("display_name"):
                tool["name"] = ov["display_name"]   # e.g. repo "server" -> "Nextcloud"
            continue
        if ov and ov.get("display_name"):
            tool["name"] = ov["display_name"]   # name-only override: labels stay automatic
        tool["category"] = classify(tool)
        if tool["category"] == "Resource Lists":
            tool["saas_alternative"] = ""   # lists are not alternatives to one product
        else:
            tool["saas_alternative"] = infer_alternative(tool, tool.get("saas_alternative", ""))

    # Any two tools that still share a name get the owner appended, so every card is unambiguous
    counts = {}
    for tool in software:
        counts[tool["name"]] = counts.get(tool["name"], 0) + 1
    for tool in software:
        if counts[tool["name"]] > 1:
            tool["name"] = f'{tool["name"]} ({_owner(tool)})'

    # Keep slugs unique and in sync with the (possibly renamed) display names
    used = set()
    for tool in software:
        slug = _slugify(tool["name"]) or _slugify(_owner(tool))
        if slug in used:
            slug = f"{slug}-{_slugify(_owner(tool))}"
        used.add(slug)
        tool["slug"] = slug
    return software


def curate_file(path=DATA_PATH):
    path = Path(path)
    data = json.loads(path.read_text(encoding="utf-8"))
    data["software"] = curate(data["software"])
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Curated {len(data['software'])} tools in {path}")


if __name__ == "__main__":
    curate_file(sys.argv[1] if len(sys.argv) > 1 else DATA_PATH)
