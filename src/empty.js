console.log('Empty module loaded (fetch alias)');
const _fetch = typeof window !== 'undefined' ? window.fetch : () => {};
if (_fetch) {
  _fetch.fetch = _fetch;
  _fetch.default = _fetch;
  _fetch.Headers = typeof window !== 'undefined' ? window.Headers : class {};
  _fetch.Request = typeof window !== 'undefined' ? window.Request : class {};
  _fetch.Response = typeof window !== 'undefined' ? window.Response : class {};
}
export default _fetch;
export const FormData = typeof window !== 'undefined' ? window.FormData : class {};
export const fetch = _fetch;
export const Request = typeof window !== 'undefined' ? window.Request : class {};
export const Response = typeof window !== 'undefined' ? window.Response : class {};
export const Headers = typeof window !== 'undefined' ? window.Headers : class {};
export const Blob = typeof window !== 'undefined' ? window.Blob : class {};
export const File = typeof window !== 'undefined' ? window.File : class {};
export const AbortController = typeof window !== 'undefined' ? window.AbortController : class {};
