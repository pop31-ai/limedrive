package com.limedrive.app;

import android.app.Activity;
import android.net.Uri;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.Toast;
import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

public class MainActivity extends Activity {

    private WebView web;
    private String overrideBase = null;
    private File overrideRoot = null;
    private volatile boolean updating = false;

    private static final String ASSET_PREFIX = "file:///android_asset/www/";
    private static final String REPO_ZIP_URL = "https://github.com/pop31-ai/limedrive/archive/refs/heads/main.zip";
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

        FrameLayout root = new FrameLayout(this);
        root.addView(web, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

        Button updateBtn = new Button(this);
        updateBtn.setText("⟳ Update");
        updateBtn.setTextSize(11);
        updateBtn.setAllCaps(false);
        updateBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                updateFromGitHub();
            }
        });
        FrameLayout.LayoutParams bp = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT,
                Gravity.BOTTOM | Gravity.END);
        int m = dp(10);
        bp.setMargins(0, 0, m, m);
        root.addView(updateBtn, bp);

        setContentView(root);

        String extra = getIntent() != null ? getIntent().getStringExtra("loadUrl") : null;
        web.loadUrl(extra != null ? extra : resolveStartUrl());
    }

    private int dp(int v) {
        return Math.round(v * getResources().getDisplayMetrics().density);
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

    private void toast(final String msg) {
        runOnUiThread(new Runnable() {
            public void run() { Toast.makeText(MainActivity.this, msg, Toast.LENGTH_LONG).show(); }
        });
    }

    private void updateFromGitHub() {
        if (updating) return;
        updating = true;
        toast("Updating…");
        new Thread(new Runnable() {
            public void run() {
                try {
                    File zip = new File(getExternalFilesDir(null), "repo.zip");
                    download(REPO_ZIP_URL, zip);
                    unzipRepo(zip, ensureOverrideRoot());
                    zip.delete();
                    toast("Updated! Reloading…");
                    runOnUiThread(new Runnable() {
                        public void run() { web.loadUrl(resolveStartUrl()); }
                    });
                } catch (final Exception e) {
                    toast("Update failed: " + e.getMessage());
                } finally {
                    updating = false;
                }
            }
        }).start();
    }

    private File ensureOverrideRoot() {
        File ext = getExternalFilesDir(null);
        overrideRoot = new File(ext, "www");
        if (!overrideRoot.exists()) overrideRoot.mkdirs();
        return overrideRoot;
    }

    private static void download(String url, File out) throws Exception {
        HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
        c.setInstanceFollowRedirects(true);
        c.setConnectTimeout(15000);
        c.setReadTimeout(30000);
        int code = c.getResponseCode();
        if (code < 200 || code >= 300) throw new Exception("HTTP " + code);
        InputStream in = new BufferedInputStream(c.getInputStream());
        FileOutputStream f = new FileOutputStream(out);
        byte[] buf = new byte[8192];
        int n;
        while ((n = in.read(buf)) > 0) f.write(buf, 0, n);
        f.close();
        in.close();
        c.disconnect();
    }

    private static void deleteRecursive(File f) {
        File[] kids = f.listFiles();
        if (kids != null) for (File k : kids) deleteRecursive(k);
        if (f.exists()) f.delete();
    }

    private static void unzipRepo(File zip, File destRoot) throws Exception {
        File tmp = new File(destRoot.getParentFile(), "www_incoming");
        deleteRecursive(tmp);
        if (!tmp.mkdirs()) throw new Exception("cannot create temp dir");
        ZipInputStream z = new ZipInputStream(new BufferedInputStream(new FileInputStream(zip)));
        byte[] buf = new byte[8192];
        ZipEntry e;
        while ((e = z.getNextEntry()) != null) {
            if (e.isDirectory()) continue;
            String name = e.getName();
            int slash = name.indexOf('/');
            if (slash < 0 || slash >= name.length() - 1) continue;
            String rel = name.substring(slash + 1);
            if (rel.startsWith(".git/") || rel.equals(".gitignore")) continue;
            File out = new File(tmp, rel);
            if (!out.getCanonicalPath().startsWith(tmp.getCanonicalPath())) continue;
            File parent = out.getParentFile();
            if (parent != null && !parent.exists()) parent.mkdirs();
            FileOutputStream f = new FileOutputStream(out);
            int n;
            while ((n = z.read(buf)) > 0) f.write(buf, 0, n);
            f.close();
        }
        z.close();
        File old = destRoot;
        if (old.exists()) deleteRecursive(old);
        if (!tmp.renameTo(destRoot)) throw new Exception("rename failed");
    }
}
