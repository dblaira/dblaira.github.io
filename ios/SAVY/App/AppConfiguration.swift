import Foundation

struct AppConfiguration {
    let supabaseURL: URL?
    let supabaseAnonKey: String

    var hasSupabase: Bool {
        supabaseURL != nil && !supabaseAnonKey.isEmpty && !supabaseAnonKey.hasPrefix("$(")
    }

    static let main = AppConfiguration(
        supabaseURL: infoURL("SUPABASE_URL"),
        supabaseAnonKey: infoString("SUPABASE_ANON_KEY")
    )

    private static func infoString(_ key: String) -> String {
        guard let value = Bundle.main.object(forInfoDictionaryKey: key) as? String else {
            return ""
        }
        return value.trimmingCharacters(in: .whitespacesAndNewlines)
    }

    private static func infoURL(_ key: String) -> URL? {
        let value = infoString(key)
        guard !value.isEmpty, !value.hasPrefix("$(") else { return nil }
        return URL(string: value)
    }
}
