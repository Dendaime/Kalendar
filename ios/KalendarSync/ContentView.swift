import SwiftUI

struct ContentView: View {
    private let eventKit = EventKitService()
    private let transport: WatchTransport = MockWatchTransport()

    @State private var monthsAhead: Int = 3
    @State private var statusMessage: String = "Presiona Sincronizar para leer tus calendarios del iPhone."
    @State private var eventCount: Int = 0
    @State private var chunkCount: Int = 0
    @State private var isSyncing: Bool = false

    var body: some View {
        NavigationStack {
            List {
                Section("Estado") {
                    LabeledContent("Destino", value: "Watch Fit 3")
                    LabeledContent("Transporte", value: transport.displayName)
                    LabeledContent("Eventos leídos", value: "\(eventCount)")
                    LabeledContent("Paquetes BLE", value: "\(chunkCount)")
                }

                Section("Ventana de sincronización") {
                    Stepper("Meses hacia adelante: \(monthsAhead)", value: $monthsAhead, in: 1...6)
                }

                Section {
                    Button {
                        Task { await syncNow() }
                    } label: {
                        HStack {
                            Spacer()
                            if isSyncing {
                                ProgressView()
                            } else {
                                Text("Sincronizar con Watch Fit 3")
                                    .fontWeight(.semibold)
                            }
                            Spacer()
                        }
                    }
                    .disabled(isSyncing)
                }

                Section("Registro") {
                    Text(statusMessage)
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }
            }
            .navigationTitle("Kalendar Sync")
        }
    }

    @MainActor
    private func syncNow() async {
        isSyncing = true
        defer { isSyncing = false }

        do {
            let granted = try await eventKit.requestAccess()
            guard granted else {
                statusMessage = "Permiso de calendario denegado en Ajustes de iOS."
                return
            }

            let payload = eventKit.fetchPayload(monthsBack: 1, monthsAhead: monthsAhead)
            let messages = try payload.toWatchMessages(maxChunkBytes: 900)
            eventCount = payload.events.count
            chunkCount = messages.count

            let result = try await transport.sendMessages(messages)
            statusMessage = result
        } catch {
            statusMessage = "Error: \(error.localizedDescription)"
        }
    }
}
