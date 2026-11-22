import Foundation

/// Swift mirror of the contracts in `@ilovecode33/ui-core`.
/// The state models and reducers are written here once; views only render them.

public protocol PortableContract {
    associatedtype State
    associatedtype Event
    var name: String { get }
    var swiftUI: String { get }
    func initial() -> State
    func reduce(_ state: State, _ event: Event) -> State
}

// MARK: - Toggle (React: Switch)

public struct ToggleState {
    public var checked: Bool
    public init(checked: Bool = false) { self.checked = checked }
}

public enum ToggleEvent {
    case toggle
    case set(Bool)
}

public func toggleReduce(_ state: ToggleState, _ event: ToggleEvent) -> ToggleState {
    var next = state
    switch event {
    case .toggle: next.checked.toggle()
    case .set(let value): next.checked = value
    }
    return next
}

public struct ToggleContract: PortableContract {
    public typealias State = ToggleState
    public typealias Event = ToggleEvent
    public let name = "Switch"
    public let swiftUI = "Toggle"
    public init() {}
    public func initial() -> ToggleState { ToggleState() }
    public func reduce(_ state: ToggleState, _ event: ToggleEvent) -> ToggleState {
        toggleReduce(state, event)
    }
}

// MARK: - Selection (React: Segmented, Select)

public struct SelectionOption<T: Hashable> {
    public let value: T
    public var disabled: Bool
    public init(value: T, disabled: Bool = false) {
        self.value = value
        self.disabled = disabled
    }
}

public struct SelectionState<T: Hashable> {
    public var options: [SelectionOption<T>]
    public var value: T?
    public var open: Bool
    public var activeIndex: Int
    public init(
        options: [SelectionOption<T>] = [],
        value: T? = nil,
        open: Bool = false,
        activeIndex: Int = 0
    ) {
        self.options = options
        self.value = value
        self.open = open
        self.activeIndex = activeIndex
    }
}

public enum SelectionEvent<T: Hashable> {
    case open
    case close
    case move(delta: Int)
    case setActive(Int)
    case select(T)
}

public func selectionReduce<T: Hashable>(
    _ state: SelectionState<T>,
    _ event: SelectionEvent<T>
) -> SelectionState<T> {
    var next = state
    let enabled = state.options.indices.filter { !state.options[$0].disabled }
    switch event {
    case .open:
        next.open = true
        if let selected = state.options.firstIndex(where: { $0.value == state.value }) {
            next.activeIndex = selected
        } else {
            next.activeIndex = enabled.first ?? 0
        }
    case .close:
        next.open = false
    case .move(let delta):
        guard !enabled.isEmpty else { return state }
        let position = enabled.firstIndex(of: state.activeIndex) ?? -1
        let offset = position + delta
        let index = (offset + enabled.count) % enabled.count
        next.activeIndex = enabled[index >= 0 ? index : 0]
    case .setActive(let index):
        next.activeIndex = index
    case .select(let value):
        guard let option = state.options.first(where: { $0.value == value }),
              !option.disabled else { return state }
        next.value = value
        next.open = false
    }
    return next
}

public struct SelectionContract<T: Hashable>: PortableContract {
    public typealias State = SelectionState<T>
    public typealias Event = SelectionEvent<T>
    public let name = "Select / Segmented"
    public let swiftUI = "Picker / Menu"
    public init() {}
    public func initial() -> SelectionState<T> { SelectionState() }
    public func reduce(_ state: SelectionState<T>, _ event: SelectionEvent<T>) -> SelectionState<T> {
        selectionReduce(state, event)
    }
}

// MARK: - Disclosure (React: Disclosure)

public struct DisclosureState { public var open: Bool; public init(open: Bool = false) { self.open = open } }
public enum DisclosureEvent { case toggle, set(Bool) }
public func disclosureReduce(_ state: DisclosureState, _ event: DisclosureEvent) -> DisclosureState {
    var next = state
    switch event {
    case .toggle: next.open.toggle()
    case .set(let open): next.open = open
    }
    return next
}
public struct DisclosureContract: PortableContract {
    public typealias State = DisclosureState
    public typealias Event = DisclosureEvent
    public let name = "Disclosure"
    public let swiftUI = "DisclosureGroup"
    public init() {}
    public func initial() -> DisclosureState { DisclosureState() }
    public func reduce(_ state: DisclosureState, _ event: DisclosureEvent) -> DisclosureState {
        disclosureReduce(state, event)
    }
}

// MARK: - Sheet (React: Sheet / ActionSheet / AlertDialog)

public struct SheetState { public var presented: Bool; public init(presented: Bool = false) { self.presented = presented } }
public enum SheetEvent { case open, dismiss }
public func sheetReduce(_ state: SheetState, _ event: SheetEvent) -> SheetState {
    var next = state
    switch event {
    case .open: next.presented = true
    case .dismiss: next.presented = false
    }
    return next
}
public struct SheetContract: PortableContract {
    public typealias State = SheetState
    public typealias Event = SheetEvent
    public let name = "Sheet"
    public let swiftUI = ".sheet with detents"
    public init() {}
    public func initial() -> SheetState { SheetState() }
    public func reduce(_ state: SheetState, _ event: SheetEvent) -> SheetState {
        sheetReduce(state, event)
    }
}

// MARK: - Remaining portability descriptors

// MARK: - Floating chrome (React: FloatingBar)

public struct FloatingState {
    public var collapsed: Bool
    public var hidden: Bool
    public init(collapsed: Bool = false, hidden: Bool = false) {
        self.collapsed = collapsed
        self.hidden = hidden
    }
}

public enum FloatingEvent {
    case collapse
    case expand
    case toggleCollapse
    case hide
    case show
}

public func floatingReduce(_ state: FloatingState, _ event: FloatingEvent) -> FloatingState {
    var next = state
    switch event {
    case .collapse: next.collapsed = true
    case .expand: next.collapsed = false
    case .toggleCollapse: next.collapsed.toggle()
    case .hide: next.hidden = true
    case .show: next.hidden = false
    }
    return next
}

public struct FloatingContract: PortableContract {
    public typealias State = FloatingState
    public typealias Event = FloatingEvent
    public let name = "FloatingBar"
    public let swiftUI = ".safeAreaInset with .ultraThinMaterial"
    public init() {}
    public func initial() -> FloatingState { FloatingState() }
    public func reduce(_ state: FloatingState, _ event: FloatingEvent) -> FloatingState {
        floatingReduce(state, event)
    }
}

// MARK: - Directional deformation (React: Deformable)

public struct DeformState {
    public var active: Bool
    public var dx: Double
    public var dy: Double
    public var rawX: Double
    public var rawY: Double
    public var intensityX: Double
    public var intensityY: Double
    public var progress: Double
    public init(
        active: Bool = false,
        dx: Double = 0,
        dy: Double = 0,
        rawX: Double = 0,
        rawY: Double = 0,
        intensityX: Double = 0,
        intensityY: Double = 0,
        progress: Double = 0
    ) {
        self.active = active
        self.dx = dx
        self.dy = dy
        self.rawX = rawX
        self.rawY = rawY
        self.intensityX = intensityX
        self.intensityY = intensityY
        self.progress = progress
    }
}

public enum DeformEvent {
    case start
    case move(dx: Double, dy: Double, max: Double)
    case end
}

/// Extremely hard rubber-band: f(v) = v·max / (100·max + |v|). Larger coefficient = harder pull.
public func resist(_ value: Double, max limit: Double) -> Double {
    guard limit > 0 else { return 0 }
    return (value * limit) / (100 * limit + Swift.abs(value))
}

public func deformReduce(_ state: DeformState, _ event: DeformEvent) -> DeformState {
    switch event {
    case .start:
        return DeformState(active: true)
    case .move(let dx, let dy, let limit):
        let rx = resist(dx, max: limit)
        let ry = resist(dy, max: limit)
        return DeformState(
            active: true,
            dx: rx,
            dy: ry,
            rawX: dx,
            rawY: dy,
            intensityX: Swift.abs(rx) / limit,
            intensityY: Swift.abs(ry) / limit,
            progress: Swift.min(1, (rx * rx + ry * ry).squareRoot() / limit)
        )
    case .end:
        return DeformState()
    }
}

public struct DeformContract: PortableContract {
    public typealias State = DeformState
    public typealias Event = DeformEvent
    public let name = "Deformable"
    public let swiftUI = "DragGesture + rubber-band + spring animation"
    public init() {}
    public func initial() -> DeformState { DeformState() }
    public func reduce(_ state: DeformState, _ event: DeformEvent) -> DeformState {
        deformReduce(state, event)
    }
}

/// Documents parity for contracts whose views are not implemented yet.
public struct ContractDescriptor {
    public let name: String
    public let swiftUI: String
    public let state: String
    public init(name: String, swiftUI: String, state: String) {
        self.name = name
        self.swiftUI = swiftUI
        self.state = state
    }
}

public let portableContracts: [ContractDescriptor] = [
    ContractDescriptor(name: "Switch", swiftUI: "Toggle", state: "ToggleState"),
    ContractDescriptor(name: "Select / Segmented", swiftUI: "Picker / Menu", state: "SelectionState"),
    ContractDescriptor(name: "Disclosure", swiftUI: "DisclosureGroup", state: "DisclosureState"),
    ContractDescriptor(name: "Sheet", swiftUI: ".sheet with detents", state: "SheetState"),
    ContractDescriptor(name: "FormField", swiftUI: "Field with @FocusState", state: "FieldState (touched / error)"),
    ContractDescriptor(name: "List", swiftUI: "List", state: "ListState (selected / expanded)"),
    ContractDescriptor(name: "Toast / Banner", swiftUI: "Overlay with accessibility announcement", state: "FeedbackState"),
    ContractDescriptor(name: "PhotoViewer", swiftUI: "TabView with page style", state: "MediaState (index / count)"),
    ContractDescriptor(name: "SelectionMode", swiftUI: "EditMode / selection", state: "SelectionModeState"),
    ContractDescriptor(name: "TabBar", swiftUI: "TabView", state: "NavigationState"),
    ContractDescriptor(name: "FloatingBar", swiftUI: ".safeAreaInset with .ultraThinMaterial", state: "FloatingState"),
    ContractDescriptor(name: "Deformable", swiftUI: "DragGesture + rubber-band + spring animation", state: "DeformState"),
]
