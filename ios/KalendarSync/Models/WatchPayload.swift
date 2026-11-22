import Foundation

struct WatchEvent: Codable, Identifiable {
    let id: String
    let title: String
    let date: String       // YYYY-MM-DD
    let startTime: String  // HH:mm o ""
    let endTime: String    // HH:mm o ""
    let allDay: Bool
    let calendar: String
    let color: String      // #RRGGBB
}

struct WatchEventsPayload: Codable {
    let version: Int
    let syncedAt: String   // ISO-8601
    let events: [WatchEvent]

    func toJSONString() throws -> String {
        let encoder = JSONEncoder()
        let data = try encoder.encode(self)
        guard let str = String(data: data, encoding: .utf8) else {
            throw NSError(domain: "KalendarSync", code: 1, userInfo: [NSLocalizedDescriptionKey: "Error codificando UTF-8"])
        }
        return str
    }

    /// Divide el JSON en mensajes compatibles con syncProtocol.js del Huawei Watch Fit 3.
    func toWatchMessages(maxChunkBytes: Int = 900) throws -> [String] {
        let fullJSON = try toJSONString()
        if fullJSON.utf8.count <= maxChunkBytes {
            return [fullJSON]
        }

        let transferId = String(UUID().uuidString.prefix(8))
        var rawChunks: [String] = []
        var current = ""

        for ch in fullJSON {
            let next = current + String(ch)
            if next.utf8.count > maxChunkBytes && !current.isEmpty {
                rawChunks.append(current)
                current = String(ch)
            } else {
                current = next
            }
        }
        if !current.isEmpty {
            rawChunks.append(current)
        }

        let encoder = JSONEncoder()
        let total = rawChunks.count
        return try rawChunks.enumerated().map { idx, part in
            let envelope = WatchChunkMessage(
                type: "chunk",
                transferId: transferId,
                index: idx,
                total: total,
                data: part
            )
            let data = try encoder.encode(envelope)
            return String(data: data, encoding: .utf8) ?? ""
        }
    }
}

struct WatchChunkMessage: Codable {
    let type: String
    let transferId: String
    let index: Int
    let total: Int
    let data: String
}
