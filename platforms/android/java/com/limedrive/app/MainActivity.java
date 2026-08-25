package com.limedrive.app;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.ContentValues;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.Toast;
import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
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

        LinearLayout btns = new LinearLayout(this);
        btns.setOrientation(LinearLayout.VERTICAL);

        Button updateBtn = new Button(this);
        updateBtn.setText("⟳ Update (Downloads ZIP)");
        updateBtn.setTextSize(11);
        updateBtn.setAllCaps(false);
        updateBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                updateFromGitHub();
            }
        });
        btns.addView(updateBtn);

        Button zipBtn = new Button(this);
        zipBtn.setText("📂 Import ZIP…");
        zipBtn.setTextSize(11);
        zipBtn.setAllCaps(false);
        zipBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                pickZip();
            }
        });
        btns.addView(zipBtn);

        FrameLayout.LayoutParams bp = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT,
                Gravity.BOTTOM | Gravity.END);
        int m = dp(10);
        bp.setMargins(0, 0, m, m);
        root.addView(btns, bp);

        setContentView(root);

        web.addJavascriptInterface(new Bridge(), "LimeAndroid");

        String extra = getIntent() != null ? getIntent().getStringExtra("loadUrl") : null;
        web.loadUrl(extra != null ? extra : resolveStartUrl());
    }

    public class Bridge {

        @JavascriptInterface
        public void launchApp(String pkg, String webUrl) {
            try {
                Intent i = getPackageManager().getLaunchIntentForPackage(pkg);
                if (i != null) {
                    i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(i);
                    return;
                }
                openUrl(webUrl);
            } catch (ActivityNotFoundException e) {
                openUrl(webUrl);
            } catch (Exception ignored) {
            }
        }

        @JavascriptInterface
        public void openUrl(String u) {
            try {
                if (u == null || !u.startsWith("http")) return;
                Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse(u));
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(i);
            } catch (Exception ignored) {
            }
        }
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
                    boolean savedDl = saveToDownloads(zip, "limedrive-repo.zip");
                    int n = unzipRepo(zip, ensureOverrideRoot());
                    toast("OK: " + n + " файлов → private/www" + (savedDl ? " · ZIP → Downloads/limedrive-repo.zip" : "") + ". Reloading…");
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

    private boolean saveToDownloads(File src, String name) {
        try {
            if (Build.VERSION.SDK_INT < 29) return false;
            ContentValues cv = new ContentValues();
            cv.put(MediaStore.MediaColumns.DISPLAY_NAME, name);
            cv.put(MediaStore.MediaColumns.MIME_TYPE, "application/zip");
            cv.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
            Uri uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, cv);
            if (uri == null) return false;
            InputStream in = new FileInputStream(src);
            OutputStream os = getContentResolver().openOutputStream(uri);
            byte[] b = new byte[8192];
            int n;
            while ((n = in.read(b)) > 0) os.write(b, 0, n);
            os.close();
            in.close();
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private void pickZip() {
        Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        i.addCategory(Intent.CATEGORY_OPENABLE);
        i.setType("*/*");
        startActivityForResult(i, 42);
    }

    private static void copyStream(InputStream in, File out) throws Exception {
        FileOutputStream f = new FileOutputStream(out);
        byte[] b = new byte[8192];
        int n;
        while ((n = in.read(b)) > 0) f.write(b, 0, n);
        f.close();
        in.close();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != 42 || resultCode != RESULT_OK || data == null || data.getData() == null) return;
        final Uri picked = data.getData();
        toast("Unpacking…");
        new Thread(new Runnable() {
            public void run() {
                try {
                    File tmp = new File(getExternalFilesDir(null), "picked.zip");
                    copyStream(getContentResolver().openInputStream(picked), tmp);
                    int n = unzipRepo(tmp, ensureOverrideRoot());
                    tmp.delete();
                    toast("OK: " + n + " файлов → private/www. Reloading…");
                    runOnUiThread(new Runnable() {
                        public void run() { web.loadUrl(resolveStartUrl()); }
                    });
                } catch (final Exception e) {
                    toast("Import failed: " + e.getMessage());
                }
            }
        }).start();
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

    private static int countFiles(File dir) {
        int n = 0;
        File[] kids = dir.listFiles();
        if (kids != null) for (File k : kids) n += k.isDirectory() ? countFiles(k) : 1;
        return n;
    }

    private static int unzipRepo(File zip, File destRoot) throws Exception {
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
        File idx = new File(tmp, "index.html");
        if (!idx.exists()) {
            deleteRecursive(tmp);
            throw new Exception("в архиве нет index.html — нужен ZIP репозитория (GitHub → Code → Download ZIP)");
        }
        File old = destRoot;
        if (old.exists()) deleteRecursive(old);
        if (!tmp.renameTo(destRoot)) throw new Exception("rename failed");
        return countFiles(destRoot);
    }
}
