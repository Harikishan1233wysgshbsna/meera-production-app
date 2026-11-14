package com.meera.rc5;
import android.content.*;import androidx.work.*;import org.json.*;import java.util.concurrent.TimeUnit;
public final class SyncWorker extends Worker{
 public SyncWorker(Context c,WorkerParameters p){super(c,p);}
 public static void schedule(Context c){Constraints constraints=new Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build();WorkManager.getInstance(c).enqueueUniqueWork("rc5-native-upload",ExistingWorkPolicy.KEEP,new OneTimeWorkRequest.Builder(SyncWorker.class).setConstraints(constraints).setBackoffCriteria(BackoffPolicy.EXPONENTIAL,30,TimeUnit.SECONDS).build());WorkManager.getInstance(c).enqueueUniquePeriodicWork("rc5-native-recovery",ExistingPeriodicWorkPolicy.KEEP,new PeriodicWorkRequest.Builder(SyncWorker.class,15,TimeUnit.MINUTES).setConstraints(constraints).build());}
 private Result continueQueue(QueueDb db,String owner,String endpoint){long delay=db.nextDelay(owner,endpoint);if(delay>=0){Constraints constraints=new Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build();WorkManager.getInstance(getApplicationContext()).enqueueUniqueWork("rc5-native-upload",ExistingWorkPolicy.APPEND_OR_REPLACE,new OneTimeWorkRequest.Builder(SyncWorker.class).setConstraints(constraints).setInitialDelay(Math.max(1000,delay),TimeUnit.MILLISECONDS).setBackoffCriteria(BackoffPolicy.EXPONENTIAL,30,TimeUnit.SECONDS).build());}return Result.success();}
 public Result doWork(){QueueDb db=new QueueDb(getApplicationContext());SessionVault vault=new SessionVault(getApplicationContext());JSONArray rows=new JSONArray();try{
   JSONObject session=vault.get();if(session==null||session.optString("endpoint").isEmpty())return Result.success();String owner=session.getString("owner"),endpoint=session.getString("endpoint");
   rows=db.claim(owner,endpoint);if(rows.length()==0)return continueQueue(db,owner,endpoint);
   if(!vault.current(session))return Result.retry();JSONObject body=new JSONObject().put("action","nativeBatch").put("protocol",1).put("owner",owner).put("token",session.getString("token")).put("entries",rows);
   JSONObject response=CloudApi.post(endpoint,body);
   if(!vault.current(session)){for(int i=0;i<rows.length();i++)db.retry(rows.getJSONObject(i),"ACCOUNT_CHANGED");return Result.success();}
   if("AUTH_REQUIRED".equals(response.optString("errorCode"))){vault.expire(session);for(int i=0;i<rows.length();i++)db.retry(rows.getJSONObject(i),"AUTH_REQUIRED");return Result.success();}
   if(!response.optBoolean("ok"))throw new Exception("Unverified cloud response");JSONArray results=response.getJSONArray("results");
   for(int i=0;i<rows.length();i++){JSONObject row=rows.getJSONObject(i),match=null;for(int j=0;j<results.length();j++){JSONObject r=results.getJSONObject(j);if(row.getString("requestId").equals(r.optString("requestId"))){if(match!=null)throw new Exception("Duplicate response identity");match=r;}}
     try{if(match==null)throw new Exception("Missing receipt");db.apply(row,match);}catch(Exception err){db.retry(row,"UNVERIFIED_RECEIPT");}}
   return continueQueue(db,owner,endpoint);
 }catch(Exception err){for(int i=0;i<rows.length();i++)try{db.retry(rows.getJSONObject(i),"NETWORK_OR_PROTOCOL");}catch(Exception ignored){}return Result.retry();}finally{db.close();}}
}
