import { handleDispatch } from '../server/reminderHttp.js';

export default function handler(req, res) {
  return handleDispatch(req, res);
}
