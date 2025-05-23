export function handleApiError(error, navigate) {
  if (error?.response) {
    // If navigate is provided, use it
    if (navigate) {
      navigate(`/error/${error.response.status}`);
    }
    return true;
  }
  return false;
}
