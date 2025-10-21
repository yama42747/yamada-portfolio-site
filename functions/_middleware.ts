export async function onRequest(context) {
  const password = "pass123"; // ← 好きなパスワードに変更！
  const auth = context.request.headers.get("Authorization");

  // すでに認証済みならOK
  if (auth === `Basic ${btoa('user:' + password)}`) {
    return await context.next();
  }

  // 未認証の場合はログイン画面を出す
  return new Response("🔒 Enter password to view this site", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Protected"',
    },
  });
}
