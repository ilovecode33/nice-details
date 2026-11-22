import SwiftUI

/// SwiftUI renderers for the first four portable contracts.
/// All colors and sizes come from generated `UITokens`, never hardcoded.

public struct UIToggle: View {
    @Binding public var checked: Bool
    public let label: String

    public init(checked: Binding<Bool>, label: String) {
        self._checked = checked
        self.label = label
    }

    public var body: some View {
        Toggle(label, isOn: $checked)
            .tint(UITokens.Accent.warmthLight.accent)
    }
}

public struct UISegmented<Value: Hashable>: View {
    public let options: [Value]
    public let labels: [String]
    @Binding public var value: Value

    public init(options: [Value], labels: [String], value: Binding<Value>) {
        self.options = options
        self.labels = labels
        self._value = value
    }

    public var body: some View {
        Picker("", selection: $value) {
            ForEach(options.indices, id: \.self) { index in
                Text(labels[index]).tag(options[index])
            }
        }
        .pickerStyle(.segmented)
        .tint(UITokens.Accent.warmthLight.accent)
    }
}

public struct UIListRow: Identifiable {
    public let id: String
    public let title: String
    public let subtitle: String?

    public init(id: String, title: String, subtitle: String? = nil) {
        self.id = id
        self.title = title
        self.subtitle = subtitle
    }
}

public struct UIListView: View {
    public let rows: [UIListRow]
    @Binding public var selectedId: String?

    public init(rows: [UIListRow], selectedId: Binding<String?>) {
        self.rows = rows
        self._selectedId = selectedId
    }

    public var body: some View {
        List(rows) { row in
            Button {
                selectedId = row.id
            } label: {
                VStack(alignment: .leading, spacing: 2) {
                    Text(row.title)
                        .foregroundStyle(row.id == selectedId ? UITokens.Accent.warmthLight.accent : UITokens.Surface.light.text)
                    if let subtitle = row.subtitle {
                        Text(subtitle)
                            .font(.caption)
                            .foregroundStyle(UITokens.Surface.light.textDim)
                    }
                }
                .frame(minHeight: UITokens.touch, alignment: .leading)
            }
        }
#if os(iOS)
        .listStyle(.insetGrouped)
#endif
    }
}

public struct UIDeformable: ViewModifier {
    @Binding public var state: DeformState

    public init(state: Binding<DeformState>) {
        self._state = state
    }

    public func body(content: Content) -> some View {
        GeometryReader { geo in
            let width = max(geo.size.width, 1)
            let height = max(geo.size.height, 1)
            let stretchX = state.intensityX * UITokens.Motion.deformStretch
            let squashY = state.intensityX * UITokens.Motion.deformSquash
            let stretchY = state.intensityY * UITokens.Motion.deformStretch
            let squashX = state.intensityY * UITokens.Motion.deformSquash
            let anchor = UnitPoint(
                x: state.dx > 0 ? 0 : state.dx < 0 ? 1 : 0.5,
                y: state.dy > 0 ? 0 : state.dy < 0 ? 1 : 0.5
            )
            content
                .scaleEffect(
                    x: 1 + (stretchX - squashX) / width,
                    y: 1 + (stretchY - squashY) / height,
                    anchor: anchor
                )
                .offset(x: state.dx, y: state.dy)
                .animation(
                    state.active ? nil : .spring(
                        response: UITokens.Motion.springDuration,
                        dampingFraction: 0.65
                    ),
                    value: state.active
                )
        }
    }
}

public struct UIFloatingBar<Content: View>: View {
    @Binding public var collapsed: Bool
    public let label: String
    public let content: Content

    public init(collapsed: Binding<Bool>, label: String, @ViewBuilder content: () -> Content) {
        self._collapsed = collapsed
        self.label = label
        self.content = content()
    }

    public var body: some View {
        content
            .padding(.horizontal)
            .padding(.vertical, UITokens.Spacing.s2)
            .background(.ultraThinMaterial, in: Capsule())
            .overlay(
                Capsule()
                    .stroke(UITokens.Material.light.stroke, lineWidth: 1)
            )
            .shadow(radius: UITokens.Material.blur / 2)
            .safeAreaInset(edge: .bottom) {
                Color.clear.frame(height: collapsed ? 0 : UITokens.touch)
            }
            .accessibilityLabel(label)
    }
}

public struct UISheetView<Content: View>: View {
    @Binding public var presented: Bool
    public let title: String
    public let content: Content

    public init(presented: Binding<Bool>, title: String, @ViewBuilder content: () -> Content) {
        self._presented = presented
        self.title = title
        self.content = content()
    }

    public var body: some View {
        Color.clear
            .sheet(isPresented: $presented) {
                VStack(alignment: .leading, spacing: UITokens.Spacing.s4) {
                    Text(title).font(.headline)
                    content
                    Spacer()
                }
                .padding()
                .presentationDetents([.medium, .large])
            }
    }
}
