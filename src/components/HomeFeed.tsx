"use client";

import styles from "./HomeFeed.module.css";

type FeedTile = {
  label: string;
  title: string;
  text?: string;
  href?: string;
  size: "tall" | "medium" | "short";
  background: string;
  foreground?: string;
  meta: string;
  graphic: "bars" | "grid" | "stack" | "circles" | "none";
};

const tabs = ["All", "Mood", "Beliefs", "Fuel", "Sleep", "Patterns"];

const feedTiles: FeedTile[] = [
  {
    label: "Mood",
    title: "How are you feeling?",
    text: "Fast, obvious, one-thumb.",
    href: "/mood",
    size: "tall",
    background: "linear-gradient(180deg, #ff5c5c 0%, #ff8a5b 42%, #ffcf5a 100%)",
    foreground: "#111111",
    meta: "Check in",
    graphic: "circles",
  },
  {
    label: "Sleep",
    title: "86",
    text: "readiness",
    href: "/sleep",
    size: "medium",
    background: "linear-gradient(180deg, #dceeff 0%, #9fc8ff 100%)",
    foreground: "#101010",
    meta: "Last night",
    graphic: "bars",
  },
  {
    label: "Belief",
    title: "Move slower to go further",
    href: "/beliefs",
    size: "tall",
    background: "linear-gradient(180deg, #1a1a1a 0%, #3a3a3a 100%)",
    foreground: "#ffffff",
    meta: "Anchor",
    graphic: "stack",
  },
  {
    label: "Fuel",
    title: "Protein first",
    text: "Meals and momentum.",
    href: "/nutrition",
    size: "short",
    background: "linear-gradient(180deg, #fff2c7 0%, #ffc655 100%)",
    foreground: "#111111",
    meta: "Today",
    graphic: "grid",
  },
  {
    label: "Pattern",
    title: "Sleep up. Mood up.",
    text: "The feed should surface loops, not hide them.",
    size: "medium",
    background: "linear-gradient(180deg, #dbffe1 0%, #7be5a5 100%)",
    foreground: "#101010",
    meta: "Correlation",
    graphic: "bars",
  },
  {
    label: "Ontology",
    title: "Life graph",
    text: "Mind-map readable.",
    href: "/ontology",
    size: "tall",
    background: "linear-gradient(180deg, #e3d6ff 0%, #b396ff 100%)",
    foreground: "#111111",
    meta: "Relations",
    graphic: "grid",
  },
  {
    label: "Sleep",
    title: "7.4h",
    text: "median",
    href: "/sleep",
    size: "short",
    background: "linear-gradient(180deg, #eff7ff 0%, #c7def9 100%)",
    foreground: "#101010",
    meta: "30 days",
    graphic: "none",
  },
  {
    label: "Belief",
    title: "Identity before tactics",
    href: "/beliefs",
    size: "medium",
    background: "linear-gradient(180deg, #ffe3f0 0%, #f5b8d0 100%)",
    foreground: "#111111",
    meta: "Reminder",
    graphic: "circles",
  },
];

const desktopColumns: FeedTile[][] = [
  [feedTiles[0], feedTiles[3], feedTiles[7]],
  [feedTiles[1], feedTiles[4]],
  [feedTiles[2], feedTiles[6]],
  [feedTiles[5]],
];

const desktopSignals = [
  { label: "Mood drift", value: "watch" },
  { label: "Protein avg", value: "181g" },
  { label: "Sleep median", value: "7.4h" },
  { label: "Belief streak", value: "12d" },
];

function TileGraphic({ graphic }: { graphic: FeedTile["graphic"] }) {
  if (graphic === "bars") {
    return (
      <div className={styles.graphicBars}>
        {["#0e0e0e", "#2f6cff", "#ff6f61", "#ffd34f", "#ffffff"].map((color, index) => (
          <span
            key={color}
            style={{
              background: color,
              height: `${40 + index * 14}px`,
            }}
          />
        ))}
      </div>
    );
  }

  if (graphic === "grid") {
    return (
      <div className={styles.graphicGrid}>
        {["#101010", "#ffffff", "#ff5c5c", "#2f6cff", "#ffd34f", "#1fd083"].map((color) => (
          <span key={color} style={{ background: color }} />
        ))}
      </div>
    );
  }

  if (graphic === "stack") {
    return (
      <div className={styles.graphicStack}>
        <span style={{ background: "#ffffff" }} />
        <span style={{ background: "#ff7b54" }} />
        <span style={{ background: "#ffd34f" }} />
      </div>
    );
  }

  if (graphic === "circles") {
    return <div className={styles.graphicCircles} />;
  }

  return null;
}

function FeedTileCard({ tile }: { tile: FeedTile }) {
  const className = `${styles.tile} ${
    tile.size === "tall"
      ? styles.tileTall
      : tile.size === "medium"
        ? styles.tileMedium
        : styles.tileShort
  }`;

  const body = (
    <div
      className={styles.tileInner}
      style={{
        background: tile.background,
        color: tile.foreground ?? "#ffffff",
      }}
    >
      <div className={styles.tileChrome}>
        <div className={styles.graphicStripes} />
        <TileGraphic graphic={tile.graphic} />
      </div>

      <span className={styles.tileLabel}>{tile.label}</span>
      <h2 className={styles.tileTitle}>{tile.title}</h2>
      {tile.text ? <p className={styles.tileText}>{tile.text}</p> : null}

      <div className={styles.tileFooter}>
        <span className={styles.tileMeta}>{tile.meta}</span>
        <span className={styles.tileArrow}>+</span>
      </div>
    </div>
  );

  if (!tile.href) {
    return <div className={className}>{body}</div>;
  }

  return (
    <a href={tile.href} className={className}>
      {body}
    </a>
  );
}

export default function HomeFeed() {
  return (
    <div className={styles.page}>
      <div className={styles.mobileOnly}>
        <header className={styles.mobileHeader}>
          <div className={styles.mobileTopRow}>
            <div className={styles.brand}>
              <span className={styles.brandMark}>P</span>
              SAVY
            </div>

            <div className={styles.mobileActions}>
              <button type="button" className={styles.iconButton} aria-label="Create">
                +
              </button>
              <button type="button" className={styles.iconButton} aria-label="More">
                ...
              </button>
            </div>
          </div>

          <div className={styles.tabs}>
            {tabs.map((tab, index) => (
              <div key={tab} className={index === 0 ? styles.tabActive : styles.tab}>
                {tab}
              </div>
            ))}
          </div>
        </header>

        <main className={styles.feed}>
          {feedTiles.map((tile) => (
            <FeedTileCard key={`${tile.label}-${tile.title}`} tile={tile} />
          ))}
        </main>

        <nav className={styles.mobileNav} aria-label="Primary">
          <div className={styles.navPill}>Home</div>
          <div className={styles.navPill}>Search</div>
          <div className={styles.navPillCenter}>You</div>
        </nav>
      </div>

      <div className={styles.desktopOnly}>
        <div className={styles.desktopShell}>
          <aside className={styles.sidebar}>
            <div className={styles.sidebarBrand}>
              <span className={styles.brandMark}>S</span>
              SAVY
            </div>

            <div className={styles.sidebarNav}>
              {["Home", "Mood", "Beliefs", "Fuel", "Sleep", "Ontology"].map((item, index) => (
                <div key={item} className={index === 0 ? styles.sidebarItemActive : styles.sidebarItem}>
                  <span>{index === 0 ? "*" : "+"}</span>
                  {item}
                </div>
              ))}
            </div>
          </aside>

          <main className={styles.desktopMain}>
            <div className={styles.desktopTop}>
              <div className={styles.searchShell}>Search your patterns, notes, and tools</div>
            </div>

            <div className={styles.desktopTabs}>
              {tabs.map((tab, index) => (
                <div key={tab} className={index === 0 ? styles.desktopTabActive : styles.desktopTab}>
                  {tab}
                </div>
              ))}
            </div>

            <div className={styles.desktopColumns}>
              {desktopColumns.map((column, index) => (
                <div key={`column-${index}`} className={styles.desktopColumn}>
                  {column.map((tile) => (
                    <FeedTileCard key={`${tile.label}-${tile.title}`} tile={tile} />
                  ))}
                </div>
              ))}
            </div>
          </main>

          <aside className={styles.desktopRail}>
            <div className={styles.railCard}>
              <span className={styles.railLabel}>Signals</span>
              <h3>What wants attention</h3>
              <div className={styles.signalList}>
                {desktopSignals.map((signal) => (
                  <div key={signal.label} className={styles.signalRow}>
                    {signal.label}
                    <span>{signal.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.railCard}>
              <span className={styles.railLabel}>Live tools</span>
              <h3>Data stays intact</h3>
              <p>
                Mood, sleep, nutrition, beliefs, and ontology are still the real pages underneath this new feed architecture.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
