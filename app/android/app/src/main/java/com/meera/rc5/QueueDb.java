package com.meera.rc5;

import android.content.*;import android.database.Cursor;import android.database.sqlite.*;import org.json.*;import java.util.*;

/** Payload and identity are immutable. Tokens are never stored in SQLite. */
public final class QueueDb extends SQLiteOpenHelper {
  public QueueDb(Context c){super(c,"rc5-queue.db",null,1);setWriteAheadLoggingEnabled(true);}
  public void onConfigure(SQLiteDatabase d){d.execSQL("PRAGMA synchronous=FULL");}
  public void onCreate(SQLiteDatabase d){d.execSQL("CREATE TABLE queue(id TEXT PRIMARY KEY,owner TEXT NOT NULL,endpoint TEXT NOT NULL,payload TEXT NOT NULL,digest TEXT NOT NULL,state TEXT NOT NULL,attempts INTEGER NOT NULL DEFAULT 0,next INTEGER NOT NULL DEFAULT 0,lease INTEGER NOT NULL DEFAULT 0,created TEXT NOT NULL,cloud TEXT NOT NULL DEFAULT '',error TEXT NOT NULL DEFAULT '')");d.execSQL("CREATE INDEX pending ON queue(owner,endpoint,next,lease)");}
  public void onUpgrade(SQLiteDatabase d,int a,int b){throw new IllegalStateException("Explicit migration required");}
  private JSONObject row(Cursor c)throws JSONException {return new JSONObject().put("requestId",c.getString(0)).put("owner",c.getString(1)).put("endpoint",c.getString(2)).put("payloadJson",c.getString(3)).put("digest",c.getString(4)).put("state",c.getString(5)).put("attempts",c.getInt(6)).put("createdAt",c.getString(9)).put("cloudReceivedAt",c.getString(10)).put("error",c.getString(11));}
  public synchronized JSONObject insert(String owner,String endpoint,String payload,String digest)throws Exception{
    JSONObject p=new JSONObject(payload);String id=p.getString("requestId");SQLiteDatabase d=getWritableDatabase();d.beginTransaction();try{
      try(Cursor c=d.rawQuery("SELECT * FROM queue WHERE id=?",new String[]{id})){if(c.moveToFirst()){JSONObject old=row(c);if(!old.getString("owner").equals(owner)||!old.getString("endpoint").equals(endpoint)||!old.getString("payloadJson").equals(payload))throw new IllegalArgumentException("Request identity conflict");d.setTransactionSuccessful();return old;}}
      ContentValues v=new ContentValues();v.put("id",id);v.put("owner",owner);v.put("endpoint",endpoint);v.put("payload",payload);v.put("digest",digest);v.put("state","LOCAL_SAVED");v.put("created",java.time.Instant.now().toString());d.insertOrThrow("queue",null,v);d.setTransactionSuccessful();
    }finally{d.endTransaction();}try(Cursor c=d.rawQuery("SELECT * FROM queue WHERE id=?",new String[]{id})){if(!c.moveToFirst())throw new IllegalStateException("Local verification failed");return row(c);}
  }
  public synchronized JSONArray list(String owner,String endpoint)throws Exception{JSONArray out=new JSONArray();try(Cursor c=getReadableDatabase().rawQuery("SELECT * FROM queue WHERE owner=? AND endpoint=? ORDER BY created LIMIT 10000",new String[]{owner,endpoint})){while(c.moveToNext())out.put(row(c));}return out;}
  public synchronized JSONArray claim(String owner,String endpoint)throws Exception{
    SQLiteDatabase d=getWritableDatabase();JSONArray rows=new JSONArray();long now=System.currentTimeMillis();d.beginTransaction();try{try(Cursor c=d.rawQuery("SELECT * FROM queue WHERE owner=? AND endpoint=? AND state NOT IN ('PRODUCTION_CONFIRMED','REVIEW_REQUIRED') AND next<=? AND lease<=? ORDER BY created LIMIT 10",new String[]{owner,endpoint,""+now,""+now})){while(c.moveToNext())rows.put(row(c));}
      for(int i=0;i<rows.length();i++)d.execSQL("UPDATE queue SET state='UPLOADING',attempts=attempts+1,lease=? WHERE id=?",new Object[]{now+180000,rows.getJSONObject(i).getString("requestId")});d.setTransactionSuccessful();return rows;
    }finally{d.endTransaction();}
  }
  public synchronized void apply(JSONObject row,JSONObject result)throws Exception{
    if(!Protocol.matches(row,result))throw new IllegalArgumentException("Receipt identity mismatch");String state=result.getString("state");if(!List.of("CLOUD_RECEIVED","PRODUCTION_CONFIRMED","REVIEW_REQUIRED","RETRY_PENDING").contains(state))throw new IllegalArgumentException("Invalid receipt state");
    ContentValues v=new ContentValues();v.put("state",state);v.put("lease",0);v.put("next",System.currentTimeMillis()+30000);v.put("error",result.optString("errorCode",""));
    if(state.equals("CLOUD_RECEIVED")||state.equals("PRODUCTION_CONFIRMED"))v.put("cloud",row.optString("cloudReceivedAt","").isEmpty()?java.time.Instant.now().toString():row.getString("cloudReceivedAt"));
    getWritableDatabase().update("queue",v,"id=? AND owner=? AND endpoint=?",new String[]{row.getString("requestId"),row.getString("owner"),row.getString("endpoint")});
  }
  public synchronized void retry(JSONObject row,String reason)throws Exception{int attempts=row.optInt("attempts",0)+1;long delay=Math.min(3600000L,30000L*(1L<<Math.min(attempts,7)));getWritableDatabase().execSQL("UPDATE queue SET state='RETRY_PENDING',lease=0,next=?,error=? WHERE id=? AND owner=? AND endpoint=?",new Object[]{System.currentTimeMillis()+delay,reason,row.getString("requestId"),row.getString("owner"),row.getString("endpoint")});}
  public long nextDelay(String owner,String endpoint){try(Cursor c=getReadableDatabase().rawQuery("SELECT MIN(MAX(next,lease)) FROM queue WHERE owner=? AND endpoint=? AND state NOT IN ('PRODUCTION_CONFIRMED','REVIEW_REQUIRED')",new String[]{owner,endpoint})){if(!c.moveToFirst()||c.isNull(0))return -1;return Math.max(0,c.getLong(0)-System.currentTimeMillis());}}
  public boolean pending(String owner,String endpoint){try(Cursor c=getReadableDatabase().rawQuery("SELECT 1 FROM queue WHERE owner=? AND endpoint=? AND state NOT IN ('PRODUCTION_CONFIRMED','REVIEW_REQUIRED') LIMIT 1",new String[]{owner,endpoint})){return c.moveToFirst();}}
}
