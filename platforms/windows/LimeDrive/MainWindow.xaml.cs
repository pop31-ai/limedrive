using System;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Net.Http;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Windows;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.Wpf;

namespace LimeDrive;

public partial class MainWindow : Window
{
    private string? _overrideBase;
    private DirectoryInfo? _overrideRoot;
    private bool _updating;
    private static readonly HttpClient Http = new() { Timeout = TimeSpan.FromSeconds(30) };
    private const string RepoZipUrl = "https://github.com/pop31-ai/limedrive/archive/refs/heads/main.zip";

    private static readonly Dictionary<string, string> Mime = new(StringComparer.OrdinalIgnoreCase)
    {
        ["html"] = "text/html", ["js"] = "application/javascript",
        ["json"] = "application/json", ["css"] = "text/css",
        ["png"] = "image/png", ["jpg"] = "image/jpeg", ["jpeg"] = "image/jpeg",
        ["gif"] = "image/gif", ["svg"] = "image/svg+xml", ["ico"] = "image/x-icon",
        ["md"] = "text/plain", ["txt"] = "text/plain", ["xml"] = "text/xml",
        ["webp"] = "image/webp", ["woff2"] = "font/woff2", ["woff"] = "font/woff",
        ["ttf"] = "font/ttf", ["mp3"] = "audio/mpeg", ["wav"] = "audio/wav",
        ["mp4"] = "video/mp4", ["webm"] = "video/webm",
    };

    public MainWindow()
    {
        InitializeComponent();
        Loaded += OnLoaded;
    }

    private void OnUpdate(object sender, RoutedEventArgs e) => UpdateFromGitHub();
    private void OnImportZip(object sender, RoutedEventArgs e) => ImportZip();

    private async void OnLoaded(object sender, RoutedEventArgs e)
    {
        var env = await CoreWebView2Environment.CreateAsync();
        await Web.EnsureCoreWebView2Async(env);

        Web.CoreWebView2.Settings.IsStatusBarEnabled = false;
        Web.CoreWebView2.Settings.AreDevToolsEnabled = true;
        Web.CoreWebView2.Settings.IsWebMessageEnabled = true;

        Web.CoreWebView2.WebResourceRequested += OnIntercept;
        Web.CoreWebView2.WebMessageReceived += OnWebMessage;
        Web.CoreWebView2.NavigationCompleted += (_, _) =>
        {
            if (Web.CoreWebView2 != null)
                Web.CoreWebView2.ExecuteScriptAsync("document.title");
        };

        Web.CoreWebView2.AddHostObjectToScript("bridge", new LimeBridge(this));
        Web.NavigateToString(LoadBundledIndex());
    }

    private string LoadBundledIndex()
    {
        var wwwDir = FindWwwDir();
        if (wwwDir != null)
        {
            var overrideIndex = new FileInfo(Path.Combine(wwwDir.FullName, "index.html"));
            if (overrideIndex.Exists)
            {
                _overrideRoot = wwwDir;
                _overrideBase = wwwDir.FullName.Replace('\\', '/') + "/";
                return File.ReadAllText(overrideIndex.FullName, Encoding.UTF8);
            }
        }

        var embedded = FindEmbeddedIndex();
        if (embedded != null) return embedded;

        return "<html><body style='background:#0A0A14;color:#e0e0e0;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh'><h2>LimeDrive — place engine files next to the exe</h2></body></html>";
    }

    private static DirectoryInfo? FindWwwDir()
    {
        var dir = new DirectoryInfo(AppDomain.CurrentDomain.BaseDirectory);
        for (int i = 0; i < 5; i++)
        {
            var candidate = new DirectoryInfo(Path.Combine(dir.FullName, "www"));
            if (candidate.Exists) return candidate;
            if (dir.Parent == null) break;
            dir = dir.Parent;
        }
        return null;
    }

    private static string? FindEmbeddedIndex()
    {
        var dir = new DirectoryInfo(AppDomain.CurrentDomain.BaseDirectory);
        var index = new FileInfo(Path.Combine(dir.FullName, "index.html"));
        if (index.Exists) return File.ReadAllText(index.FullName, Encoding.UTF8);
        return null;
    }

    private void OnIntercept(object? sender, CoreWebView2WebResourceRequestedEventArgs e)
    {
        try
        {
            var uri = new Uri(e.Request.Uri);
            if (uri.Scheme != "file") return;

            var localPath = uri.LocalPath;
            string? relativePath = null;

            if (_overrideRoot != null && _overrideBase != null &&
                localPath.Replace('\\', '/').StartsWith(_overrideBase, StringComparison.OrdinalIgnoreCase))
            {
                relativePath = localPath.Substring(_overrideBase.Length);
            }
            else if (localPath.Contains("\\www\\") || localPath.Contains("/www/"))
            {
                var idx = localPath.IndexOf("\\www\\", StringComparison.OrdinalIgnoreCase);
                if (idx < 0) idx = localPath.IndexOf("/www/", StringComparison.OrdinalIgnoreCase);
                if (idx >= 0) relativePath = localPath.Substring(idx + 5);
            }
            else if (localPath.Contains("\\LimeDrive\\") || localPath.Contains("/LimeDrive/"))
            {
                var idx = localPath.LastIndexOf("\\LimeDrive\\", StringComparison.OrdinalIgnoreCase);
                if (idx < 0) idx = localPath.LastIndexOf("/LimeDrive/", StringComparison.OrdinalIgnoreCase);
                if (idx >= 0)
                {
                    var after = localPath.Substring(idx + 11);
                    if (after.Contains('\\')) relativePath = after.Substring(after.IndexOf('\\') + 1);
                }
            }

            if (string.IsNullOrEmpty(relativePath)) return;

            var qIdx = relativePath.IndexOf('?');
            if (qIdx >= 0) relativePath = relativePath.Substring(0, qIdx);
            var hIdx = relativePath.IndexOf('#');
            if (hIdx >= 0) relativePath = relativePath.Substring(0, hIdx);
            relativePath = Uri.UnescapeDataString(relativePath);
            if (relativePath.Contains("..")) return;

            byte[]? data = null;

            if (_overrideRoot != null)
            {
                var file = new FileInfo(Path.Combine(_overrideRoot.FullName, relativePath.Replace('/', '\\')));
                if (file.Exists) data = File.ReadAllBytes(file.FullName);
            }

            if (data == null)
            {
                var assetDir = new DirectoryInfo(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "www"));
                var file = new FileInfo(Path.Combine(assetDir.FullName, relativePath.Replace('/', '\\')));
                if (file.Exists) data = File.ReadAllBytes(file.FullName);
            }

            if (data == null) return;

            var ext = Path.GetExtension(relativePath).TrimStart('.').ToLowerInvariant();
            var contentType = Mime.TryGetValue(ext, out var m) ? m : "application/octet-stream";
            var stream = new MemoryStream(data);
            var headers = "Access-Control-Allow-Origin: *\r\n";
            var resp = Web.CoreWebView2.Environment.CreateWebResourceResponse(
                stream, 200, "OK", headers);
            e.Response = resp;
        }
        catch { }
    }

    private void OnWebMessage(object? sender, CoreWebView2WebMessageReceivedEventArgs e)
    {
        try
        {
            var json = e.WebMessageAsJson;
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;
            if (root.TryGetProperty("action", out var action))
            {
                switch (action.GetString())
                {
                    case "openUrl":
                        if (root.TryGetProperty("url", out var url))
                            Process.Start(new ProcessStartInfo(url.GetString()!) { UseShellExecute = true });
                        break;
                    case "launchApp":
                        if (root.TryGetProperty("webUrl", out var webUrl))
                            Process.Start(new ProcessStartInfo(webUrl.GetString()!) { UseShellExecute = true });
                        break;
                    case "update":
                        Dispatcher.BeginInvoke(UpdateFromGitHub);
                        break;
                    case "importZip":
                        Dispatcher.BeginInvoke(ImportZip);
                        break;
                }
            }
        }
        catch { }
    }

    private async void UpdateFromGitHub()
    {
        if (_updating) return;
        _updating = true;
        Status.Text = "Downloading…";
        try
        {
            var zipPath = Path.Combine(Path.GetTempPath(), "limedrive-repo.zip");
            using (var resp = await Http.GetAsync(RepoZipUrl))
            {
                resp.EnsureSuccessStatusCode();
                await using var fs = File.Create(zipPath);
                await resp.Content.CopyToAsync(fs);
            }

            var target = EnsureOverrideRoot();
            var count = UnzipRepo(zipPath, target);

            Status.Text = $"OK: {count} files → www. Reloading…";
            var index = new FileInfo(Path.Combine(target.FullName, "index.html"));
            if (index.Exists)
            {
                _overrideRoot = target;
                _overrideBase = target.FullName.Replace('\\', '/') + "/";
                Web.CoreWebView2.Navigate(_overrideBase + "index.html");
            }
        }
        catch (Exception ex)
        {
            Status.Text = $"Update failed: {ex.Message}";
        }
        finally
        {
            _updating = false;
        }
    }

    private void ImportZip()
    {
        var dlg = new Microsoft.Win32.OpenFileDialog
        {
            Title = "Import ZIP",
            Filter = "ZIP files (*.zip)|*.zip|All files (*.*)|*.*"
        };
        if (dlg.ShowDialog() != true) return;

        Status.Text = "Unpacking…";
        Task.Run(() =>
        {
            try
            {
                var target = EnsureOverrideRoot();
                var count = UnzipRepo(dlg.FileName, target);
                Dispatcher.BeginInvoke(() =>
                {
                    Status.Text = $"OK: {count} files → www. Reloading…";
                    _overrideRoot = target;
                    _overrideBase = target.FullName.Replace('\\', '/') + "/";
                    Web.CoreWebView2.Navigate(_overrideBase + "index.html");
                });
            }
            catch (Exception ex)
            {
                Dispatcher.BeginInvoke(() => Status.Text = $"Import failed: {ex.Message}");
            }
        });
    }

    private DirectoryInfo EnsureOverrideRoot()
    {
        var www = new DirectoryInfo(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "www"));
        if (!www.Exists) www.Create();
        return www;
    }

    private static int UnzipRepo(string zipPath, DirectoryInfo destRoot)
    {
        var tmp = new DirectoryInfo(Path.Combine(destRoot.Parent!.FullName, "www_incoming"));
        if (tmp.Exists) tmp.Delete(true);
        tmp.Create();

        ZipFile.ExtractToDirectory(zipPath, tmp.FullName);

        var repoDir = tmp.GetDirectories().FirstOrDefault();
        if (repoDir == null || !File.Exists(Path.Combine(repoDir.FullName, "index.html")))
        {
            tmp.Delete(true);
            throw new Exception("ZIP does not contain index.html — use GitHub → Code → Download ZIP");
        }

        foreach (var file in repoDir.GetFiles("*", SearchOption.AllDirectories))
        {
            var rel = file.FullName.Substring(repoDir.FullName.Length + 1);
            if (rel.StartsWith(".git") || rel == ".gitignore") continue;
            var dest = Path.Combine(destRoot.FullName, rel);
            var dir = Path.GetDirectoryName(dest);
            if (dir != null && !Directory.Exists(dir)) Directory.CreateDirectory(dir);
            file.CopyTo(dest, true);
        }

        var count = Directory.GetFiles(destRoot.FullName, "*", SearchOption.AllDirectories).Length;
        return count;
    }

    private void OnClosing(object? sender, System.ComponentModel.CancelEventArgs e)
    {
        Web?.Dispose();
    }

    [ComVisible(true)]
    public class LimeBridge
    {
        private readonly MainWindow _win;
        public LimeBridge(MainWindow win) => _win = win;

        public void OpenUrl(string url)
        {
            if (!string.IsNullOrEmpty(url) && url.StartsWith("http"))
                Process.Start(new ProcessStartInfo(url) { UseShellExecute = true });
        }

        public void LaunchApp(string pkg, string webUrl)
        {
            if (!string.IsNullOrEmpty(webUrl))
                Process.Start(new ProcessStartInfo(webUrl) { UseShellExecute = true });
        }

        public void Update() => _win.UpdateFromGitHub();
        public void ImportZip() => _win.ImportZip();
    }
}
