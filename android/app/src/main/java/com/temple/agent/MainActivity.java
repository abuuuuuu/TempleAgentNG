package com.temple.agent;
import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // ⚠️ Fuerza al WebView a permitir contenido mixto
    this.getBridge().getWebView().getSettings().setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

    // ⚠️ Verifica que el WebView está sirviendo desde file:// (solo para testing)
    //android.util.Log.d("DEBUG", "WebView URL: " + this.getBridge().getWebView().getUrl());
  }
}

