import Foundation

struct LeverageSection: Identifiable, Codable, Equatable {
    let id: String
    let title: String
    let eyebrow: String
    let headline: String
    let summary: String
    let items: [LeverageItem]

    func replacingItems(_ items: [LeverageItem]) -> LeverageSection {
        LeverageSection(
            id: id,
            title: title,
            eyebrow: eyebrow,
            headline: headline,
            summary: summary,
            items: items
        )
    }
}

struct LeverageItem: Identifiable, Codable, Equatable {
    let id: String
    let kicker: String
    let title: String
    let summary: String
    let body: String
}

extension LeverageSection {
    static let seed: [LeverageSection] = [
        LeverageSection(
            id: "news-channel",
            title: "News Channel",
            eyebrow: "NEWS CHANNEL",
            headline: "Signals worth compounding.",
            summary: "AI and technology briefings translated into context, systems, and product implications.",
            items: [
                LeverageItem(
                    id: "weekly-ai-brief-2026-06-01",
                    kicker: "JUN 1-6, 2026",
                    title: "This Week's AI Brief",
                    summary: "AI is moving from chat to work systems: models, agents, context graphs, guardrails, and business rails are becoming one stack.",
                    body: "The main story is not one model. AI tools now need memory, rules, context, payments, permissions, and workflows. The useful direction for Understood is not a chatbot. It is a relationship engine built around structured entries, triples, workflow guardrails, and provenance."
                ),
                LeverageItem(
                    id: "context-graphs",
                    kicker: "SYSTEMS",
                    title: "Context graphs are the real interface",
                    summary: "The useful layer is not another chatbot. It is the structure that lets tools remember what matters.",
                    body: "The highest-leverage briefings are the ones that reveal durable structure. SAVY should highlight the pattern behind the update, not just the update itself."
                ),
            ]
        ),
        LeverageSection(
            id: "field-essays",
            title: "Field Essays",
            eyebrow: "FIELD ESSAYS",
            headline: "Patterns found in the world.",
            summary: "Essays about recurring forces: incentives, attention, morality, energy, and asymmetry.",
            items: [
                LeverageItem(
                    id: "moral-code",
                    kicker: "ESSAY",
                    title: "Cost reveals belief",
                    summary: "A person can say almost anything when the bill lands somewhere else.",
                    body: "Field Essays are where observation gets pressure-tested. The point is not to collect opinions. It is to find the few patterns that explain much more than they should."
                ),
                LeverageItem(
                    id: "beholder",
                    kicker: "ESSAY",
                    title: "The lesson is in the eye of the beholder",
                    summary: "The same scene teaches different people different things because attention is not evenly distributed.",
                    body: "Leverage often begins with perception. If you can see the structure inside a familiar event, the event becomes reusable."
                ),
            ]
        ),
        LeverageSection(
            id: "ontology",
            title: "Ontology",
            eyebrow: "ONTOLOGY",
            headline: "The map of leverage.",
            summary: "A structured view of categories, relationships, and recurring 80/20 patterns.",
            items: [
                LeverageItem(
                    id: "eighty-twenty",
                    kicker: "PRINCIPLE",
                    title: "The few inputs that move the system",
                    summary: "The 80/20 rule feels real because reality is rarely evenly distributed.",
                    body: "Ontology is SAVY's attempt to name the hidden structure. The native version should stay readable first: category, relationship, implication."
                ),
                LeverageItem(
                    id: "category-relations",
                    kicker: "MAP",
                    title: "Life categories are not isolated",
                    summary: "Learning, health, work, sleep, belief, and attention bend each other.",
                    body: "The graph matters when it creates a better next action. In iOS, ontology should compress complexity rather than display all of it."
                ),
            ]
        ),
        LeverageSection(
            id: "beliefs",
            title: "Beliefs",
            eyebrow: "BELIEFS",
            headline: "Principles worth keeping close.",
            summary: "Personal leverage rules, identity anchors, and patterns worth preserving.",
            items: [
                LeverageItem(
                    id: "constraints",
                    kicker: "ANCHOR",
                    title: "Constraints make intelligence useful",
                    summary: "The more flexible the tool, the more important the frame.",
                    body: "Beliefs sit at the bottom because they should be stable. They are not the feed. They are the stored leverage that the feed and essays keep refining."
                ),
                LeverageItem(
                    id: "formal-process",
                    kicker: "ANCHOR",
                    title: "Formal processes compound reliability",
                    summary: "A useful process lowers the cost of doing the right thing again.",
                    body: "The iPhone app itself should embody this belief: fewer paths, stronger defaults, and less room for drift."
                ),
            ]
        ),
    ]
}
