self.addEventListener('notificationclick', function (event) {
  var tag = (event.notification && event.notification.tag) || '';
  if (tag.indexOf('shacharis-reminder') !== 0) return;
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (windows) {
      for (var i = 0; i < windows.length; i++) {
        if (windows[i].focus) return windows[i].focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow('/');
    }),
  );
});
