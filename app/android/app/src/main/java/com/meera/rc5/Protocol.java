package com.meera.rc5;
import org.json.*;import java.nio.charset.StandardCharsets;import java.security.MessageDigest;
public final class Protocol{
 public static String hash(String text)throws Exception{byte[] b=MessageDigest.getInstance("SHA-256").digest(text.getBytes(StandardCharsets.UTF_8));StringBuilder s=new StringBuilder();for(byte x:b)s.append(String.format("%02x",x&255));return s.toString();}
 public static void validate(String payload,String digest)throws Exception{JSONObject p=new JSONObject(payload);if(payload.length()>45000||p.has("token")||!hash(payload).equals(digest)||!p.getString("requestId").matches("[A-Za-z0-9-]{16,100}")||p.getString("box").isEmpty()||p.getInt("machine")<1||p.getInt("machine")>111)throw new IllegalArgumentException("Invalid payload/digest");}
 public static boolean matches(JSONObject row,JSONObject r)throws Exception{JSONObject p=new JSONObject(row.getString("payloadJson"));return row.getString("requestId").equals(r.optString("requestId"))&&row.getString("owner").equals(r.optString("owner"))&&row.getString("digest").equals(r.optString("digest"))&&p.getString("box").equals(r.optString("box"))&&p.getString("machine").equals(r.optString("machine"));}
}
