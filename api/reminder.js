import { handleReminder } from '../server/reminderHttp.js';

export default function handler(req, res) {
  return handleReminder(req, res);
}
