// components/developer/SnippetData.ts

export const ALL_SNIPPETS: Record<string, string> = {
    // ── PYTHON SNIPPETS ──
    "py-install": `pip install scrubbe-sdk`,
    "py-quickstart": `import asyncio
from scrubbe import Scrubbe

async def main():
    async with Scrubbe(api_key="sk-...") as client:
        # Create an incident
        incident = await client.incident.create(
            title="Payment gateway degraded",
            priority="P1",
            service="payment-api",
        )
        print(incident["incident_id"])  # SI-000042

        # List open incidents (lazy pagination)
        async for inc in client.incident.list(state="INVESTIGATING"):
            print(inc["incident_id"], inc["title"])

        # Subscribe to live events
        async for event in client.incident.subscribe(incident["incident_id"]):
            print(event["type"], event["data"])

asyncio.run(main())`,
    "py-auth": `# 1. Explicit API key
client = Scrubbe(api_key="sk-...")

# 2. OAuth2 client credentials (auto-refresh)
client = Scrubbe(client_id="...", client_secret="...")

# 3. Environment variables (recommended for CI)
client = Scrubbe()

# 4. Named profile in ~/.scrubbe/credentials
client = Scrubbe(profile="production")`,
    "py-config": `from scrubbe import Scrubbe
from scrubbe.utils.retry import RetryOptions

client = Scrubbe(
    api_key="sk-...",
    base_url="https://api.scrubbe.com",     # default
    connect_timeout_ms=5_000,
    read_timeout_ms=30_000,
    retry=RetryOptions(
        max_attempts=3,
        base_delay_ms=500,
        max_delay_ms=30_000,
        respect_retry_after=True,           # honour 429 headers
    ),
)`,
    "py-errors": `from scrubbe import (
    GovernanceApprovalRequiredError,
    RateLimitedError,
    UnauthenticatedError,
    ScrubbeAPIError,
)

try:
    await client.playbook.run("PB-0001", incident_id="SI-000042")
except GovernanceApprovalRequiredError as e:
    print(f"Approval required: {e.approval_id}")
    print(f"Approve at: {e.approval_url}")
except RateLimitedError as e:
    print(f"Rate limited. Retry after {e.retry_after}s")`,
    "py-incident": `async with Scrubbe(api_key="sk-...") as client:
    inc = await client.incident.create(
        title="DB replica lag spike",
        priority="P2",
        service="orders-db",
    )
    await client.timeline.add(
        incident_id=inc["incident_id"],
        message="Replica lag reached 42s at 14:03 UTC",
        source="monitoring",
    )
    await client.incident.resolve(
        incident_id=inc["incident_id"],
        resolution="Replica re-synced after network blip.",
    )`,
    "py-mcp": `async with Scrubbe(api_key="sk-...") as client:
    answer = await client.mcp.query(
        q="What caused the payment outages in Q2?",
    )
    print(answer["answer"])`,
    "py-dev": `pip install -e ".[dev]"
ruff check src/ tests/           # lint
mypy src/scrubbe                 # type-check
pytest --cov=scrubbe tests/      # tests`,

    // ── TYPESCRIPT SNIPPETS ──
    "ts-install-npm": `npm install @scrubbe/sdk`,
    "ts-install-yarn": `yarn add @scrubbe/sdk`,
    "ts-install-pnpm": `pnpm add @scrubbe/sdk`,
    "ts-quickstart": `import { Scrubbe } from '@scrubbe/sdk';\n\nconst client = new Scrubbe({ apiKey: process.env.SCRUBBE_API_KEY });\n\nconst incident = await client.incident.create({\n  title: 'Payment gateway degraded',\n  priority: 'P1',\n  service: 'payment-api',\n});`,
    "ts-auth": `const client = new Scrubbe({ apiKey: 'sk-...' });\nconst client2 = new Scrubbe({ clientId: '...', clientSecret: '...' });`,
    "ts-config": `const client = new Scrubbe({\n  apiKey: '...',\n  baseUrl: 'https://api.scrubbe.com',\n  timeout: { connect: 5000, read: 30000 }\n});`,
    "ts-errors": `try {\n  await client.playbook.run('PB-0001', { incident_id: 'SI-000042' });\n} catch (err) {\n  if (err instanceof GovernanceApprovalRequiredError) {\n    console.log(err.approvalId);\n  }\n}`,
    "ts-dev": `npm install\nnpm run typecheck\nnpm test\nnpm run build`,

    // ── JAVA SNIPPETS ──
    "jv-maven": `<dependency>\n    <groupId>com.scrubbe</groupId>\n    <artifactId>scrubbe-sdk</artifactId>\n    <version>1.0.0</version>\n</dependency>`,
    "jv-gradle": `implementation("com.scrubbe:scrubbe-sdk:1.0.0")`,
    "jv-sbt": `libraryDependencies += "com.scrubbe" % "scrubbe-sdk" % "1.0.0"`,
    "jv-ivy": `<dependency org="com.scrubbe" name="scrubbe-sdk" rev="1.0.0"/>`,
    "jv-grape": `@Grapes(\n    @Grab(group='com.scrubbe', module='scrubbe-sdk', version='1.0.0')\n)`,
    "jv-lein": `[com.scrubbe/scrubbe-sdk "1.0.0"]`,
    "jv-buildr": `'com.scrubbe:scrubbe-sdk:jar:1.0.0'`,
    "jv-bld": `dependency("com.scrubbe", "scrubbe-sdk", "1.0.0")`,
    "jv-quickstart": `import com.scrubbe.ScrubbeClient;\n\ntry (ScrubbeClient client = ScrubbeClient.builder().apiKey("sk-...").build()) {\n    Incident incident = client.incident().create(CreateIncidentParams.builder().title("Payment gateway degraded").build());\n}`,
    "jv-auth": `ScrubbeClient client = ScrubbeClient.builder().apiKey("sk-...").build();`,
    "jv-config": `ScrubbeClient client = ScrubbeClient.builder().timeout(Duration.ofSeconds(30)).build();`,
    "jv-errors": `try {\n    client.playbook().run("PB-0001", params);\n} catch (GovernanceApprovalRequiredException ex) {\n    System.out.println(ex.approvalId());\n}`,
    "jv-incident": `Incident inc = client.incident().create(CreateIncidentParams.builder().title("DB replication lag").build());`,
    "jv-mcp": `McpResult result = client.mcp().query(McpQueryParams.builder().query("What caused outages?").build());`,
    "jv-dev": `mvn verify\nmvn javadoc:javadoc`,
    "jv-pom": `<?xml version="1.0" encoding="UTF-8"?>\n<project xmlns="http://maven.apache.org/POM/4.0.0">\n  <modelVersion>4.0.0</modelVersion>\n  <groupId>com.scrubbe</groupId>\n  <artifactId>scrubbe-sdk</artifactId>\n  <version>1.0.0</version>\n</project>`,

    // ── C# SNIPPETS ──
    "cs-install-dotnet": `dotnet add package Scrubbe.Sdk`,
    "cs-install-nuget": `Install-Package Scrubbe.Sdk`,
    "cs-quickstart": `using Scrubbe.Sdk;\nusing var client = new ScrubbeClient(new ScrubbeOptions { ApiKey = "sk-..." });\nvar incident = await client.Incident.CreateAsync(new CreateIncidentParams("Gateway error"));`,
    "cs-auth": `var client = new ScrubbeClient(new ScrubbeOptions { ApiKey = "sk-..." });`,
    "cs-config": `var client = new ScrubbeClient(new ScrubbeOptions { Timeout = TimeSpan.FromSeconds(30) });`,
    "cs-di": `builder.Services.AddSingleton(_ => new ScrubbeClient(new ScrubbeOptions { ApiKey = "..." }));`,
    "cs-errors": `try { await client.Playbook.RunAsync("PB-0001", params); } catch (GovernanceApprovalRequiredException ex) { }`,
    "cs-incident": `var inc = await client.Incident.CreateAsync(new CreateIncidentParams(Title: "DB replication lag"));`,
    "cs-mcp": `var result = await client.Mcp.QueryAsync(new McpQueryParams("What caused payment outages?"));`,
    "cs-dev": `dotnet build\ndotnet test`,

    // ── GO SNIPPETS ──
    "go-install": `go get github.com/scrubbe/sdk-go`,
    "go-quickstart": `package main\nimport (\n    "context"\n    "fmt"\n    scrubbe "github.com/scrubbe/sdk-go"\n)\nfunc main() {\n    client, _ := scrubbe.New(scrubbe.Options{APIKey: "sk-..."})\n    iter := client.Incident.List(scrubbe.ListIncidentsParams{State: "INVESTIGATING"})\n}`,
    "go-auth": `client, _ := scrubbe.New(scrubbe.Options{APIKey: "sk-..."})`,
    "go-config": `client, _ := scrubbe.New(scrubbe.Options{ConnectTimeout: 5 * time.Second})`,
    "go-errors": `if errors.As(err, &govErr) { fmt.Println(govErr.ApprovalID) }`,
    "go-incident": `inc, err := client.Incident.Create(ctx, scrubbe.CreateIncidentParams{Title: "Replica lag"})`,
    "go-mcp": `result, err := client.Mcp.Query(ctx, scrubbe.McpQueryParams{Query: "What caused outages?"})`,
    "go-dev": `make test\nmake lint`,

    // ── CLI SNIPPETS ──
    "cli-install-brew": `brew tap scrubbe/tap\nbrew install scrubbe`,
    "cli-install-sh": `curl -sSL https://get.scrubbe.com/cli | sh`,
    "cli-install-npm": `npm install -g @scrubbe/cli`,
    "cli-auth": `scrubbe auth login\nscrubbe auth status`,
    "cli-incidents": `scrubbe incident list\nscrubbe incident create --title "DB replica lag"`,
    "cli-playbook": `scrubbe playbook run PB-rollback-payments --incident SI-000042`,
    "cli-config": `scrubbe config set output json\n# Config file: ~/.scrubbe/config.yaml`,

    "wh-verify": `import hashlib, hmac\n\ndef verify_signature(payload: bytes, sig: str, secret: str) -> bool:\n    expected = hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()\n    return hmac.compare_digest(f"sha256={expected}", sig)`
};