import AVFoundation
import Speech
import SwiftUI

private enum LabFonts {
    static func display(size: CGFloat) -> Font {
        .custom("Bodoni 72", size: size)
    }

    static func body(size: CGFloat) -> Font {
        .custom("Georgia", size: size)
    }

    static func label(size: CGFloat) -> Font {
        .system(size: size, weight: .heavy, design: .default)
    }

    static func ui(size: CGFloat, weight: Font.Weight = .semibold) -> Font {
        .system(size: size, weight: weight, design: .default)
    }
}

struct ContentView: View {
    @StateObject private var store = LeverageDataStore()
    @State private var selectedTab: LabTab = .now
    @State private var showingCapture = false

    private var stories: [LabStory] {
        LabStory.make(from: store.sections)
    }

    private var featuredStory: LabStory {
        stories.first ?? LabStory.fallback
    }

    private var pinnedStories: [LabStory] {
        LabStory.pinned(from: store.sections)
    }

    private var filteredStories: [LabStory] {
        switch selectedTab {
        case .now:
            return stories
        case .stories:
            return stories.filter { $0.sectionID == "field-essays" }
        case .connections:
            return stories.filter { $0.sectionID == "beliefs" }
        case .patterns:
            return stories.filter { $0.sectionID == "ontology" }
        }
    }

    private var selectedSection: LeverageSection {
        store.sections.first { $0.id == selectedTab.sectionID } ?? store.sections[0]
    }

    var body: some View {
        NavigationStack {
            ZStack(alignment: .bottom) {
                Color.savyPaper.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 0) {
                        if selectedTab == .now {
                            HeroStoryView(story: featuredStory, status: store.status, isLoading: store.isLoading)

                            StoryFeedView(
                                pinnedStories: pinnedStories,
                                stories: filteredStories,
                                selectedTab: selectedTab
                            )
                        } else {
                            SectionListPageView(section: selectedSection, stories: filteredStories)
                        }
                    }
                    .padding(.bottom, 72)
                }
                .ignoresSafeArea(edges: .top)
                .refreshable {
                    await store.refresh()
                }

                LabBottomBar(selectedTab: $selectedTab) {
                    showingCapture = true
                }
                .ignoresSafeArea(edges: .bottom)
            }
            .navigationBarHidden(true)
            .sheet(isPresented: $showingCapture) {
                CaptureEntryView()
                    .presentationDetents([.large])
                    .presentationDragIndicator(.hidden)
            }
            .task {
                await store.refresh()
            }
        }
    }
}

private enum LabTab: String, CaseIterable, Identifiable {
    case now
    case stories
    case connections
    case patterns

    var id: String { rawValue }

    var title: String {
        switch self {
        case .now: return "Now"
        case .stories: return "Essays"
        case .connections: return "Beliefs"
        case .patterns: return "Ontology"
        }
    }

    var systemImage: String {
        switch self {
        case .now: return "house.fill"
        case .stories: return "doc.text"
        case .connections: return "chart.line.uptrend.xyaxis"
        case .patterns: return "point.3.connected.trianglepath.dotted"
        }
    }

    var sectionID: String {
        switch self {
        case .now: return "news-channel"
        case .stories: return "field-essays"
        case .connections: return "beliefs"
        case .patterns: return "ontology"
        }
    }

}

private struct LabStory: Identifiable, Equatable {
    let id: String
    let sectionID: String
    let category: String
    let title: String
    let summary: String
    let body: String
    let date: String
    let isPinned: Bool
    let imageStyle: ImageStyle

    enum ImageStyle: CaseIterable {
        case quote
        case document
        case graph
        case signal
    }

    static let fallback = LabStory(
        id: "fallback",
        sectionID: "beliefs",
        category: "Beliefs",
        title: "Trust Your Instincts Before It's Too Late",
        summary: "A hard-won lesson about conviction, timing, and staying true to rare strengths.",
        body: "The point of leverage is not to do everything. It is to recognize the rare place where action compounds.",
        date: "Today",
        isPinned: true,
        imageStyle: .quote
    )

    static func make(from sections: [LeverageSection]) -> [LabStory] {
        sections.flatMap { section in
            section.items.enumerated().map { index, item in
                LabStory(
                    id: "\(section.id)-\(item.id)",
                    sectionID: section.id,
                    category: section.title,
                    title: item.title,
                    summary: item.summary,
                    body: item.body,
                    date: item.kicker.labDateFallback,
                    isPinned: index == 0,
                    imageStyle: ImageStyle.allCases[(index + section.id.count) % ImageStyle.allCases.count]
                )
            }
        }
    }

    static func pinned(from sections: [LeverageSection]) -> [LabStory] {
        sections.compactMap { section in
            guard let item = section.items.first else { return nil }
            return LabStory(
                id: "pinned-\(section.id)-\(item.id)",
                sectionID: section.id,
                category: section.title,
                title: item.title,
                summary: item.summary,
                body: item.body,
                date: item.kicker.labDateFallback,
                isPinned: true,
                imageStyle: .quote
            )
        }
    }
}

private struct HeroStoryView: View {
    let story: LabStory
    let status: String
    let isLoading: Bool

    var body: some View {
        NavigationLink {
            LabStoryDetailView(story: story)
        } label: {
            VStack(alignment: .leading, spacing: 12) {
                Spacer(minLength: 38)

                Text(story.category)
                    .font(LabFonts.label(size: 14))
                    .tracking(3.6)
                    .foregroundStyle(Color.savyCrimson)

                Text(story.title)
                    .font(LabFonts.display(size: 34))
                    .lineSpacing(0)
                    .foregroundStyle(.white)
                    .lineLimit(3)
                    .fixedSize(horizontal: false, vertical: true)

                VStack(alignment: .leading, spacing: 7) {
                    Text(story.summary)
                        .font(LabFonts.body(size: 17))
                        .lineSpacing(1)

                    Text(story.body.condensedPreview)
                        .font(LabFonts.body(size: 15))
                        .lineSpacing(1)
                        .lineLimit(1)
                }
                .foregroundStyle(.white.opacity(0.66))

                Spacer(minLength: 14)
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 15)
            .frame(maxWidth: .infinity, minHeight: 260, alignment: .leading)
            .background(Color.black)
            .overlay(alignment: .bottom) {
                Rectangle()
                    .fill(Color.savyCrimson)
                    .frame(height: 4)
            }
        }
        .buttonStyle(.plain)
    }
}

private struct StoryFeedView: View {
    let pinnedStories: [LabStory]
    let stories: [LabStory]
    let selectedTab: LabTab

    private var singleStory: LabStory? {
        stories.first
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            VStack(alignment: .leading, spacing: 20) {
                SectionLabel("Latest Leverage")

                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(alignment: .top, spacing: 18) {
                        ForEach(pinnedStories) { story in
                            NavigationLink {
                                LabStoryDetailView(story: story)
                            } label: {
                                PinnedStoryCard(story: story)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(.horizontal, 22)
                }
                .padding(.horizontal, -22)
            }
            .padding(.horizontal, 22)
            .padding(.top, 32)
            .padding(.bottom, 34)
            .background(Color.savyPaper)

            if let singleStory {
                VStack(alignment: .leading, spacing: 0) {
                    NavigationLink {
                        LabStoryDetailView(story: singleStory)
                    } label: {
                        FeedStoryCard(story: singleStory)
                    }
                    .buttonStyle(.plain)
                }
                .padding(.horizontal, 22)
                .padding(.top, 34)
                .padding(.bottom, 150)
                .frame(maxWidth: .infinity, alignment: .leading)
                .frame(minHeight: 430, alignment: .topLeading)
                .background(Color.white)
            }
        }
        .background(Color.white)
    }
}

private struct SectionLabel: View {
    let title: String

    init(_ title: String) {
        self.title = title
    }

    var body: some View {
        Text(title.uppercased())
            .font(LabFonts.label(size: 16))
            .tracking(4)
            .foregroundStyle(Color.savyMuted)
    }
}

private struct PinnedStoryCard: View {
    let story: LabStory

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            StoryImageBlock(story: story)
                .frame(width: 214, height: 160)

            Text(story.category)
                .font(LabFonts.label(size: 16))
                .tracking(4)
                .foregroundStyle(Color.savyCrimson)
        }
        .frame(width: 214, alignment: .leading)
    }
}

private struct FeedStoryCard: View {
    let story: LabStory

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(story.category)
                .font(LabFonts.label(size: 15))
                .tracking(3.4)
                .foregroundStyle(Color.savyCrimson)

            Text(story.title)
                .font(LabFonts.display(size: 31))
                .lineSpacing(2)
                .foregroundStyle(Color.black)
                .lineLimit(3)

            Text(story.date)
                .font(LabFonts.ui(size: 16, weight: .semibold))
                .foregroundStyle(Color.savyMuted)
        }
        .frame(minHeight: 162, alignment: .topLeading)
    }
}

private struct SectionListPageView: View {
    let section: LeverageSection
    let stories: [LabStory]

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            VStack(alignment: .leading, spacing: 9) {
                Text(section.title)
                    .font(LabFonts.label(size: 13))
                    .tracking(3.4)
                    .foregroundStyle(Color.savyCrimson)

                Text(section.headline)
                    .font(LabFonts.display(size: 32))
                    .lineSpacing(0)
                    .foregroundStyle(.white)
                    .lineLimit(2)
                    .fixedSize(horizontal: false, vertical: true)

                Text(section.summary)
                    .font(LabFonts.body(size: 15))
                    .lineSpacing(1)
                    .foregroundStyle(.white.opacity(0.68))
                    .lineLimit(2)
            }
            .padding(.horizontal, 20)
            .padding(.top, 60)
            .padding(.bottom, 18)
            .frame(maxWidth: .infinity, minHeight: 190, alignment: .leading)
            .background(Color.black)
            .overlay(alignment: .bottom) {
                Rectangle()
                    .fill(Color.savyCrimson)
                    .frame(height: 3)
            }

            LazyVStack(alignment: .leading, spacing: 0) {
                ForEach(stories) { story in
                    NavigationLink {
                        LabStoryDetailView(story: story)
                    } label: {
                        SectionStoryRow(story: story)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, 22)
            .padding(.top, 26)
            .padding(.bottom, 84)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color.white)
        }
        .background(Color.white)
    }
}

private struct SectionStoryRow: View {
    let story: LabStory

    private var shouldShowSummary: Bool {
        let summary = story.summary.trimmedForEntry
        return !summary.isEmpty && summary != story.title.trimmedForEntry
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(story.title)
                .font(LabFonts.display(size: 29))
                .lineSpacing(1)
                .foregroundStyle(Color.black)
                .fixedSize(horizontal: false, vertical: true)

            if shouldShowSummary {
                Text(story.summary)
                    .font(LabFonts.body(size: 16))
                    .lineSpacing(4)
                    .foregroundStyle(Color.black.opacity(0.66))
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .padding(.vertical, 18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .overlay(alignment: .bottom) {
            Rectangle()
                .fill(Color.black.opacity(0.08))
                .frame(height: 1)
        }
    }
}

private struct StoryImageBlock: View {
    let story: LabStory

    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 8)
                .fill(story.imageStyle == .document ? Color.savyCard : Color.black.opacity(0.94))

            switch story.imageStyle {
            case .quote:
                Text(story.title.condensedPreview.prefixText(82))
                    .font(LabFonts.display(size: 24))
                    .lineSpacing(2)
                    .foregroundStyle(.white.opacity(0.88))
                    .multilineTextAlignment(.leading)
                    .padding(18)
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
                    .overlay(alignment: .bottomLeading) {
                        Rectangle()
                            .fill(Color.savyCrimson)
                            .frame(width: 48, height: 2)
                            .padding(18)
                    }
            case .document:
                Image(systemName: "doc.text")
                    .font(.system(size: 42, weight: .light))
                    .foregroundStyle(Color.savyMuted)
            case .graph:
                Image(systemName: "chart.line.uptrend.xyaxis")
                    .font(.system(size: 44, weight: .light))
                    .foregroundStyle(Color.savyMuted)
            case .signal:
                Image(systemName: "antenna.radiowaves.left.and.right")
                    .font(.system(size: 42, weight: .light))
                    .foregroundStyle(Color.savyMuted)
            }
        }
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }
}

private struct LabBottomBar: View {
    @Binding var selectedTab: LabTab
    let addAction: () -> Void

    var body: some View {
        ZStack(alignment: .top) {
            Color.savySand
                .ignoresSafeArea(edges: .bottom)

            HStack(alignment: .bottom) {
                BottomTabButton(tab: .now, selectedTab: $selectedTab)
                BottomTabButton(tab: .stories, selectedTab: $selectedTab)

                Button(action: addAction) {
                    ZStack {
                        Circle()
                            .fill(Color.savyCrimson)
                            .frame(width: 66, height: 66)
                            .shadow(color: .black.opacity(0.15), radius: 12, y: 5)

                        Image(systemName: "plus")
                            .font(LabFonts.ui(size: 31, weight: .semibold))
                            .foregroundStyle(Color.savySand)
                    }
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Add new entry")
                .offset(y: -22)
                .frame(maxWidth: .infinity)

                BottomTabButton(tab: .connections, selectedTab: $selectedTab)
                BottomTabButton(tab: .patterns, selectedTab: $selectedTab)
            }
            .padding(.horizontal, 12)
            .padding(.top, 1)
            .padding(.bottom, 1)

            Rectangle()
                .fill(Color.black.opacity(0.14))
                .frame(height: 1)
        }
        .frame(height: 44)
    }
}

private struct BottomTabButton: View {
    let tab: LabTab
    @Binding var selectedTab: LabTab

    private var isSelected: Bool {
        selectedTab == tab
    }

    var body: some View {
        Button {
            selectedTab = tab
        } label: {
            VStack(spacing: 5) {
                Image(systemName: tab.systemImage)
                    .font(LabFonts.ui(size: 19, weight: .semibold))
                    .frame(height: 21)

                Text(tab.title)
                    .font(LabFonts.label(size: 10))
                    .lineLimit(1)
                    .minimumScaleFactor(0.72)
            }
            .foregroundStyle(tab == .now && isSelected ? Color.black : (isSelected ? Color.savyCrimson : Color.savyBrown))
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(.plain)
    }
}

private struct LabStoryDetailView: View {
    let story: LabStory

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                VStack(alignment: .leading, spacing: 8) {
                    Text(story.category)
                        .font(LabFonts.label(size: 12))
                        .tracking(3)
                        .foregroundStyle(Color.savyCrimson)

                    Text(story.title)
                        .font(LabFonts.display(size: 30))
                        .lineSpacing(0)
                        .foregroundStyle(.white)
                        .lineLimit(3)
                        .fixedSize(horizontal: false, vertical: true)

                    Text(story.summary)
                        .font(LabFonts.body(size: 15))
                        .lineSpacing(1)
                        .foregroundStyle(.white.opacity(0.68))
                        .lineLimit(2)
                }
                .padding(.horizontal, 20)
                .padding(.top, 44)
                .padding(.bottom, 14)
                .frame(maxWidth: .infinity, minHeight: 170, alignment: .leading)
                .background(Color.black.ignoresSafeArea(edges: .top))
                .overlay(alignment: .bottom) {
                    Rectangle()
                        .fill(Color.savyCrimson)
                        .frame(height: 3)
                }

                VStack(alignment: .leading, spacing: 0) {
                    Text(story.body)
                        .font(LabFonts.body(size: 17))
                        .lineSpacing(6)
                        .foregroundStyle(Color.black.opacity(0.82))
                        .padding(.horizontal, 22)
                        .padding(.top, 26)
                        .padding(.bottom, 56)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.white)
            }
        }
        .background(Color.white.ignoresSafeArea())
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(.black, for: .navigationBar)
        .toolbarBackground(.visible, for: .navigationBar)
        .toolbarColorScheme(.dark, for: .navigationBar)
    }
}

private struct CaptureEntryView: View {
    @Environment(\.dismiss) private var dismiss
    @StateObject private var dictation = EntryDictationController()
    @State private var selectedCategory = "News Channel"
    @State private var text = ""

    private let categories = ["News Channel", "Field Essays", "Ontology", "Beliefs"]

    var body: some View {
        VStack(spacing: 0) {
            ZStack {
                Color.savySand
                    .ignoresSafeArea(edges: .top)

                HStack {
                    Button("Cancel") {
                        dismiss()
                    }
                    .font(LabFonts.ui(size: 15, weight: .semibold))
                    .foregroundStyle(Color.black.opacity(0.56))

                    Spacer()

                    Text("Capture")
                        .font(LabFonts.label(size: 24))
                        .foregroundStyle(.black)

                    Spacer()

                    Button("Save") {
                        dismiss()
                    }
                    .font(LabFonts.label(size: 15))
                    .foregroundStyle(text.trimmedForEntry.isEmpty ? Color.black.opacity(0.28) : Color.savyCrimson)
                    .disabled(text.trimmedForEntry.isEmpty)
                }
                .padding(.horizontal, 22)
                .padding(.top, 18)
            }
            .frame(height: 104)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 10) {
                    ForEach(categories, id: \.self) { category in
                        Button {
                            selectedCategory = category
                        } label: {
                            Text(category)
                                .font(LabFonts.ui(size: 17, weight: .semibold))
                                .foregroundStyle(selectedCategory == category ? .white : .black)
                                .padding(.horizontal, 18)
                                .frame(height: 40)
                                .background(selectedCategory == category ? Color.black : Color.black.opacity(0.06))
                                .clipShape(Capsule())
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal, 22)
            }
            .padding(.vertical, 14)
            .background(Color.white)
            .overlay(alignment: .bottom) {
                Rectangle()
                    .fill(Color.black.opacity(0.12))
                    .frame(height: 1)
            }

            VStack(alignment: .leading, spacing: 24) {
                HStack {
                    Button {
                    } label: {
                        Label("Add Photos", systemImage: "photo.on.rectangle")
                            .font(LabFonts.ui(size: 18, weight: .bold))
                            .foregroundStyle(Color.black.opacity(0.48))
                    }
                    .buttonStyle(.plain)

                    Spacer()

                    Text(dictation.statusText(for: text))
                        .font(LabFonts.label(size: 13))
                        .tracking(1.4)
                        .foregroundStyle(dictation.isRecording ? Color.savyCrimson : (text.trimmedForEntry.isEmpty ? Color.black.opacity(0.28) : Color.savyCrimson))
                        .frame(width: 104, alignment: .trailing)
                }

                ZStack(alignment: .topLeading) {
                    if text.isEmpty {
                        Text(dictation.placeholder)
                            .font(LabFonts.ui(size: 25, weight: .regular))
                            .foregroundStyle(Color.black.opacity(0.22))
                            .padding(.top, 8)
                    }

                    TextEditor(text: $text)
                        .font(LabFonts.body(size: 24))
                        .scrollContentBackground(.hidden)
                        .foregroundStyle(.black)
                        .frame(minHeight: 360)
                        .padding(.horizontal, -5)
                }

                Spacer(minLength: 0)
            }
            .padding(.horizontal, 24)
            .padding(.top, 22)
            .background(Color.white)

            CaptureBottomBar(isRecording: dictation.isRecording) {
                dismiss()
            } dictateAction: {
                dictation.toggle(existingText: text)
            }
        }
        .onChange(of: dictation.composedText) { _, newValue in
            text = newValue
        }
        .onDisappear {
            dictation.stop()
        }
    }
}

private struct CaptureBottomBar: View {
    let isRecording: Bool
    let homeAction: () -> Void
    let dictateAction: () -> Void

    var body: some View {
        HStack(alignment: .bottom) {
            Button(action: homeAction) {
                VStack(spacing: 6) {
                    Image(systemName: "house.fill")
                        .font(LabFonts.ui(size: 31, weight: .bold))
                    Text("Home")
                        .font(LabFonts.ui(size: 16, weight: .bold))
                }
                .foregroundStyle(Color.black)
                .frame(maxWidth: .infinity)
            }
            .buttonStyle(.plain)

            Button(action: dictateAction) {
                VStack(spacing: 5) {
                    Image(systemName: "mic.fill")
                        .font(LabFonts.ui(size: 52, weight: .bold))
                        .symbolEffect(.pulse, options: .repeating, value: isRecording)
                    Text(isRecording ? "Listening" : "Dictate")
                        .font(LabFonts.ui(size: 16, weight: .bold))
                }
                .foregroundStyle(Color.savyCrimson)
                .frame(maxWidth: .infinity)
            }
            .buttonStyle(.plain)
            .accessibilityLabel(isRecording ? "Stop dictation" : "Start dictation")

            Button {
            } label: {
                VStack(spacing: 6) {
                    Image(systemName: "camera.fill")
                        .font(LabFonts.ui(size: 32, weight: .bold))
                    Text("Camera")
                        .font(LabFonts.ui(size: 16, weight: .bold))
                }
                .foregroundStyle(Color.black)
                .frame(maxWidth: .infinity)
            }
            .buttonStyle(.plain)
        }
        .padding(.horizontal, 20)
        .padding(.top, 10)
        .padding(.bottom, 30)
        .background(Color.savySand.ignoresSafeArea(edges: .bottom))
        .overlay(alignment: .top) {
            Rectangle()
                .fill(Color.black.opacity(0.14))
                .frame(height: 1)
        }
    }
}

@MainActor
private final class EntryDictationController: NSObject, ObservableObject {
    @Published private(set) var isRecording = false
    @Published private(set) var composedText = ""
    @Published private var message = "Draft"

    private let recognizer = SFSpeechRecognizer(locale: Locale(identifier: "en_US"))
    private let audioEngine = AVAudioEngine()
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private var baseText = ""

    var placeholder: String {
        isRecording ? "Listening..." : "What happened? What are you thinking about?"
    }

    func statusText(for text: String) -> String {
        if isRecording { return "DICTATING" }
        if message != "Draft" { return message }
        return text.trimmedForEntry.isEmpty ? "Draft" : "Ready"
    }

    func toggle(existingText: String) {
        if isRecording {
            stop()
        } else {
            start(existingText: existingText)
        }
    }

    func start(existingText: String) {
        baseText = existingText.trimmedForEntry
        composedText = existingText
        message = "Starting"

        Task {
            let authorized = await requestPermissions()
            guard authorized else {
                message = "Mic denied"
                return
            }
            beginRecognition()
        }
    }

    func stop() {
        guard isRecording || recognitionTask != nil || audioEngine.isRunning else { return }
        audioEngine.stop()
        recognitionRequest?.endAudio()
        recognitionTask?.cancel()
        recognitionRequest = nil
        recognitionTask = nil
        isRecording = false
        message = composedText.trimmedForEntry.isEmpty ? "Draft" : "Ready"
        try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
    }

    private func requestPermissions() async -> Bool {
        let speechAuthorized = await withCheckedContinuation { continuation in
            SFSpeechRecognizer.requestAuthorization { status in
                continuation.resume(returning: status == .authorized)
            }
        }

        guard speechAuthorized else { return false }

        return await withCheckedContinuation { continuation in
            AVAudioSession.sharedInstance().requestRecordPermission { allowed in
                continuation.resume(returning: allowed)
            }
        }
    }

    private func beginRecognition() {
        guard let recognizer, recognizer.isAvailable else {
            isRecording = false
            message = "Unavailable"
            return
        }

        recognitionTask?.cancel()
        recognitionTask = nil

        let session = AVAudioSession.sharedInstance()
        do {
            try session.setCategory(.record, mode: .measurement, options: .duckOthers)
            try session.setActive(true, options: .notifyOthersOnDeactivation)

            let request = SFSpeechAudioBufferRecognitionRequest()
            request.shouldReportPartialResults = true
            recognitionRequest = request

            let inputNode = audioEngine.inputNode
            inputNode.removeTap(onBus: 0)
            let format = inputNode.outputFormat(forBus: 0)
            inputNode.installTap(onBus: 0, bufferSize: 1024, format: format) { [weak request] buffer, _ in
                request?.append(buffer)
            }

            audioEngine.prepare()
            try audioEngine.start()
            isRecording = true
            message = "Dictating"

            recognitionTask = recognizer.recognitionTask(with: request) { [weak self] result, error in
                Task { @MainActor in
                    self?.handleRecognition(result: result, error: error)
                }
            }
        } catch {
            audioEngine.inputNode.removeTap(onBus: 0)
            isRecording = false
            message = "Mic error"
            recognitionRequest = nil
            recognitionTask = nil
            try? session.setActive(false, options: .notifyOthersOnDeactivation)
        }
    }

    private func handleRecognition(result: SFSpeechRecognitionResult?, error: Error?) {
        if let result {
            let transcript = result.bestTranscription.formattedString
            composedText = [baseText, transcript]
                .filter { !$0.trimmedForEntry.isEmpty }
                .joined(separator: "\n\n")
        }

        if result?.isFinal == true || error != nil {
            stop()
        }
    }
}

private extension String {
    var condensedPreview: String {
        replacingOccurrences(of: "\n", with: " ")
            .replacingOccurrences(of: "#", with: "")
            .trimmingCharacters(in: .whitespacesAndNewlines)
    }

    var labDateFallback: String {
        if contains(",") || contains("TODAY") || contains("Today") {
            return capitalized
        }
        return "Today"
    }

    var trimmedForEntry: String {
        trimmingCharacters(in: .whitespacesAndNewlines)
    }

    func prefixText(_ count: Int) -> String {
        guard self.count > count else { return self }
        return String(prefix(count)) + "..."
    }
}

#Preview {
    ContentView()
}
