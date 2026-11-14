package com.meera.rc5;
import androidx.test.ext.junit.runners.AndroidJUnit4;import androidx.test.platform.app.InstrumentationRegistry;import android.content.Context;import org.junit.*;import org.junit.runner.RunWith;import org.json.*;import static org.junit.Assert.*;
@RunWith(AndroidJUnit4.class)
public class QueueDbDeviceTest{
 @Test public void commitSurvivesReopenAndPartitionsAccounts()throws Exception{
  Context c=InstrumentationRegistry.getInstrumentation().getTargetContext();c.deleteDatabase("rc5-queue.db");
  String payload="{\"requestId\":\"01234567-0123-4567-8901-012345678901\",\"box\":\"A1\",\"machine\":\"1\"}",digest=Protocol.hash(payload);
  try(QueueDb db=new QueueDb(c)){db.insert("alice","test",payload,digest);db.insert("alice","test",payload,digest);assertEquals(1,db.list("alice","test").length());}
  try(QueueDb db=new QueueDb(c)){assertEquals(1,db.list("alice","test").length());assertEquals(0,db.list("bob","test").length());assertEquals(0,db.list("alice","other-test").length());assertEquals(1,db.claim("alice","test").length());assertEquals(0,db.claim("alice","test").length());}
  c.deleteDatabase("rc5-queue.db");
 }
}
