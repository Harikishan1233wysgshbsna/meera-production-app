package com.meera.rc5;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
public class MainActivity extends BridgeActivity {
 @Override public void onCreate(Bundle state){registerPlugin(RC5QueuePlugin.class);super.onCreate(state);}
}
