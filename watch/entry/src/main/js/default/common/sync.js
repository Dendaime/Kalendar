// Receptor de sincronización iPhone -> Huawei Watch Fit 3 (Wear Engine P2P).
// Degrada sin errores en el Previewer de DevEco Studio cuando P2pClient no existe.

import { saveEventsPayload } from './storage.js';
import { formatSyncLabel, processIncomingMessage } from './syncProtocol.js';

// Identificadores del compañero iOS (actualizar al configurar AppGallery Connect / Xcode)
export var PEER_IOS_BUNDLE_ID = 'com.dendaime.kalendar.ios';
export var PEER_IOS_FINGERPRINT = '';

var p2pClientInstance = null;

export { formatSyncLabel };

export function startWearEngineListener(options) {
  var opts = options || {};
  var onSynced = opts.onSynced;
  var onError = opts.onError;

  var P2pCtor = opts.P2pClient || (typeof P2pClient !== 'undefined' ? P2pClient : null);
  if (!P2pCtor) {
    return false;
  }

  try {
    p2pClientInstance = new P2pCtor();
    if (p2pClientInstance.setPeerPkgName) {
      p2pClientInstance.setPeerPkgName(opts.peerBundleId || PEER_IOS_BUNDLE_ID);
    }
    if (p2pClientInstance.setPeerFingerPrint && (opts.peerFingerprint || PEER_IOS_FINGERPRINT)) {
      p2pClientInstance.setPeerFingerPrint(opts.peerFingerprint || PEER_IOS_FINGERPRINT);
    }

    p2pClientInstance.registerReceiver({
      onSuccess: function () {
        console.info('Kalendar Wear Engine receiver registrado');
      },
      onFailure: function () {
        if (onError) {
          onError('No se pudo registrar Wear Engine');
        }
      },
      onReceiveMessage: function (msg) {
        var text = (msg && typeof msg.data === 'string') ? msg.data : (typeof msg === 'string' ? msg : '');
        var res = processIncomingMessage(text);
        if (res.status === 'complete') {
          saveEventsPayload(res.payload, function () {
            if (onSynced) {
              onSynced(res.payload);
            }
          });
        } else if (res.status === 'error' && onError) {
          onError(res.error);
        }
      }
    });
    return true;
  } catch (e) {
    if (onError) {
      onError('Error inicializando Wear Engine');
    }
    return false;
  }
}

export function stopWearEngineListener() {
  if (p2pClientInstance && p2pClientInstance.unregisterReceiver) {
    try {
      p2pClientInstance.unregisterReceiver({
        onSuccess: function () {},
        onFailure: function () {}
      });
    } catch (e) {
      // Ignorar al cerrar página
    }
  }
  p2pClientInstance = null;
}
