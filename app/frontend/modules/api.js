export function ajax(url, type, data = {}, success = (r) => console.log(r)) {
  $.ajax({ url: url, type: type, data: data, success: success });
}
