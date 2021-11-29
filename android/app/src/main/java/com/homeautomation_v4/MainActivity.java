package com.homeautomation_v4;

import com.facebook.react.ReactActivity;


import android.content.Intent;
import android.util.Log;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.modules.core.DeviceEventManagerModule;


import android.content.Intent; // <-- include if not already there
import com.tkporter.sendsms.SendSMSPackage;



public class MainActivity extends ReactActivity {



  
   // Add from here down to the end of your MainActivity
   public boolean isOnNewIntent = false;

   
  @Override
  public void onActivityResult(int requestCode, int resultCode, Intent data) {
    super.onActivityResult(requestCode, resultCode, data);
    //probably some other stuff here
    SendSMSPackage.getInstance().onActivityResult(requestCode, resultCode, data);
  }
  

   @Override
   public void onNewIntent(Intent intent) {
     super.onNewIntent(intent);
     isOnNewIntent = true;
     ForegroundEmitter();
   }
 
   @Override
   protected void onStart() {
     super.onStart();
     if(isOnNewIntent == true){}else {
         ForegroundEmitter();
     }
   }
 
   public  void  ForegroundEmitter(){
     // this method is to send back data from java to javascript so one can easily
     // know which button from notification or the notification button is clicked
     String  main = getIntent().getStringExtra("mainOnPress");
     String  btn = getIntent().getStringExtra("buttonOnPress");
     String  btn2 = getIntent().getStringExtra("button2OnPress");
     WritableMap  map = Arguments.createMap();
     if (main != null) {
         map.putString("main", main);
     }
     if (btn != null) {
         map.putString("button", btn);
     }
     if (btn2 != null) {
         map.putString("button", btn);
     }
     try {
         getReactInstanceManager().getCurrentReactContext()
         .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
         .emit("notificationClickHandle", map);
     } catch (Exception  e) {
     Log.e("SuperLog", "Caught Exception: " + e.getMessage());
     }
   }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "homeautomation_v4";
  }
}
