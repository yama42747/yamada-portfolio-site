export const onRequest = async ({ request, env }) => {
  const auth = request.headers.get("Authorization");
  const username = env.CF_PAGES_USERNAME;
  const password = env.CF_PAGES_PASSWORD;
  const realm = "Protected";

  if (auth && auth.startsWith("Basic ")) {
    const decoded = atob(auth.split(" ")[1]);
    const [user, pass] = decoded.split(":");
    if (user === username && pass === password) {
      return; // 認証OK
    }
  }

  return new Response("Unauthorized", {
    status: 401,
    headers: { "WWW-Authenticate": `Basic realm="${realm}"` },
  });
};
