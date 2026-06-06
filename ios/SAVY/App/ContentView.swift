import SwiftUI

struct ContentView: View {
    @StateObject private var store = LeverageDataStore()
    @State private var selectedSectionID = LeverageSection.seed[0].id

    private var sections: [LeverageSection] {
        store.sections
    }

    private var selectedSection: LeverageSection {
        sections.first { $0.id == selectedSectionID } ?? sections[0]
    }

    var body: some View {
        NavigationStack {
            ZStack {
                Color.savyCanvas.ignoresSafeArea()

                VStack(spacing: 0) {
                    HeaderView()

                    DataStatusView(status: store.status, isLoading: store.isLoading)
                        .padding(.top, 10)

                    SectionRail(sections: sections, selectedSectionID: $selectedSectionID)
                        .padding(.top, 12)

                    ScrollView {
                        VStack(alignment: .leading, spacing: 18) {
                            SectionHero(section: selectedSection)

                            ForEach(selectedSection.items) { item in
                                NavigationLink {
                                    LeverageDetailView(section: selectedSection, item: item)
                                } label: {
                                    LeverageCard(item: item)
                                }
                                .buttonStyle(.plain)
                            }
                        }
                        .padding(.horizontal, 20)
                        .padding(.top, 18)
                        .padding(.bottom, 28)
                    }
                    .refreshable {
                        await store.refresh()
                    }
                }
            }
            .navigationBarHidden(true)
            .task {
                await store.refresh()
            }
        }
    }
}

private struct HeaderView: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("SAVY")
                .font(.system(size: 48, weight: .regular, design: .serif))
                .italic()
                .foregroundStyle(Color.savyCrimson)

            Text("A STUDY IN LEVERAGE")
                .font(.system(size: 12, weight: .semibold))
                .tracking(2.1)
                .foregroundStyle(Color.savyInk.opacity(0.45))
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, 20)
        .padding(.top, 30)
    }
}

private struct DataStatusView: View {
    let status: String
    let isLoading: Bool

    var body: some View {
        HStack(spacing: 8) {
            Circle()
                .fill(isLoading ? Color.savyCrimson.opacity(0.55) : Color.savyInk.opacity(0.26))
                .frame(width: 7, height: 7)

            Text(isLoading ? "Loading data" : status)
                .font(.system(size: 11, weight: .semibold))
                .tracking(1.1)
                .foregroundStyle(Color.savyInk.opacity(0.42))
                .lineLimit(1)
                .frame(width: 132, alignment: .leading)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, 20)
    }
}

private struct SectionRail: View {
    let sections: [LeverageSection]
    @Binding var selectedSectionID: String

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 10) {
                ForEach(sections) { section in
                    Button {
                        selectedSectionID = section.id
                    } label: {
                        Text(section.title)
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundStyle(selectedSectionID == section.id ? .white : Color.savyInk.opacity(0.62))
                            .padding(.horizontal, 16)
                            .frame(height: 38)
                            .background(selectedSectionID == section.id ? Color.savyInk : Color.white.opacity(0.72))
                            .clipShape(Capsule())
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, 20)
        }
    }
}

private struct SectionHero: View {
    let section: LeverageSection

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(section.eyebrow)
                .font(.system(size: 11, weight: .bold))
                .tracking(1.7)
                .foregroundStyle(Color.savyCrimson)

            Text(section.headline)
                .font(.system(size: 32, weight: .regular, design: .serif))
                .foregroundStyle(Color.savyInk)
                .lineSpacing(2)

            Text(section.summary)
                .font(.system(size: 15, weight: .regular))
                .foregroundStyle(Color.savyInk.opacity(0.62))
                .lineSpacing(5)
        }
        .padding(22)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.white)
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }
}

private struct LeverageCard: View {
    let item: LeverageItem

    var body: some View {
        VStack(alignment: .leading, spacing: 9) {
            Text(item.kicker)
                .font(.system(size: 11, weight: .bold))
                .tracking(1.2)
                .foregroundStyle(Color.savyInk.opacity(0.42))

            Text(item.title)
                .font(.system(size: 22, weight: .regular, design: .serif))
                .foregroundStyle(Color.savyInk)

            Text(item.summary)
                .font(.system(size: 14))
                .foregroundStyle(Color.savyInk.opacity(0.58))
                .lineSpacing(4)

            HStack(spacing: 6) {
                Text("Open")
                Image(systemName: "chevron.right")
                    .font(.system(size: 11, weight: .bold))
            }
            .font(.system(size: 13, weight: .semibold))
            .foregroundStyle(Color.savyCrimson)
            .padding(.top, 2)
        }
        .padding(20)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.white.opacity(0.86))
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }
}

private struct LeverageDetailView: View {
    let section: LeverageSection
    let item: LeverageItem

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                Text(section.title.uppercased())
                    .font(.system(size: 11, weight: .bold))
                    .tracking(1.7)
                    .foregroundStyle(Color.savyCrimson)

                Text(item.title)
                    .font(.system(size: 36, weight: .regular, design: .serif))
                    .foregroundStyle(Color.savyInk)
                    .lineSpacing(3)

                Text(item.body)
                    .font(.system(size: 17))
                    .foregroundStyle(Color.savyInk.opacity(0.72))
                    .lineSpacing(7)
            }
            .padding(24)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .background(Color.savyCanvas.ignoresSafeArea())
        .navigationTitle(section.title)
        .navigationBarTitleDisplayMode(.inline)
    }
}

#Preview {
    ContentView()
}
