package com.meera.rc5;
import org.junit.Test;import org.json.JSONObject;import static org.junit.Assert.*;
public class ProtocolTest {
 @Test public void sha256UsesUtf8()throws Exception {assertEquals("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",Protocol.hash("abc"));}
 @Test public void completeReceiptIdentityRequired()throws Exception {
  String payload="{\"requestId\":\"01234567-0123-4567-8901-012345678901\",\"box\":\"A1\",\"machine\":\"1\"}";String hash=Protocol.hash(payload);Protocol.validate(payload,hash);
  JSONObject row=new JSONObject().put("requestId","01234567-0123-4567-8901-012345678901").put("owner","alice").put("payloadJson",payload).put("digest",hash);
  JSONObject result=new JSONObject().put("requestId",row.getString("requestId")).put("owner","alice").put("box","A1").put("machine","1").put("digest",hash);
  assertTrue(Protocol.matches(row,result));for(String key:new String[]{"requestId","owner","box","machine","digest"}){JSONObject bad=new JSONObject(result.toString()).put(key,"wrong");assertFalse(Protocol.matches(row,bad));}
 }
 @Test(expected=IllegalArgumentException.class) public void rejectDigestTamper()throws Exception {Protocol.validate("{}","bad");}
 @Test(expected=IllegalArgumentException.class) public void rejectPersistedToken()throws Exception {String payload="{\"token\":\"secret\"}";Protocol.validate(payload,Protocol.hash(payload));}
}
