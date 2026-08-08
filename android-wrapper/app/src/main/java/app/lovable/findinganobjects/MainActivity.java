package app.lovable.findinganobjects;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.graphics.Color;
import android.net.ConnectivityManager;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.TextView;

public final class MainActivity extends Activity {
    private static final String GAME_URL =
        "https://id-preview--845a5817-01bd-499d-a8f8-5d8804bbb5e0.lovable.app";

    private WebView webView;

    @Override
    @SuppressLint("SetJavaScriptEnabled")
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (!isOnline()) {
            TextView message = new TextView(this);
            message.setText("Finding an Objects needs an internet connection.\n\nConnect to the internet and reopen the game.");
            message.setTextSize(20);
            message.setTextColor(Color.rgb(44, 48, 72));
            message.setGravity(android.view.Gravity.CENTER);
            message.setPadding(48, 48, 48, 48);
            message.setBackgroundColor(Color.rgb(243, 242, 251));
            setContentView(message);
            return;
        }

        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(243, 242, 251));
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setMediaPlaybackRequiresUserGesture(false);
        webView.getSettings().setSupportZoom(false);
        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String host = request.getUrl().getHost();
                if (host != null && host.endsWith("lovable.app")) {
                    return false;
                }
                return true;
            }
        });
        webView.setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
        setContentView(webView);
        webView.loadUrl(GAME_URL);
    }

    private boolean isOnline() {
        ConnectivityManager manager = getSystemService(ConnectivityManager.class);
        Network network = manager.getActiveNetwork();
        if (network == null) return false;
        NetworkCapabilities capabilities = manager.getNetworkCapabilities(network);
        return capabilities != null && capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET);
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}