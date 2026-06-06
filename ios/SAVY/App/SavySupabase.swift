import Foundation
import Supabase

struct SavySupabase {
    private let client: SupabaseClient

    init?(configuration: AppConfiguration = .main) {
        guard let url = configuration.supabaseURL, configuration.hasSupabase else {
            return nil
        }

        client = SupabaseClient(
            supabaseURL: url,
            supabaseKey: configuration.supabaseAnonKey
        )
    }

    func fetchBeliefs(limit: Int = 50) async throws -> [LeverageItem] {
        let rows: [BeliefEntryRow] = try await client
            .from("entries")
            .select("id, headline, content, entry_type, pinned_at, created_at")
            .eq("entry_type", value: "connection")
            .order("pinned_at", ascending: false, nullsFirst: false)
            .order("created_at", ascending: false)
            .limit(limit)
            .execute()
            .value

        return rows.compactMap { row in
            let title = row.headline?.trimmedNonEmpty ?? row.content?.trimmedNonEmpty
            guard let title else { return nil }
            let content = row.content?.trimmedNonEmpty
            let summary = content == title ? "" : content ?? ""

            return LeverageItem(
                id: row.id,
                kicker: "BELIEF",
                title: title,
                summary: summary,
                body: content ?? title
            )
        }
    }
}

private struct BeliefEntryRow: Decodable {
    let id: String
    let headline: String?
    let content: String?

    enum CodingKeys: String, CodingKey {
        case id
        case headline
        case content
    }
}

private extension String {
    var trimmedNonEmpty: String? {
        let value = trimmingCharacters(in: .whitespacesAndNewlines)
        return value.isEmpty ? nil : value
    }
}
