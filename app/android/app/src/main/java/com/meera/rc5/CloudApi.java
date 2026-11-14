package com.meera.rc5;
import org.json.*;import okhttp3.*;import java.net.URI;import java.util.concurrent.TimeUnit;
public final class CloudApi{
 private static final OkHttpClient client=new OkHttpClient.Builder().connectTimeout(15,TimeUnit.SECONDS).readTimeout(60,TimeUnit.SECONDS).callTimeout(90,TimeUnit.SECONDS).build();
 public static void endpoint(String endpoint)throws Exception{URI u=new URI(endpoint);if(!"https".equals(u.getScheme())||!"script.google.com".equals(u.getHost())||u.getRawQuery()!=null||u.getFragment()!=null||u.getUserInfo()!=null||!u.getPath().matches("/macros/s/[^/]+/exec"))throw new IllegalArgumentException("Isolated Apps Script HTTPS /exec URL required");}
 public static JSONObject post(String endpoint,JSONObject body)throws Exception{endpoint(endpoint);Request req=new Request.Builder().url(endpoint).post(RequestBody.create(body.toString(),MediaType.get("text/plain; charset=utf-8"))).build();try(Response r=client.newCall(req).execute()){if(!r.isSuccessful()||r.body()==null)throw new Exception("HTTP "+r.code());return new JSONObject(r.body().string());}}
}
