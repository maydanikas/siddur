self.addEventListener('push', function (event) {
  var payload = {};
  if (event.data) {
    try {
      payload = event.data.json();
    } catch (e) {
      payload = { title: 'Shacharis', body: event.data.text() };
    }
  }
  var title = payload.title || 'Shacharis';
  event.waitUntil(self.registration.showNotification(title, {
    body: payload.body || 'Shacharis',
    icon: '/icon-192.png',
    badge: '/icon-badge.png',
    tag: 'shacharis-reminder',
    renotify: true,
    lang: payload.lang || 'en',
    data: { url: payload.url || '/' },
    vibrate: [180, 80, 180],
  }));
});

self.addEventListener('notificationclick', function (event) {
  var tag = (event.notification && event.notification.tag) || '';
  var data = (event.notification && event.notification.data) || {};
  var url = '/';
  if (tag.indexOf('shacharis-support') === 0) {
    url = data.url || '/about';
  } else if (tag.indexOf('shacharis-reminder') === 0) {
    url = data.url || '/';
  } else {
    return;
  }
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (windows) {
      for (var i = 0; i < windows.length; i++) {
        var client = windows[i];
        if (typeof client.navigate === 'function') {
          return client.navigate(url).then(function (opened) {
            if (opened && opened.focus) return opened.focus();
            if (client.focus) return client.focus();
            return opened;
          });
        }
        if (client.focus) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    }),
  );
});
