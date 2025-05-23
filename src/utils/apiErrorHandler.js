export function handleApiError(error, navigate) {
  if (
    error.response &&
    [400, 401, 403, 404, 500, 502, 503, 504].includes(error.response.status)
  ) {
    navigate(`/error/${error.response.status}`);
    return true;
  }
  return false;
}
