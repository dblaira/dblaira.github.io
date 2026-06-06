# SAVY iOS

Native SwiftUI shell for the leverage-focused SAVY iPhone app.

## Xcode setup

- Product name: `SAVY`
- Organization identifier: `com.adamblair`
- Bundle identifier: `com.adamblair.savy`
- Team: `7FKUS5M5QS`
- Interface: SwiftUI
- Language: Swift
- Minimum iOS: 17.0
- Device family: iPhone and iPad
- Orientation: iPhone portrait, iPad all standard orientations
- Signing: Automatic
- Core package: Supabase Swift, minimum `2.41.1`; current `Package.resolved` locks `2.46.0`

## Data setup

- Field Essays are bundled from `src/content/parables/*.md` into `SAVY/Resources/FieldEssays.json`.
- Beliefs load from Supabase table `entries` where `entry_type = connection`.
- News Channel and Ontology still use local starter content until those sections get a durable feed/table.
- Local Supabase client values live in ignored file `SAVY/Config/Secrets.xcconfig`.

The project is generated with XcodeGen:

```sh
cd /Users/adamblair/Documents/GitHub/MyWebsite/ios
xcodegen generate
```

Open `SAVY.xcodeproj` in Xcode.
