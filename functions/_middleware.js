export async function onRequest(context) {
  const auth = context.request.headers.get("Authorization");

  const USER = "guest118”;
  const PASS = "port228”;

  if (!auth || !auth.startsWith("Basic ")) {
    return new Response("Authentication required", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Private"' },
    });
  }

  const decoded = atob(auth.split(" ")[1]);
  const [user, pass] = decoded.split(":");

  if (user !== USER || pass !== PASS) {
    return new Response("Forbidden", { status: 403 });
  }

  return context.next();
}
