export default (uri, cb, errorCb) => {
  fetch(uri)
    .then(response => response.json())
    .then(cb)
    .catch(errorCb)
}
