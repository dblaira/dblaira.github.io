import { SavySiteHeader } from "@/components/SavySiteHeader";
import { EditingShell } from "@/components/EditingShell";
import { EditablePageBackground } from "@/components/EditablePageBackground";

export const metadata = {
  title: "News Channel · SAVY",
  description: "Weekly AI briefings translated into systems, context, and product implications.",
};

const signals = [
  ["1", "Agent workflows", "AI is being turned into repeatable work loops.", "This supports Understood.app style systems."],
  ["2", "Context graphs", "AI needs structured memory.", "This is your ontology lane."],
  ["3", "Guardrails", "AI tools need rules and limits.", "This is where trust gets built."],
  ["4", "Coding models", "More models are built just for software work.", "Faster building for solo founders."],
  ["5", "Vendor AI stacks", "Companies are adding AI into existing tools.", "Less blank-page building. More assembly."],
];

const newsMap = [
  ["AI Secret", 10, "General AI news"],
  ["MyClaw", 9, "Agents + markets"],
  ["Damian Galarza", 8, "Agent systems"],
  ["xAI", 9, "Coding model"],
  ["OpenRouter", 9, "Model routing + guardrails"],
  ["Neo4j", 10, "Graphs + AI context"],
  ["Docker", 8, "MCP tools"],
  ["Jam", 7, "Debugging for agents"],
  ["NVIDIA", 8, "AI infrastructure"],
  ["GitHub Claude", 7, "Coding permissions"],
  ["Google", 7, "Privacy settings"],
];

const events = [
  {
    title: "xAI pushed a coding model",
    body: "Grok Build 0.1 points to coding models becoming their own class: idea to code to test to fix to ship. That matters when the work is made of many small software pieces: Understood.app, Telegram bot, AI rewrites, PDF export, ontology pipeline, and Notion workflows.",
  },
  {
    title: "OpenRouter added guardrails, speech, and more models",
    body: "OpenRouter is becoming less like a model menu and more like a control layer: models plus rules plus voice plus safety plus routing. AI apps now need a command center.",
  },
  {
    title: "Damian Galarza focused on agent loops vs workflows",
    body: "Use an agent when the path is unknown. Use a workflow when the steps are known. For Understood, rewriting an entry is a workflow; finding a hidden life pattern is closer to agent-like search.",
  },
  {
    title: "Neo4j kept pushing GraphRAG and context graphs",
    body: "Neo4j's enterprise message is that AI alone is not enough. AI needs connected facts. Your version is sharper and more human: narratives hide, relationships reveal.",
  },
  {
    title: "Docker kept pushing MCP",
    body: "MCP gives AI safe hands: a standard tool doorway into calendars, files, browsers, databases, and code. This is a big deal for personal operating systems.",
  },
  {
    title: "Jam connected debugging to AI agents",
    body: "Instead of telling an AI that an app broke, Jam can show the screen, console logs, network request, device, and bug context. That gives coding agents a real problem surface.",
  },
  {
    title: "NVIDIA kept saying useful AI has arrived",
    body: "The signal is broad but clear: AI is moving from side feature to computing layer. Useful directionally, less directly actionable than Neo4j, Docker, or OpenRouter.",
  },
  {
    title: "GitHub said Claude needs more permissions",
    body: "Coding agents need deeper tool access. More access means more power and more risk, so the winning pattern is access plus rules plus logs plus approval gates.",
  },
  {
    title: "Google updated privacy settings",
    body: "The future will be shaped by what AI remembers, what AI forgets, and who controls the memory. For Understood.app, memory is not just data. Memory is power.",
  },
  {
    title: "Product tools kept adding AI-adjacent pieces",
    body: "Linear, Stripe, Flova, Figma, Replit, and Magnific all point in the same direction: AI capability is being absorbed into existing work and business rails.",
  },
];

const stack = [
  ["MODEL", "The brain"],
  ["TOOLS", "The hands"],
  ["MEMORY", "The past"],
  ["GRAPH", "The relationships"],
  ["RULES", "The guardrails"],
  ["WORKFLOW", "The repeatable action"],
  ["PAYMENTS", "The business layer"],
];

const reportCard = [
  ["Agent tools", "A", "Strong week. MCP, Jam, Docker, Claude permissions."],
  ["Context graphs", "A", "Neo4j keeps owning the message."],
  ["Coding models", "A-", "xAI pushed a coding model."],
  ["Guardrails", "A-", "OpenRouter added useful control features."],
  ["Consumer AI news", "B", "Lots of headlines, less depth."],
  ["Visual AI", "B", "Flova and Magnific signal movement."],
  ["Business rails", "B+", "Stripe updates matter for app builders."],
];

function StrengthBar({ value }: { value: number }) {
  return (
    <span className="bar" aria-hidden>
      <span style={{ width: `${value * 10}%` }} />
    </span>
  );
}

function DataTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: string[][];
}) {
  return (
    <table>
      <thead>
        <tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.join("-")}>
            {row.map((cell, index) => (
              <td key={`${cell}-${index}`} data-label={columns[index]}>
                {index === 0 && columns[0] === "Rank" ? <strong className="rank">{cell}</strong> : cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function NewsChannelPage() {
  return (
    <EditingShell>
      <EditablePageBackground route="/news-channel" fallback="#F5F0E8">
        <main className="news-channel">
          <SavySiteHeader />

          <section className="hero">
            <div>
              <p className="eyebrow">News Channel</p>
              <h1>This Week&apos;s AI Brief</h1>
              <p className="date">June 1-6, 2026</p>
            </div>
            <aside className="summary-card" aria-label="Conclusion first">
              <h2>Conclusion first</h2>
              <p>AI is moving from &quot;chat&quot; to &quot;work systems.&quot;</p>
              {[
                ["Models", 8, "Stronger"],
                ["Agents", 9, "More useful"],
                ["Guardrails", 8, "More needed"],
                ["Context", 9, "Biggest theme"],
                ["Business use", 8, "Getting serious"],
              ].map(([label, value, note]) => (
                <div className="metric" key={label}>
                  <b>{label}</b>
                  <StrengthBar value={Number(value)} />
                  <span>{note}</span>
                </div>
              ))}
            </aside>
          </section>

          <section className="lead">
            <p>
              The main story is not one single model. The main story is this:
              AI tools now need memory, rules, context, payments, permissions,
              and workflows.
            </p>
            <p>That fits your world perfectly. This is ontology territory.</p>
          </section>

          <section className="dark-panel">
            <p className="eyebrow">This Week&apos;s AI Center of Gravity</p>
            <div className="gravity-box">AI is becoming infrastructure</div>
            <div className="branch-grid">
              <div><b>Coding models</b><span>xAI<br />GitHub Claude</span></div>
              <div><b>Agent workflows</b><span>Damian / Jam<br />Docker MCP<br />Neo4j context</span></div>
              <div><b>Guardrails</b><span>OpenRouter<br />Google privacy<br />Neo4j GraphRAG</span></div>
            </div>
          </section>

          <section className="panel">
            <h2>Top 5 signals</h2>
            <DataTable columns={["Rank", "Signal", "Plain meaning", "Why you should care"]} rows={signals} />
          </section>

          <section className="panel beige">
            <h2>AI news map</h2>
            <div className="news-map">
              {newsMap.map(([source, value, meaning]) => (
                <div className="news-card" key={source}>
                  <strong>{source}</strong>
                  <span>{meaning}</span>
                  <StrengthBar value={Number(value)} />
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <h2>What happened</h2>
            <div className="timeline">
              {events.map((event, index) => (
                <article className="event" key={event.title}>
                  <span className="number">{index + 1}</span>
                  <div>
                    <h3>{event.title}</h3>
                    <p>{event.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="panel beige">
            <h2>Biggest pattern</h2>
            <p className="large">AI is becoming a stack.</p>
            <div className="stack">
              {stack.map(([label, meaning]) => (
                <div key={label}><b>{label}</b><span>{meaning}</span></div>
              ))}
            </div>
          </section>

          <section className="panel">
            <h2>What this means for you</h2>
            <p className="large">For Understood.app: Do not build a chatbot. <strong>Build a relationship engine.</strong></p>
            <DataTable
              columns={["Market trend", "Your version"]}
              rows={[
                ["Context graphs", "Life relationship graph"],
                ["Guardrails", "Reflection rules"],
                ["Agent workflows", "Weekly review flows"],
                ["AI memory", "User history"],
                ["Model routing", "Different rewrites / lenses"],
                ["MCP tools", "Calendar, Notion, email, reminders"],
              ]}
            />
          </section>

          <section className="panel beige">
            <h2>Your highest-leverage moves</h2>
            {[
              ["Make entries structured", 10],
              ["Turn patterns into triples", 10],
              ["Keep AI inside workflows", 9],
              ["Add agent behavior only where discovery is needed", 8],
              ["Track provenance", 9],
            ].map(([label, value]) => (
              <div className="move" key={label}>
                <b>{label}</b>
                <StrengthBar value={Number(value)} />
              </div>
            ))}
          </section>

          <section className="panel">
            <h2>Simple decision chart</h2>
            <div className="decision-grid">
              <div><b>Known steps?</b><span>Yes: workflow. No: agent.</span></div>
              <div><b>Does the AI need memory?</b><span>One-time task: no graph. Repeated or relational task: graph.</span></div>
              <div><b>Does the AI take action?</b><span>No: lower risk. Yes: guardrails, logs, approval.</span></div>
            </div>
          </section>

          <section className="panel">
            <h2>Report card for the week</h2>
            <DataTable columns={["Area", "Grade", "Why"]} rows={reportCard} />
          </section>

          <footer className="final-line">
            <p>This week showed that AI is becoming less like a magic text box and more like a governed work system with memory, tools, rules, and business plumbing.</p>
          </footer>
        </main>

        <style>{`
          .news-channel {
            min-height: 100vh;
            background:
              linear-gradient(90deg, rgba(220, 20, 60, 0.08), transparent 20%, transparent 80%, rgba(232, 226, 216, 0.7)),
              #F5F0E8;
            color: #1A1A1A;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          }
          .hero,
          .lead,
          .panel,
          .dark-panel,
          .final-line {
            width: min(1120px, calc(100% - 32px));
            margin-left: auto;
            margin-right: auto;
          }
          .hero {
            display: grid;
            grid-template-columns: minmax(0, 1.1fr) minmax(300px, 0.9fr);
            gap: 42px;
            align-items: end;
            padding: 56px 0 34px;
          }
          .eyebrow {
            margin: 0 0 14px;
            color: #B01030;
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0.16em;
            text-transform: uppercase;
          }
          h1,
          h2,
          h3 {
            font-family: 'Playfair Display', Georgia, serif;
            letter-spacing: 0;
          }
          h1 {
            margin: 0;
            font-size: clamp(52px, 8vw, 108px);
            line-height: 0.9;
            font-weight: 700;
          }
          h2 {
            margin: 0 0 18px;
            font-size: clamp(32px, 4vw, 56px);
            line-height: 1;
            font-weight: 700;
          }
          h3 {
            margin: 0 0 8px;
            font-size: 25px;
            line-height: 1.1;
            font-weight: 600;
          }
          p {
            line-height: 1.65;
          }
          .date {
            margin: 18px 0 0;
            color: rgba(26, 26, 26, 0.55);
            font-weight: 700;
          }
          .summary-card,
          .panel {
            border: 1px solid rgba(26, 26, 26, 0.12);
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.72);
          }
          .summary-card {
            padding: 22px;
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.06);
          }
          .summary-card h2 {
            font-size: 31px;
          }
          .summary-card p {
            margin: 0 0 18px;
            font-size: 18px;
            font-weight: 800;
          }
          .metric,
          .move {
            display: grid;
            grid-template-columns: minmax(110px, 0.9fr) minmax(110px, 1fr) auto;
            gap: 12px;
            align-items: center;
            margin-top: 12px;
            font-size: 14px;
          }
          .bar {
            display: block;
            height: 12px;
            border-radius: 999px;
            background: rgba(26, 26, 26, 0.08);
            overflow: hidden;
          }
          .bar span {
            display: block;
            height: 100%;
            border-radius: inherit;
            background: linear-gradient(90deg, #DC143C, #B01030);
          }
          .lead {
            display: grid;
            gap: 16px;
            padding: 0 0 30px;
          }
          .lead p,
          .large {
            margin: 0;
            max-width: 850px;
            font-size: clamp(24px, 3vw, 40px);
            line-height: 1.15;
            font-weight: 800;
          }
          .dark-panel {
            margin-top: 34px;
            padding: 36px;
            border-radius: 8px;
            background: #0A0A0A;
            color: #F5F0E8;
            text-align: center;
          }
          .gravity-box {
            width: min(520px, 100%);
            margin: 0 auto 18px;
            padding: 20px 22px;
            border: 2px solid currentColor;
            border-radius: 8px;
            font-size: clamp(20px, 2.5vw, 32px);
            font-weight: 800;
          }
          .branch-grid,
          .news-map,
          .stack,
          .decision-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 14px;
            text-align: left;
          }
          .branch-grid div,
          .news-card,
          .stack div,
          .decision-grid div {
            padding: 18px;
            border: 1px solid rgba(26, 26, 26, 0.12);
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.66);
          }
          .branch-grid div {
            border-color: rgba(245, 240, 232, 0.25);
            background: rgba(255, 255, 255, 0.06);
          }
          .branch-grid b,
          .stack b,
          .decision-grid b {
            display: block;
            margin-bottom: 8px;
          }
          .branch-grid span {
            color: rgba(245, 240, 232, 0.7);
            line-height: 1.55;
          }
          .panel {
            margin-top: 34px;
            padding: 36px;
          }
          .panel.beige {
            background: #E8E2D8;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 15px;
          }
          th,
          td {
            padding: 13px 12px;
            border-bottom: 1px solid rgba(26, 26, 26, 0.12);
            text-align: left;
            vertical-align: top;
          }
          th {
            color: rgba(26, 26, 26, 0.55);
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0.1em;
            text-transform: uppercase;
          }
          .rank {
            color: #B01030;
          }
          .news-map {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .news-card {
            display: grid;
            gap: 10px;
          }
          .news-card span,
          .event p,
          .decision-grid span {
            color: rgba(26, 26, 26, 0.62);
          }
          .timeline {
            display: grid;
            gap: 18px;
          }
          .event {
            display: grid;
            grid-template-columns: 52px minmax(0, 1fr);
            gap: 18px;
            padding-top: 20px;
            border-top: 1px solid rgba(26, 26, 26, 0.12);
          }
          .event:first-child {
            padding-top: 0;
            border-top: 0;
          }
          .number {
            display: grid;
            place-items: center;
            width: 42px;
            height: 42px;
            border-radius: 50%;
            background: #DC143C;
            color: #FFFFFF;
            font-weight: 900;
          }
          .stack {
            grid-template-columns: repeat(7, 1fr);
            margin-top: 18px;
          }
          .stack div {
            min-height: 112px;
            text-align: center;
          }
          .stack b {
            color: #B01030;
            font-size: 12px;
            letter-spacing: 0.08em;
          }
          .move {
            grid-template-columns: minmax(220px, 0.9fr) minmax(140px, 1fr);
          }
          .final-line {
            margin-top: 34px;
            padding: 40px 32px 72px;
            border-radius: 8px 8px 0 0;
            background: #0A0A0A;
            color: #F5F0E8;
            text-align: center;
          }
          .final-line p {
            max-width: 900px;
            margin: 0 auto;
            font-family: 'Playfair Display', Georgia, serif;
            font-size: clamp(28px, 4vw, 52px);
            line-height: 1.06;
            font-weight: 700;
          }
          @media (max-width: 820px) {
            .hero,
            .branch-grid,
            .news-map,
            .stack,
            .decision-grid,
            .metric,
            .move {
              grid-template-columns: 1fr;
            }
            .hero {
              gap: 24px;
              padding-top: 36px;
            }
            .panel,
            .dark-panel {
              padding: 24px 18px;
            }
            .event {
              grid-template-columns: 1fr;
              gap: 12px;
            }
            thead {
              display: none;
            }
            table,
            tbody,
            tr,
            td {
              display: block;
            }
            tr {
              padding: 10px 0;
              border-bottom: 1px solid rgba(26, 26, 26, 0.12);
            }
            td {
              border: 0;
              padding: 4px 0;
            }
            td::before {
              content: attr(data-label);
              display: block;
              margin-bottom: 2px;
              color: rgba(26, 26, 26, 0.48);
              font-size: 11px;
              font-weight: 800;
              letter-spacing: 0.1em;
              text-transform: uppercase;
            }
          }
        `}</style>
      </EditablePageBackground>
    </EditingShell>
  );
}
