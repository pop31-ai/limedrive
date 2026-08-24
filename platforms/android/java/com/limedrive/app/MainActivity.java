package com.limedrive.app;

import android.app.Activity;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

public class MainActivity extends Activity {

    private WebView web;
    private String overrideBase = null;
    private File overrideRoot = null;

    private static final String ASSET_PREFIX = "file:///android_asset/www/";
    private static final Map<String, String> MIME = new HashMap<String, String>();
    static {
        MIME.put("html", "text/html");
        MIME.put("js", "application/javascript");
        MIME.put("json", "application/json");
        MIME.put("css", "text/css");
        MIME.put("png", "image/png");
        MIME.put("jpg", "image/jpeg");
        MIME.put("jpeg", "image/jpeg");
        MIME.put("gif", "image/gif");
        MIME.put("svg", "image/svg+xml");
        MIME.put("ico", "image/x-icon");
        MIME.put("md", "text/plain");
        MIME.put("txt", "text/plain");
        MIME.put("xml", "text/xml");
        MIME.put("webp", "image/webp");
        MIME.put("woff2", "font/woff2");
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        web = new WebView(this);
        WebSettings st = web.getSettings();
        st.setJavaScriptEnabled(true);
        st.setDomStorageEnabled(true);
        st.setAllowFileAccess(true);
        st.setAllowContentAccess(true);
        st.setAllowFileAccessFromFileURLs(true);
        st.setAllowUniversalAccessFromFileURLs(true);
        st.setLoadsImagesAutomatically(true);
        st.setMediaPlaybackRequiresUserGesture(false);
        st.setLoadWithOverviewMode(true);
        st.setUseWideViewPort(true);
        st.setTextZoom(100);

        web.setBackgroundColor(0xFF0A0A14);
        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return intercept(request.getUrl());
            }
        });
        web.setWebChromeClient(new WebChromeClient());
        web.loadUrl(resolveStartUrl());
        setContentView(web);
    }

    private String resolveStartUrl() {
        String asset = "file:///android_asset/www/index.html";
        try {
            File ext = getExternalFilesDir(null);
            if (ext == null) return asset;
            overrideRoot = new File(ext, "www");
            File overrideIndex = new File(overrideRoot, "index.html");
            if (overrideIndex.exists()) {
                overrideBase = Uri.fromFile(overrideRoot).toString() + "/";
                return Uri.fromFile(new File(overrideRoot, "index.html")).toString();
            }
        } catch (Exception ignored) {
        }
        return asset;
    }

    private WebResourceResponse intercept(Uri uri) {
        try {
            if (!"file".equals(uri.getScheme())) return null;
            String url = uri.toString();
            String path = null;
            boolean fromAssets = true;
            InputStream in = null;

            if (url.startsWith(ASSET_PREFIX)) {
                path = url.substring(ASSET_PREFIX.length());
            } else if (overrideBase != null && url.startsWith(overrideBase)) {
                path = url.substring(overrideBase.length());
                fromAssets = false;
            }
            if (path == null || path.length() == 0) return null;

            int cut = path.indexOf('?');
            if (cut >= 0) path = path.substring(0, cut);
            cut = path.indexOf('#');
            if (cut >= 0) path = path.substring(0, cut);
            path = Uri.decode(path);
            if (path.contains("..")) return null;

            if (fromAssets) {
                in = getAssets().open("www/" + path);
            } else {
                File f = new File(overrideRoot, path);
                if (!f.exists()) return null;
                in = new FileInputStream(f);
            }

            String ext = path;
            int dot = path.lastIndexOf('.');
            if (dot >= 0) ext = path.substring(dot + 1).toLowerCase();
            String mime = MIME.containsKey(ext) ? (String) MIME.get(ext) : "application/octet-stream";
            String encoding = (mime.startsWith("text/") || mime.equals("application/json") || mime.equals("application/javascript")) ? "utf-8" : null;
            Map<String, String> headers = new HashMap<String, String>();
            headers.put("Access-Control-Allow-Origin", "*");
            return new WebResourceResponse(mime, encoding, in);
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public void onBackPressed() {
        if (web != null && web.canGoBack()) {
            web.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onDestroy() {
        if (web != null) {
            web.destroy();
            web = null;
        }
        super.onDestroy();
    }
}
