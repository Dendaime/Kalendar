import Foundation

protocol WatchTransport {
    var displayName: String { get }
    func sendMessages(_ messages: [String]) async throws -> String
}

/// Transporte de simulación para validar la lectura de EventKit y la fragmentación
/// antes de enlazar el SDK binario de Huawei Wear Engine para iOS.
final class MockWatchTransport: WatchTransport {
    let displayName = "Simulador local (sin Wear Engine SDK)"

    func sendMessages(_ messages: [String]) async throws -> String {
        try await Task.sleep(nanoseconds: 250_000_000)
        return "Listo: \(messages.count) paquete(s) JSON generados para com.dendaime.kalendar."
    }
}

/// Punto de integración para Huawei Wear Engine SDK para iOS (HiWear / P2pClient).
/// Al agregar el XCFramework oficial de Huawei en ios/Frameworks/, reemplazar el cuerpo
/// de `sendMessages` con el envío P2P hacia `watchBundleName`.
final class HuaweiWearEngineTransport: WatchTransport {
    let displayName = "Huawei Wear Engine (Watch Fit 3)"
    let watchBundleName = "com.dendaime.kalendar"

    func sendMessages(_ messages: [String]) async throws -> String {
        // TODO: Enlazar HiWear / WearEngine SDK para iOS:
        // 1. Obtener dispositivo conectado con HiWear.getDeviceClient().getBondedDevices()
        // 2. Configurar peerPkgName = watchBundleName y fingerprint de AppGallery Connect
        // 3. Enviar cada string de `messages` secuencialmente vía P2pClient.send()
        return "Wear Engine SDK pendiente de enlazar (\(messages.count) paquete(s) preparados)."
    }
}
