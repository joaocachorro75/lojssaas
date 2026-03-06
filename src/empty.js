const nativeFetch = typeof window !== 'undefined' ? window.fetch : undefined;

const fetchMock = function(...args) {
  if (nativeFetch) {
    return nativeFetch.apply(window, args);
  }
  return Promise.reject(new Error('Fetch not available'));
};

// Only add properties if they don't exist
if (typeof window !== 'undefined') {
  fetchMock.Headers = window.Headers;
  fetchMock.Request = window.Request;
  fetchMock.Response = window.Response;
}

export default fetchMock;
export const FormData = typeof window !== 'undefined' ? window.FormData : undefined;
export const fetch = fetchMock;
export const Request = typeof window !== 'undefined' ? window.Request : undefined;
export const Response = typeof window !== 'undefined' ? window.Response : undefined;
export const Headers = typeof window !== 'undefined' ? window.Headers : undefined;
export const Blob = typeof window !== 'undefined' ? window.Blob : undefined;
export const File = typeof window !== 'undefined' ? window.File : undefined;
export const AbortController = typeof window !== 'undefined' ? window.AbortController : undefined;
