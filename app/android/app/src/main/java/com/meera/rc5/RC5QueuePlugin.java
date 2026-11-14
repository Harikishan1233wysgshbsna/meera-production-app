package com.meera.rc5;
import com.getcapacitor.*;import com.getcapacitor.annotation.CapacitorPlugin;import org.json.*;import java.util.concurrent.*;
@CapacitorPlugin(name="RC5Queue")
public class RC5QueuePlugin extends Plugin{
 private final ExecutorService io=Executors.newSingleThreadExecutor();
 interface Job{JSONObject run()throws Exception;}
 private void run(PluginCall call,Job job){io.execute(()->{try{call.resolve(JSObject.fromJSONObject(job.run()));}catch(Exception e){call.reject(e.getMessage());}});}
 private SessionVault vault(){return new SessionVault(getContext());}
 private String endpoint(){return getContext().getSharedPreferences("rc5-config",0).getString("endpoint","");}
 @PluginMethod public void configure(PluginCall call){run(call,()->{String url=call.getString("endpoint","");CloudApi.endpoint(url);vault().clear();getContext().getSharedPreferences("rc5-config",0).edit().putString("endpoint",url).commit();return new JSONObject().put("ok",true);});}
 @PluginMethod public void setSession(PluginCall call){run(call,()->{String token=call.getString("token","");String endpoint=endpoint();JSONObject user;if(endpoint.isEmpty()&&token.equals("mock-only"))user=new JSONObject().put("username","demo").put("machines",new JSONArray().put(1));else{JSONObject result=CloudApi.post(endpoint,new JSONObject().put("action","nativeMe").put("token",token));if(!result.optBoolean("ok"))throw new Exception("Session validation failed");user=result.getJSONObject("user");}JSONObject session=new JSONObject().put("token",token).put("user",user).put("owner",user.getString("username").trim().toLowerCase()).put("endpoint",endpoint).put("epoch",java.util.UUID.randomUUID().toString());vault().set(session);SyncWorker.schedule(getContext());return session;});}
 @PluginMethod public void getSession(PluginCall call){run(call,()->{JSONObject s=vault().get();return s==null?new JSONObject():s;});}
 @PluginMethod public void clearSession(PluginCall call){run(call,()->{vault().clear();return new JSONObject().put("ok",true);});}
 @PluginMethod public void enqueue(PluginCall call){run(call,()->{JSONObject s=vault().get();if(s==null)throw new Exception("Login required");String payload=call.getString("payloadJson",""),hash=call.getString("digest","");Protocol.validate(payload,hash);try(QueueDb db=new QueueDb(getContext())){JSONObject row=db.insert(s.getString("owner"),s.getString("endpoint"),payload,hash);SyncWorker.schedule(getContext());return row;}});}
 @PluginMethod public void list(PluginCall call){run(call,()->{JSONObject s=vault().get();try(QueueDb db=new QueueDb(getContext())){return new JSONObject().put("entries",s==null?new JSONArray():db.list(s.getString("owner"),s.getString("endpoint")));}});}
 @PluginMethod public void sync(PluginCall call){run(call,()->{SyncWorker.schedule(getContext());return new JSONObject().put("scheduled",true);});}
 @PluginMethod public void request(PluginCall call){run(call,()->{JSONObject body=call.getObject("body",new JSObject());if(body.optString("action").startsWith("native"))throw new Exception("Reserved native action");return CloudApi.post(endpoint(),new JSONObject().put("action","nativeRpc").put("request",body));});}
}
