import { push } from 'notivue'

export const notify = {
  // Duración única para todos (ms)
  _duration: 2000,
  _opts(message, title) {
    const opts = { message, duration: this._duration }
    if (title) opts.title = title
    return opts
  },
  success(message, title) {
    return push.success(this._opts(message, title))
  },
  error(message, title) {
    return push.error(this._opts(message, title))
  },
  warning(message, title) {
    return push.warning(this._opts(message, title))
  },
  info(message, title) {
    return push.info(this._opts(message, title))
  },
  clear() {
    return push.clear()
  },
  dismiss(id) {
    return push.dismiss(id)
  }
}


