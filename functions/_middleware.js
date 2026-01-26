export async function onRequest({ request, next }) {
  const auth = request.headers.get("Authorization");

  const USER = "admin";
  const PASS = "password123";

  // 認証情報がない場合
  if (!auth) {
    return new Response("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Private Site"',
      },
    });
  }

  // Basic xxxxx の xxxxx 部分を取り出す
  const encoded = auth.split(" ")[1];
  if (!encoded) {
    return new Response("Unauthorized", { status: 401 });
  }

  const decoded = atob(encoded);
  const [user, pass] = decoded.split(":");

  // 認証失敗
  if (user !== USER || pass !== PASS) {
    return new Response("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Private Site"',
      },
    });
  }

  // 認証OK → 通す
  return next();
}
