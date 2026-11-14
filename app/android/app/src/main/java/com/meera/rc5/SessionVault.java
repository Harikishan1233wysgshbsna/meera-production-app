package com.meera.rc5;
import android.content.*;import android.security.keystore.*;import android.util.Base64;import javax.crypto.*;import javax.crypto.spec.GCMParameterSpec;import java.security.KeyStore;import org.json.JSONObject;
/** AES-GCM encrypted private preferences; AES key never leaves Android Keystore. */
public final class SessionVault{
 private final Context context;private static final Object LOCK=new Object();
 public SessionVault(Context c){context=c.getApplicationContext();}
 private javax.crypto.SecretKey key()throws Exception{KeyStore ks=KeyStore.getInstance("AndroidKeyStore");ks.load(null);if(!ks.containsAlias("rc5-session")){KeyGenerator g=KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES,"AndroidKeyStore");g.init(new KeyGenParameterSpec.Builder("rc5-session",KeyProperties.PURPOSE_ENCRYPT|KeyProperties.PURPOSE_DECRYPT).setBlockModes(KeyProperties.BLOCK_MODE_GCM).setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE).build());g.generateKey();}return (javax.crypto.SecretKey)ks.getKey("rc5-session",null);}
 public JSONObject get()throws Exception{synchronized(LOCK){String s=context.getSharedPreferences("rc5-vault",0).getString("session",null);if(s==null)return null;String[] parts=s.split(":");Cipher cipher=Cipher.getInstance("AES/GCM/NoPadding");cipher.init(Cipher.DECRYPT_MODE,key(),new GCMParameterSpec(128,Base64.decode(parts[0],0)));return new JSONObject(new String(cipher.doFinal(Base64.decode(parts[1],0)),java.nio.charset.StandardCharsets.UTF_8));}}
 public void set(JSONObject session)throws Exception{synchronized(LOCK){Cipher c=Cipher.getInstance("AES/GCM/NoPadding");c.init(Cipher.ENCRYPT_MODE,key());String enc=Base64.encodeToString(c.getIV(),2)+":"+Base64.encodeToString(c.doFinal(session.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8)),2);if(!context.getSharedPreferences("rc5-vault",0).edit().putString("session",enc).commit())throw new Exception("Secure session commit failed");}}
 public void clear()throws Exception{synchronized(LOCK){if(!context.getSharedPreferences("rc5-vault",0).edit().remove("session").commit())throw new Exception("Secure logout commit failed");}}
 public boolean current(JSONObject s)throws Exception{JSONObject now=get();return now!=null&&now.optString("epoch").equals(s.optString("epoch"));}
 public void expire(JSONObject s)throws Exception{synchronized(LOCK){if(current(s))clear();}}
}
