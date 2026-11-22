import EventKit
import Foundation
import CoreGraphics

final class EventKitService {
    private let store = EKEventStore()

    private static let dateFormatter: DateFormatter = {
        let df = DateFormatter()
        df.calendar = Calendar(identifier: .gregorian)
        df.locale = Locale(identifier: "en_US_POSIX")
        df.dateFormat = "yyyy-MM-dd"
        return df
    }()

    private static let timeFormatter: DateFormatter = {
        let df = DateFormatter()
        df.calendar = Calendar(identifier: .gregorian)
        df.locale = Locale(identifier: "en_US_POSIX")
        df.dateFormat = "HH:mm"
        return df
    }()

    private static let isoFormatter: ISO8601DateFormatter = {
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime]
        return f
    }()

    func requestAccess() async throws -> Bool {
        if #available(iOS 17.0, *) {
            return try await store.requestFullAccessToEvents()
        } else {
            return try await withCheckedThrowingContinuation { continuation in
                store.requestAccess(to: .event) { granted, error in
                    if let error = error {
                        continuation.resume(throwing: error)
                    } else {
                        continuation.resume(returning: granted)
                    }
                }
            }
        }
    }

    /// Lee eventos de todos los calendarios configurados en el iPhone (iCloud, Google, Outlook).
    func fetchPayload(monthsBack: Int = 1, monthsAhead: Int = 3) -> WatchEventsPayload {
        let cal = Calendar.current
        let now = Date()
        let start = cal.date(byAdding: .month, value: -monthsBack, to: now) ?? now
        let end = cal.date(byAdding: .month, value: monthsAhead, to: now) ?? now

        let predicate = store.predicateForEvents(withStart: start, end: end, calendars: nil)
        let ekEvents = store.events(matching: predicate).sorted { $0.startDate < $1.startDate }

        let mapped: [WatchEvent] = ekEvents.enumerated().map { idx, ev in
            let dateStr = Self.dateFormatter.string(from: ev.startDate)
            let startStr = ev.isAllDay ? "" : Self.timeFormatter.string(from: ev.startDate)
            let endStr = ev.isAllDay ? "" : Self.timeFormatter.string(from: ev.endDate)
            let colorHex = Self.hexString(from: ev.calendar.cgColor)

            return WatchEvent(
                id: ev.eventIdentifier ?? "ek-\(idx)",
                title: ev.title ?? "Sin título",
                date: dateStr,
                startTime: startStr,
                endTime: endStr,
                allDay: ev.isAllDay,
                calendar: ev.calendar.title,
                color: colorHex
            )
        }

        return WatchEventsPayload(
            version: 1,
            syncedAt: Self.isoFormatter.string(from: now),
            events: mapped
        )
    }

    private static func hexString(from cgColor: CGColor?) -> String {
        guard let color = cgColor,
              let rgb = color.converted(to: CGColorSpaceCreateDeviceRGB(), intent: .defaultIntent, options: nil),
              let c = rgb.components,
              c.count >= 3 else {
            return "#0A84FF"
        }
        let r = Int(round(c[0] * 255))
        let g = Int(round(c[1] * 255))
        let b = Int(round(c[2] * 255))
        return String(format: "#%02X%02X%02X", r, g, b)
    }
}
