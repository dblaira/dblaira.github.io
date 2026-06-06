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

    func fetchBeliefs(limit: Int = 12) async throws -> [LeverageItem] {
        let rows: [BeliefEntryRow] = try await client
            .from("entries")
            .select("id, headline, content, entry_type, connection_type, pinned_at, created_at")
            .eq("entry_type", value: "connection")
            .order("created_at", ascending: false)
            .limit(limit)
            .execute()
            .value

        return rows.compactMap { row in
            let title = row.headline?.trimmedNonEmpty ?? row.content?.trimmedNonEmpty
            guard let title else { return nil }

            return LeverageItem(
                id: row.id,
                kicker: row.connectionTypeLabel,
                title: title,
                summary: row.content?.trimmedNonEmpty ?? title,
                body: row.content?.trimmedNonEmpty ?? title
            )
        }
    }
}

private struct BeliefEntryRow: Decodable {
    let id: String
    let headline: String?
    let content: String?
    let connectionType: String?

    var connectionTypeLabel: String {
        switch connectionType {
        case "identity_anchor": return "IDENTITY ANCHOR"
        case "pattern_interrupt": return "PATTERN INTERRUPT"
        case "validated_principle": return "VALIDATED PRINCIPLE"
        case "process_anchor": return "PROCESS ANCHOR"
        default: return "BELIEF"
        }
    }

    enum CodingKeys: String, CodingKey {
        case id
        case headline
        case content
        case connectionType = "connection_type"
    }
}

private extension String {
    var trimmedNonEmpty: String? {
        let value = trimmingCharacters(in: .whitespacesAndNewlines)
        return value.isEmpty ? nil : value
    }
}
