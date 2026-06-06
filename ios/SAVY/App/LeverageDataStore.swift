import Foundation

@MainActor
final class LeverageDataStore: ObservableObject {
    @Published private(set) var sections = LeverageSection.seed
    @Published private(set) var isLoading = false
    @Published private(set) var status = "Seed content"

    func refresh() async {
        isLoading = true
        defer { isLoading = false }

        var nextSections = LeverageSection.seed

        let fieldEssays = loadFieldEssays()
        if !fieldEssays.isEmpty {
            nextSections.replaceSection(id: "field-essays", items: fieldEssays)
        }

        if let supabase = SavySupabase() {
            do {
                let beliefs = try await supabase.fetchBeliefs()
                if !beliefs.isEmpty {
                    nextSections.replaceSection(id: "beliefs", items: beliefs)
                    status = "Live beliefs"
                } else {
                    status = "No live beliefs yet"
                }
            } catch {
                status = "Using saved fallbacks"
            }
        } else {
            status = "Local fallbacks"
        }

        sections = nextSections
    }

    private func loadFieldEssays() -> [LeverageItem] {
        guard let url = Bundle.main.url(forResource: "FieldEssays", withExtension: "json") else {
            return []
        }

        do {
            let data = try Data(contentsOf: url)
            let essays = try JSONDecoder().decode([FieldEssayResource].self, from: data)
            return essays.map { essay in
                LeverageItem(
                    id: essay.slug,
                    kicker: essay.displayDate,
                    title: essay.title,
                    summary: essay.summary,
                    body: essay.body
                )
            }
        } catch {
            return []
        }
    }
}

private struct FieldEssayResource: Decodable {
    let title: String
    let summary: String
    let date: String
    let slug: String
    let body: String

    var displayDate: String {
        guard let parsed = Self.parser.date(from: date) else { return "ESSAY" }
        return Self.formatter.string(from: parsed).uppercased()
    }

    private static let parser: DateFormatter = {
        let formatter = DateFormatter()
        formatter.calendar = Calendar(identifier: .gregorian)
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter
    }()

    private static let formatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.dateFormat = "MMM d, yyyy"
        return formatter
    }()
}

private extension Array where Element == LeverageSection {
    mutating func replaceSection(id: String, items: [LeverageItem]) {
        guard let index = firstIndex(where: { $0.id == id }) else { return }
        self[index] = self[index].replacingItems(items)
    }
}
