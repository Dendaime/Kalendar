// Protocolo puro de sincronización JSON (paquete único + fragmentado en chunks)
// Sin dependencias de runtime de HarmonyOS para permitir pruebas unitarias en Node.js.

var activeTransfers = {};

export function normalizeEventsPayload(rawObj) {
  if (!rawObj || typeof rawObj !== 'object') {
    return { ok: false, error: 'Payload vacío o inválido' };
  }
  if (!rawObj.events || typeof rawObj.events.length !== 'number') {
    return { ok: false, error: 'Falta el arreglo events' };
  }

  var cleanEvents = [];
  for (var i = 0; i < rawObj.events.length; i++) {
    var ev = rawObj.events[i];
    if (!ev || typeof ev.date !== 'string' || ev.date.length < 10) {
      continue;
    }
    cleanEvents.push({
      id: ev.id ? ('' + ev.id) : ('sync-' + i),
      title: ev.title ? ('' + ev.title) : 'Sin título',
      date: ev.date.substring(0, 10),
      startTime: ev.startTime ? ('' + ev.startTime) : '',
      endTime: ev.endTime ? ('' + ev.endTime) : '',
      allDay: !!ev.allDay,
      calendar: ev.calendar ? ('' + ev.calendar) : 'Calendario',
      color: (ev.color && typeof ev.color === 'string') ? ev.color : '#0A84FF'
    });
  }

  var syncedAt = (rawObj.syncedAt && typeof rawObj.syncedAt === 'string')
    ? rawObj.syncedAt
    : (new Date().toISOString ? new Date().toISOString() : '');

  return {
    ok: true,
    payload: {
      version: rawObj.version || 1,
      syncedAt: syncedAt,
      source: 'iphone',
      events: cleanEvents
    }
  };
}

export function processIncomingMessage(rawMessage) {
  if (!rawMessage || typeof rawMessage !== 'string') {
    return { status: 'error', error: 'Mensaje vacío' };
  }

  var parsed;
  try {
    parsed = JSON.parse(rawMessage);
  } catch (e) {
    return { status: 'error', error: 'JSON malformado' };
  }

  if (parsed && parsed.type === 'ping') {
    return { status: 'ping' };
  }

  if (parsed && parsed.type === 'chunk') {
    var tid = parsed.transferId;
    var idx = parsed.index;
    var total = parsed.total;
    var chunkData = parsed.data;

    if (!tid || typeof idx !== 'number' || typeof total !== 'number' || total <= 0 || idx < 0 || idx >= total || typeof chunkData !== 'string') {
      return { status: 'error', error: 'Chunk inválido' };
    }

    if (!activeTransfers[tid] || activeTransfers[tid].total !== total) {
      activeTransfers[tid] = {
        total: total,
        received: 0,
        parts: []
      };
    }

    var tr = activeTransfers[tid];
    if (typeof tr.parts[idx] === 'undefined') {
      tr.parts[idx] = chunkData;
      tr.received += 1;
    }

    if (tr.received < tr.total) {
      return {
        status: 'partial',
        transferId: tid,
        received: tr.received,
        total: tr.total
      };
    }

    var fullJson = tr.parts.join('');
    delete activeTransfers[tid];

    var reassembled;
    try {
      reassembled = JSON.parse(fullJson);
    } catch (err) {
      return { status: 'error', error: 'JSON reensamblado inválido' };
    }

    var normChunked = normalizeEventsPayload(reassembled);
    if (!normChunked.ok) {
      return { status: 'error', error: normChunked.error };
    }
    return { status: 'complete', payload: normChunked.payload };
  }

  var normSingle = normalizeEventsPayload(parsed);
  if (!normSingle.ok) {
    return { status: 'error', error: normSingle.error };
  }
  return { status: 'complete', payload: normSingle.payload };
}

export function resetTransfers() {
  activeTransfers = {};
}

export function formatSyncLabel(payload, source) {
  if (!payload || !payload.events) {
    return 'Sin sincronizar';
  }
  var count = payload.events.length;
  var countLabel = count === 1 ? '1 evento' : (count + ' eventos');

  if (source === 'mock' || payload.source !== 'iphone') {
    return 'Demo offline · ' + countLabel;
  }

  if (payload.syncedAt && payload.syncedAt.length >= 16) {
    var datePart = payload.syncedAt.substring(5, 10);
    var timePart = payload.syncedAt.substring(11, 16);
    return 'iPhone ' + datePart + ' ' + timePart + ' · ' + countLabel;
  }
  return 'iPhone · ' + countLabel;
}
